# SPEC: Cadastro de Empresas - Super Admin

## 1. Overview

**Task:** Implementar cadastro completo de empresas para superadmin
**URL:** `/dashboard/superadmin/empresas`
**Status:** Backend parcial, frontend sem formulário

---

## 2. Backend Changes

### 2.1 New Pydantic Schemas

**File:** `backend/app/api/v1/routes/companies.py`

Add at top of file:
```python
class CompanyCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    domain: Optional[str] = Field(None, max_length=255)
    contact_name: str = Field(..., min_length=1, max_length=255)
    contact_email: str = Field(..., min_length=5, max_length=255)
    contact_phone: Optional[str] = Field(None, max_length=50)
    billing_email: Optional[str] = Field(None, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)  # Admin password
    timezone: str = Field(default="America/Sao_Paulo", max_length=50)
    locale: str = Field(default="pt-BR", max_length=10)
```

### 2.2 New POST Endpoint

**File:** `backend/app/api/v1/routes/companies.py`

Add after imports, before existing endpoints:

```python
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=dict)
async def create_company(
    company_data: CompanyCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_superuser),
):
    """Create a new company (superadmin only) with admin user"""

    from sqlalchemy import select
    from app.models.company import Company
    from app.models.user import User
    from app.core.security import hash_password

    # Check domain uniqueness
    if company_data.domain:
        result = await db.execute(
            select(Company).where(Company.domain == company_data.domain)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Domain already registered",
            )

    # Check email uniqueness
    result = await db.execute(
        select(Company).where(Company.contact_email == company_data.contact_email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create company
    new_company = Company(
        name=company_data.name,
        domain=company_data.domain,
        contact_name=company_data.contact_name,
        contact_email=company_data.contact_email,
        contact_phone=company_data.contact_phone,
        billing_email=company_data.billing_email,
        timezone=company_data.timezone,
        locale=company_data.locale,
        status="pending",  # Requires superadmin approval
        settings={},
    )

    db.add(new_company)
    await db.flush()  # Get company ID

    # Create admin user for the company
    admin_user = User(
        company_id=new_company.id,
        email=company_data.contact_email,
        hashed_password=hash_password(company_data.password),
        full_name=company_data.contact_name,
        role="admin",
        is_active=True,
        is_email_verified=True,
    )

    db.add(admin_user)
    await db.commit()
    await db.refresh(new_company)

    return {
        "id": str(new_company.id),
        "name": new_company.name,
        "domain": new_company.domain,
        "contact_email": new_company.contact_email,
        "contact_name": new_company.contact_name,
        "status": new_company.status,
        "created_at": new_company.created_at.isoformat() if new_company.created_at else None,
        "admin_user": {
            "email": admin_user.email,
            "role": admin_user.role,
        },
    }
```

---

## 3. Frontend Changes

### 3.1 Create CompanyForm Component

**File:** `frontend/app/dashboard/superadmin/empresas/components/CompanyForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/api'

interface CompanyFormProps {
  onSuccess: () => void
  onClose: () => void
}

export default function CompanyForm({ onSuccess, onClose }: CompanyFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    billing_email: '',
    password: '',
    confirm_password: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || formData.name.length < 3) {
      setError('Nome da empresa deve ter pelo menos 3 caracteres')
      return
    }
    if (!formData.contact_name.trim()) {
      setError('Nome do contato é obrigatório')
      return
    }
    if (!formData.contact_email.includes('@')) {
      setError('Email de contato inválido')
      return
    }
    if (formData.password.length < 8) {
      setError('Senha deve ter pelo menos 8 caracteres')
      return
    }
    if (formData.password !== formData.confirm_password) {
      setError('Senhas não conferem')
      return
    }

    setLoading(true)
    try {
      const { confirm_password, ...payload } = formData
      await apiPost('/companies', payload)
      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Erro ao criar empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Nova Empresa</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: Empresa XYZ Ltda"
              minLength={3}
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Domínio
            </label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: empresaxyz.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do Contato *
            </label>
            <input
              type="text"
              value={formData.contact_name}
              onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email do Contato *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: joao@empresa.com.br"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: (11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email de Cobrança
            </label>
            <input
              type="email"
              value={formData.billing_email}
              onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              placeholder="Ex: financeiro@empresa.com.br"
            />
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Conta do Administrador</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha do Admin *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
              />
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha *
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 text-white font-medium shadow hover:shadow-glow-primary transition-all disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### 3.2 Update Page Component

**File:** `frontend/app/dashboard/superadmin/empresas/page.tsx`

Add state for modal:
```typescript
const [showForm, setShowForm] = useState(false)
```

Add button in header section (after `<p className="text-slate-500 mt-1">`):
```typescript
<button
  onClick={() => setShowForm(true)}
  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 text-white font-medium shadow hover:shadow-glow-primary transition-all"
>
  + Nova Empresa
