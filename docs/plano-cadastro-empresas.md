# Plano de Implementação: Cadastro de Empresas

## 📋 Visão Geral

**Objetivo:** Implementar funcionalidade completa de cadastro de empresas para superadmin
**Rota:** `/dashboard/superadmin/empresas`
**Status Atual:** Parcialmente implementado (listagem, aprovação/rejeição existem, mas criação não)

---

## 🔄 O que Existe

| Componente | Status |
|------------|--------|
| Schema banco (companies) | ✅ Completo |
| Model SQLAlchemy | ✅ Completo |
| Listar empresas (GET) | ✅ Completo |
| Detalhes empresa (GET) | ✅ Completo |
| Aprovar empresa (POST) | ✅ Completo |
| Rejeitar empresa (POST) | ✅ Completo |
| Suspender empresa (POST) | ✅ Completo |
| Listagem frontend | ✅ Completo |
| Filtros frontend | ✅ Completo |
| **Criar empresa (POST)** | ❌ Faltando |
| **Botão Nova Empresa** | ❌ Faltando |
| **Formulário de cadastro** | ❌ Faltando |

---

## 🎯 Funcionalidades a Implementar

### 1. Backend: POST `/companies`

**Arquivo:** `backend/app/api/v1/routes/companies.py`

**Campos obrigatórios:**
- `name` (string, max 255)
- `contact_email` (string, email válido)
- `contact_name` (string, max 255)

**Campos opcionais:**
- `domain` (string, unique, max 255)
- `contact_phone` (string, max 50)
- `billing_email` (string, email)
- `timezone` (string, default: 'America/Sao_Paulo')
- `locale` (string, default: 'pt-BR')
- `settings` (JSONB, default: {})

**Retorno:** Empresa criada com status `pending`

**Validações:**
- Email deve ser válido e único no sistema
- Domain deve ser único se fornecido
- Nome deve ter entre 3-255 caracteres

---

### 2. Frontend: Botão "Nova Empresa"

**Arquivo:** `frontend/app/(dashboard)/superadmin/empresas/page.tsx`

**Localização:** Header da página, ao lado do título

**Comportamento:**
- Botão com ícone "+" e texto "Nova Empresa"
- Abre modal/formulário de cadastro

---

### 3. Frontend: Formulário de Cadastro

**Arquivo:** Novo componente `frontend/app/(dashboard)/superadmin/empresas/components/CompanyForm.tsx`

**Campos do formulário:**
| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Nome da empresa | text | ✅ | min 3, max 255 |
| Domínio | text | ❌ | URL válida (opcional) |
| Nome do contato | text | ✅ | max 255 |
| Email do contato | email | ✅ | email válido |
| Telefone | tel | ❌ | formato livre |
| Email de cobrança | email | ❌ | email válido |

**Características:**
- Modal com título "Nova Empresa"
- Botões: "Cancelar" e "Cadastrar"
- Loading state durante submit
- Toast de sucesso/erro

---

## 📁 Estrutura de Arquivos

```
frontend/app/(dashboard)/superadmin/empresas/
├── page.tsx                    # Página principal (atualizar)
├── components/
│   └── CompanyForm.tsx         # NOVO - Formulário de cadastro
└── loading.tsx                 # NOVO - Loading state

backend/app/api/v1/routes/
└── companies.py                # ATUALIZAR - adicionar POST
```

---

## ✅ Critérios de Aceite

### Backend
- [ ] POST `/companies` cria empresa com status `pending`
- [ ] Retorna 201 com empresa criada
- [ ] Retorna 400 se email já existe
- [ ] Retorna 400 se domain já existe
- [ ] Retorna 422 se campos obrigatórios faltando

### Frontend
- [ ] Botão "Nova Empresa" visível na página
- [ ] Modal abre ao clicar no botão
- [ ] Validação de campos obrigatórios funciona
- [ ] Submit chama API e atualiza lista
- [ ] Toast de sucesso aparece após cadastro
- [ ] Toast de erro aparece se falhar

---

## 🚀 Ordem de Implementação

1. **Backend** - Criar endpoint POST `/companies`
2. **Frontend** - Criar componente CompanyForm.tsx
3. **Frontend** - Integrar botão na página principal
4. **Testes** - Validar fluxo completo

---

## 📝 Notas Técnicas

- Superadmin deve estar autenticado (verificar role)
- Empresa criada não aparece automaticamente - precisa ser aprovada
- Após criação, superadmin pode aprobar/rejeitar conforme fluxo existente