</button>
```

Add Modal render at end of return:
```typescript
{showForm && (
  <CompanyForm
    onSuccess={() => {
      setShowForm(false)
      loadCompanies()
    }}
    onClose={() => setShowForm(false)}
  />
)}
```

Add import:
```typescript
import CompanyForm from './components/CompanyForm'
```

---

## 4. File Structure

```
frontend/app/dashboard/superadmin/empresas/
├── page.tsx                    # UPDATE - add button + modal
└── components/
    └── CompanyForm.tsx         # NEW
```

---

## 5. API Contract

### POST /api/v1/companies

**Request:**
```json
{
  "name": "Empresa XYZ Ltda",
  "domain": "empresaxyz.com.br",
  "contact_name": "João Silva",
  "contact_email": "joao@empresaxyz.com.br",
  "contact_phone": "(11) 99999-9999",
  "billing_email": "financeiro@empresaxyz.com.br",
  "timezone": "America/Sao_Paulo",
  "locale": "pt-BR"
}
```

**Success Response (201):**
```json
{
  "id": "1",
  "name": "Empresa XYZ Ltda",
  "domain": "empresaxyz.com.br",
  "contact_email": "joao@empresaxyz.com.br",
  "contact_name": "João Silva",
  "status": "pending",
  "created_at": "2026-05-02T19:30:00"
}
```

**Error Responses:**
- 400: "Domain already registered" / "Email already registered"
- 422: Validation error (missing required fields)
- 403: "Only superadmins can access"

---

## 6. Acceptance Criteria

### Backend
- [ ] POST /companies creates company with status "pending"
- [ ] Returns 201 with created company data
- [ ] Returns 400 if domain already exists
- [ ] Returns 400 if email already exists
- [ ] Returns 403 if user is not superadmin

### Frontend
- [ ] "Nova Empresa" button visible in header
- [ ] Click opens modal with form
- [ ] Form validates required fields
- [ ] Submit calls API and shows loading
- [ ] Success closes modal and refreshes list
- [ ] Error shows error message in form

---

## 7. Test Plan

### 7.1 Backend API Tests - POST /companies

**Base URL:** `http://localhost:8000/api/v1`

**Auth:** Bearer token (superadmin user)

#### Test Cases

| ID | Description | Preconditions | Request | Expected Response |
|----|-------------|---------------|---------|-------------------|
| **TC-BE-01** | Criar empresa com dados válidos | Superadmin logado, email único | `{name, domain, contact_name, contact_email, ...}` | 201 + empresa created |
| **TC-BE-02** | Criar empresa sem domínio | Superadmin logado, email único | `{name, contact_name, contact_email}` | 201 + empresa without domain |
| **TC-BE-03** | Criar empresa com email duplicado | Superadmin logado, empresa existente | `{name: "Nova", contact_email: "existing@test.com"}` | 400 "Email already registered" |
| **TC-BE-04** | Criar empresa com domínio duplicado | Superadmin logado, empresa com domínio | `{name: "Nova", domain: "existing.com", contact_email: "new@test.com"}` | 400 "Domain already registered" |
| **TC-BE-05** | Criar empresa sem nome | Superadmin logado | `{contact_name: "Test", contact_email: "test@test.com"}` | 422 Validation error |
| **TC-BE-06** | Criar empresa com nome curto (<3) | Superadmin logado | `{name: "AB", contact_name: "Test", contact_email: "test@test.com"}` | 422 Validation error |
| **TC-BE-07** | Criar empresa sem email de contato | Superadmin logado | `{name: "Test Company", contact_name: "Test"}` | 422 Validation error |
| **TC-BE-08** | Criar empresa sem nome do contato | Superadmin logado | `{name: "Test Company", contact_email: "test@test.com"}` | 422 Validation error |
| **TC-BE-09** | Criar empresa com email inválido | Superadmin logado | `{name: "Test", contact_name: "Test", contact_email: "not-an-email"}` | 422 Validation error |
| **TC-BE-10** | Criar empresa sem autenticação | - | `{...}` | 401 Unauthorized |
| **TC-BE-11** | Criar empresa com usuário não-superadmin | User agent | `{...}` | 403 Forbidden |
| **TC-BE-12** | Listar empresas após criação | Superadmin logado, empresa criada | GET /companies | 200 + empresa na lista |

**Test Script (curl):**

```bash
# TC-BE-01: Criar empresa válida
curl -X POST http://localhost:8000/api/v1/companies \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste Ltda",
    "domain": "teste.com.br",
    "contact_name": "João Silva",
    "contact_email": "joao@teste.com.br",
    "contact_phone": "(11) 99999-9999",
    "billing_email": "financeiro@teste.com.br"
  }'

# TC-BE-03: Email duplicado
curl -X POST http://localhost:8000/api/v1/companies \
  -H "Authorization: Bearer <SUPERADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Duplicada",
    "contact_name": "Teste",
    "contact_email": "joao@teste.com.br"
  }'
# Expected: 400 {"detail": "Email already registered"}

# TC-BE-11: Criar como não-superadmin
curl -X POST http://localhost:8000/api/v1/companies \
  -H "Authorization: Bearer <AGENT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa Teste",
    "contact_name": "Teste",
    "contact_email": "test@test.com"
  }'
# Expected: 403 {"detail": "Only superadmins can access"}
```

---

### 7.2 Frontend E2E Tests - /dashboard/superadmin/empresas

**Tools:** Playwright ou Selenium

#### Test Cases

| ID | Description | Steps | Expected Result |
|----|-------------|-------|-----------------|
| **TC-FE-01** | Exibir botão "Nova Empresa" | Acessar página empresas | Botão visível no header |
| **TC-FE-02** | Abrir modal ao clicar no botão | Clicar em "Nova Empresa" | Modal abre com formulário |
| **TC-FE-03** | Fechar modal com Cancelar | Clicar Cancelar | Modal fecha, semChanges |
| **TC-FE-04** | Fechar modal clicando fora | Clicar backdrop | Modal fecha |
| **TC-FE-05** | Validar campo Nome vazio | Submeter sem nome | Msg: "Nome da empresa deve ter pelo menos 3 caracteres" |
| **TC-FE-06** | Validar campo Contato vazio | Preencher só nome, submeter | Msg: "Nome do contato é obrigatório" |
| **TC-FE-07** | Validar email inválido | Inserir email sem @ | Msg: "Email de contato inválido" |
| **TC-FE-08** | Criar empresa com sucesso | Preencher todos campos + Submit | Modal fecha + empresa aparece na lista |
| **TC-FE-09** | Mostrar loading durante submit | Clicar Cadastrar | Botão mostra "Criando..." + disabled |
| **TC-FE-10** | Mostrar erro de API | API retorna erro | Msg de erro aparece no formulário |
| **TC-FE-11** | Atualizar lista após criação | Criar empresa | Lista recarrega com nova empresa |

**Test Script (Playwright):**

```typescript
// TC-FE-01 + TC-FE-02: Verificar botão e abrir modal
test('deve exibir botão Nova Empresa e abrir modal', async ({ page }) => {
  await page.goto('/dashboard/superadmin/empresas')

  // Verificar botão existe
  const newCompanyBtn = page.locator('button:has-text("Nova Empresa")')
  await expect(newCompanyBtn).toBeVisible()

  // Clicar para abrir modal
  await newCompanyBtn.click()

  // Verificar modal aberto
  const modal = page.locator('h2:has-text("Nova Empresa")')
  await expect(modal).toBeVisible()
})

// TC-FE-05: Validar nome obrigatório
test('deve mostrar erro para nome vazio', async ({ page }) => {
  await page.goto('/dashboard/superadmin/empresas')
  await page.click('button:has-text("Nova Empresa")')

  // Preencher só email e contato (sem nome)
  await page.fill('input[type="email"]', 'test@test.com')
  await page.fill('input[placeholder*="João"]', 'João Silva')

  // Submeter
  await page.click('button:has-text("Cadastrar")')

  // Verificar erro
  await expect(page.locator('text=Nome da empresa deve ter pelo menos 3 caracteres')).toBeVisible()
})

// TC-FE-08: Criar empresa com sucesso
test('deve criar empresa e fechar modal', async ({ page }) => {
  await page.goto('/dashboard/superadmin/empresas')
  await page.click('button:has-text("Nova Empresa")')

  // Preencher formulário
  await page.fill('input[placeholder*="Empresa XYZ"]', 'Empresa E2E Teste')
  await page.fill('input[placeholder*="João"]', 'Maria Santos')
  await page.fill('input[type="email"]', 'maria@e2e.com.br')

  // Submeter
  await page.click('button:has-text("Cadastrar")')

  // Aguardar modal fechar
  await expect(page.locator('h2:has-text("Nova Empresa")')).not.toBeVisible()

  // Verificar empresa na lista
  await expect(page.locator('text=Empresa E2E Teste')).toBeVisible()
})
```

---

## 8. Test Execution Checklist

### Pre-conditions
- [ ] Docker containers running (`docker compose up -d`)
- [ ] Superadmin user created and authenticated
- [ ] Test company data cleaned (for duplicate tests)

### Backend Tests Execution Order
1. [ ] TC-BE-01 → TC-BE-02 → TC-BE-03 → TC-BE-04 (validations)
2. [ ] TC-BE-05 → TC-BE-06 → TC-BE-07 → TC-BE-08 → TC-BE-09 (validation errors)
3. [ ] TC-BE-10 → TC-BE-11 (auth errors)
4. [ ] TC-BE-12 (integration)

### Frontend Tests Execution Order
1. [ ] TC-FE-01 → TC-FE-02 (basic flow)
2. [ ] TC-FE-03 → TC-FE-04 (close modal)
3. [ ] TC-FE-05 → TC-FE-06 → TC-FE-07 (validations)
4. [ ] TC-FE-09 → TC-FE-10 → TC-FE-11 (submit flow)
