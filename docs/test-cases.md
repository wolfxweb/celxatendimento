# celx-atendimento - Test Cases

## 🔐 Authentication Tests

### Login API
| ID | Test Case | Endpoint | Method | Auth | Expected Result |
|----|-----------|----------|--------|------|-----------------|
| AUTH-001 | Login with valid admin credentials | `/auth/login` | POST | None | 200 + access_token |
| AUTH-002 | Login with valid customer credentials | `/auth/login` | POST | None | 200 + access_token |
| AUTH-003 | Login with invalid email | `/auth/login` | POST | None | 401 Invalid credentials |
| AUTH-004 | Login with invalid password | `/auth/login` | POST | None | 401 Invalid credentials |
| AUTH-005 | Login with empty body | `/auth/login` | POST | None | 422 Validation error |
| AUTH-006 | Register new user | `/auth/register` | POST | None | 201 + UserResponse |
| AUTH-007 | Register duplicate email | `/auth/register` | POST | None | 400 Email exists |

### Login Frontend (E2E)
| ID | Test Case | Role |
|----|-----------|------|
| AUTH-E2E-001 | Login as Super Admin | superadmin@celx.com.br / 123456 |
| AUTH-E2E-002 | Login as Admin | admin@teste.com / 123456 |
| AUTH-E2E-003 | Login as Atendente | atendente@teste.com / 123456 |
| AUTH-E2E-004 | Login as Cliente | cliente@teste.com / 123456 |
| AUTH-E2E-005 | Login with wrong password | - | 401 shown |
| AUTH-E2E-006 | Logout and redirect to login | - | Token cleared |

---

## 🎫 Ticket Tests

### Ticket API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| TICK-001 | Create ticket as customer | `/tickets/` | POST | Bearer | 201 Created |
| TICK-002 | Create ticket with all fields | `/tickets/` | POST | Bearer | 201 + ticket_number |
| TICK-003 | Create ticket - missing subject | `/tickets/` | POST | Bearer | 422 Validation |
| TICK-004 | Create ticket - subject too short | `/tickets/` | POST | Bearer | 422 Validation |
| TICK-005 | List tickets as customer | `/tickets/` | GET | Bearer | 200 (only own) |
| TICK-006 | List tickets as agent | `/tickets/` | GET | Bearer | 200 (all company) |
| TICK-007 | List tickets with status filter | `/tickets/` | GET | Bearer | 200 filtered |
| TICK-008 | Get ticket by ID | `/tickets/{id}` | GET | Bearer | 200 + messages |
| TICK-009 | Get non-existent ticket | `/tickets/{id}` | GET | Bearer | 404 |
| TICK-010 | Update ticket status | `/tickets/{id}` | PATCH | Bearer | 200 |
| TICK-011 | Assign ticket to agent | `/tickets/{id}/assign` | POST | Agent | 200 |
| TICK-012 | Customer cannot assign | `/tickets/{id}/assign` | POST | Customer | 403 |
| TICK-013 | Add message to ticket | `/tickets/{id}/messages` | POST | Bearer | 200 |
| TICK-014 | Add internal note | `/tickets/{id}/messages` | POST | Bearer | is_internal=true |
| TICK-015 | Rate own ticket | `/tickets/{id}/rate` | POST | Customer | 200 |
| TICK-016 | Customer cannot rate others | `/tickets/{id}/rate` | POST | Customer | 403 |
| TICK-017 | Delete ticket | `/tickets/{id}` | DELETE | Bearer | 204 |

### Ticket Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| TICK-E2E-001 | View my tickets list | /dashboard/cliente/tickets |
| TICK-E2E-002 | Filter tickets by status | /dashboard/cliente/tickets?status=open |
| TICK-E2E-003 | Create new ticket form | /dashboard/cliente/tickets/novo |
| TICK-E2E-004 | Create ticket - success | /dashboard/cliente/tickets/novo |
| TICK-E2E-005 | Create ticket - validation error | /dashboard/cliente/tickets/novo |
| TICK-E2E-006 | View ticket detail | /dashboard/cliente/tickets/{id} |
| TICK-E2E-007 | Send message on ticket | /dashboard/cliente/tickets/{id} |
| TICK-E2E-008 | Close ticket | /dashboard/cliente/tickets/{id} |
| TICK-E2E-009 | Rate resolved ticket | /dashboard/cliente/tickets/{id} |
| TICK-E2E-010 | View related tickets tab | /dashboard/cliente/tickets/{id} |
| TICK-E2E-011 | View audit log tab | /dashboard/cliente/tickets/{id} |

---

## 🤖 AI Approval Tests

### AI API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| AI-001 | Approve AI response | `/tickets/{id}/ai/approve` | POST | Agent | 200 |
| AI-002 | Reject AI response | `/tickets/{id}/ai/reject` | POST | Agent | 200 |
| AI-003 | Reject without reason | `/tickets/{id}/ai/reject` | POST | Agent | 422 |
| AI-004 | Edit AI response | `/tickets/{id}/ai/edit` | POST | Agent | 200 |
| AI-005 | Submit AI feedback | `/tickets/{id}/ai/feedback` | POST | Agent | 200 |
| AI-006 | Mark as good example | `/tickets/{id}/ai/example` | POST | Agent | 200 |
| AI-007 | Get AI stats | `/tickets/ai/stats` | GET | Agent | 200 |
| AI-008 | Customer cannot approve | `/tickets/{id}/ai/approve` | POST | Customer | 403 |

### AI Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| AI-E2E-001 | View pending AI approvals | /dashboard/atendente/aprovacao |
| AI-E2E-002 | View AI response details | /dashboard/atendente/aprovacao |
| AI-E2E-003 | Approve AI response | /dashboard/atendente/aprovacao |
| AI-E2E-004 | Reject AI response with reason | /dashboard/atendente/aprovacao |
| AI-E2E-005 | Edit AI response | /dashboard/atendente/aprovacao |
| AI-E2E-006 | Submit feedback | /dashboard/atendente/aprovacao |
| AI-E2E-007 | Mark as good/bad example | /dashboard/atendente/aprovacao |
| AI-E2E-008 | View AI stats | /dashboard/atendente/aprovacao |

---

## 👥 User Management Tests

### User API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| USER-001 | Get current user | `/users/me` | GET | Bearer | 200 |
| USER-002 | List all users | `/users/` | GET | Superadmin | 200 |
| USER-003 | Get user by ID | `/users/{id}` | GET | Superadmin | 200 |
| USER-004 | Create user | `/users/` | POST | Superadmin | 201 |
| USER-005 | Create user - duplicate email | `/users/` | POST | Superadmin | 400 |
| USER-006 | Update user | `/users/{id}` | PUT | Bearer | 200 |
| USER-007 | Deactivate user | `/users/{id}` | PUT | Bearer | 200 is_active=false |
| USER-008 | Admin cannot access | `/users/` | GET | Admin | 403 |

### User Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| USER-E2E-001 | View user list | /dashboard/admin/usuarios |
| USER-E2E-002 | Create new user | /dashboard/admin/usuarios |
| USER-E2E-003 | Edit user | /dashboard/admin/usuarios |
| USER-E2E-004 | Toggle user active status | /dashboard/admin/usuarios |
| USER-E2E-005 | Reset user password | /dashboard/admin/usuarios |

---

## 🏢 Company Management Tests

### Company API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| COMP-001 | List all companies | `/companies/` | GET | Superadmin | 200 |
| COMP-002 | Get own company | `/companies/{id}` | GET | Bearer | 200 |
| COMP-003 | Approve company | `/companies/{id}/approve` | POST | Superadmin | 200 |
| COMP-004 | Reject company | `/companies/{id}/reject` | POST | Superadmin | 200 |
| COMP-005 | Suspend company | `/companies/{id}/suspend` | POST | Superadmin | 200 |
| COMP-006 | Non-superadmin cannot list | `/companies/` | GET | Admin | 403 |

### Company Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| COMP-E2E-001 | View companies list | /dashboard/superadmin/empresas |
| COMP-E2E-002 | Filter companies by status | /dashboard/superadmin/empresas |
| COMP-E2E-003 | Approve pending company | /dashboard/superadmin/empresas |
| COMP-E2E-004 | Reject company | /dashboard/superadmin/empresas |
| COMP-E2E-005 | Suspend company | /dashboard/superadmin/empresas |

---

## 📚 Knowledge Base Tests

### Knowledge API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| KB-001 | List all articles | `/knowledge/` | GET | Bearer | 200 |
| KB-002 | Get article by ID | `/knowledge/{id}` | GET | Bearer | 200 |
| KB-003 | Create article | `/knowledge/` | POST | Admin | 201 |
| KB-004 | Update article | `/knowledge/{id}` | PUT | Admin | 200 |
| KB-005 | Delete article | `/knowledge/{id}` | DELETE | Admin | 204 |
| KB-006 | Toggle article active | `/knowledge/{id}` | PUT | Admin | 200 |
| KB-007 | Get indexing status | `/knowledge/status/indexing` | GET | Bearer | 200 |

### Knowledge Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| KB-E2E-001 | View knowledge articles | /dashboard/admin/conhecimento |
| KB-E2E-002 | Create new article | /dashboard/admin/conhecimento |
| KB-E2E-003 | Edit article | /dashboard/admin/conhecimento |
| KB-E2E-004 | Toggle article status | /dashboard/admin/conhecimento |
| KB-E2E-005 | Delete article | /dashboard/admin/conhecimento |

---

## ⚙️ AI Configuration Tests

### AI Config API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| AICFG-001 | Get AI config | `/ai-config/` | GET | Bearer | 200 |
| AICFG-002 | Update AI config | `/ai-config/` | PUT | Admin | 200 |
| AICFG-003 | Save API key | `/ai-config/api-key` | POST | Admin | 200 |
| AICFG-004 | Test API key | `/ai-config/test` | POST | Admin | 200 |
| AICFG-005 | Get available models | `/ai-config/models` | GET | Bearer | 200 |
| AICFG-006 | Get available tools | `/ai-config/tools` | GET | Bearer | 200 |
| AICFG-007 | Update tools | `/ai-config/tools` | PUT | Admin | 200 |
| AICFG-008 | Customer cannot configure | `/ai-config/` | PUT | Customer | 403 |

### AI Config Frontend (E2E)
| ID | Test Case | Path |
|----|-----------|------|
| AICFG-E2E-001 | View AI configuration | /dashboard/admin/config-ia |
| AICFG-E2E-002 | Change LLM model | /dashboard/admin/config-ia |
| AICFG-E2E-003 | Change temperature | /dashboard/admin/config-ia |
| AICFG-E2E-004 | Save API key | /dashboard/admin/config-ia |
| AICFG-E2E-005 | Test API key | /dashboard/admin/config-ia |
| AICFG-E2E-006 | Edit system prompt | /dashboard/admin/config-ia/prompt-editor |
| AICFG-E2E-007 | Insert variables | /dashboard/admin/config-ia/prompt-editor |
| AICFG-E2E-008 | Preview prompt | /dashboard/admin/config-ia/prompt-editor |
| AICFG-E2E-009 | Restore default prompt | /dashboard/admin/config-ia/prompt-editor |

---

## 📑 Category Tests

### Category API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| CAT-001 | List categories | `/categories/` | GET | Bearer | 200 |
| CAT-002 | Get category by ID | `/categories/{id}` | GET | Bearer | 200 |
| CAT-003 | Create category | `/categories/` | POST | Admin | 201 |
| CAT-004 | Update category | `/categories/{id}` | PATCH | Admin | 200 |
| CAT-005 | Delete category | `/categories/{id}` | DELETE | Admin | 204 |
| CAT-006 | Customer cannot create | `/categories/` | POST | Customer | 403 |

---

## 📎 Attachment Tests

### Attachment API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| ATT-001 | Upload attachment | `/tickets/{id}/attachments` | POST | Bearer | 200 |
| ATT-002 | Upload PDF | `/tickets/{id}/attachments` | POST | Bearer | 200 |
| ATT-003 | Upload image | `/tickets/{id}/attachments` | POST | Bearer | 200 |
| ATT-004 | Upload too large file | `/tickets/{id}/attachments` | POST | Bearer | 413 |
| ATT-005 | Upload invalid type | `/tickets/{id}/attachments` | POST | Bearer | 400 |
| ATT-006 | List attachments | `/tickets/{id}/attachments` | GET | Bearer | 200 |
| ATT-007 | Delete attachment | `/tickets/{id}/attachments/{id}` | DELETE | Bearer | 204 |
| ATT-008 | Get attachment stats | `/tickets/{id}/attachments/stats` | GET | Bearer | 200 |

---

## 💰 Plan Tests

### Plan API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| PLAN-001 | List all plans (public) | `/plans/` | GET | None | 200 |
| PLAN-002 | Get plan by ID (public) | `/plans/{id}` | GET | None | 200 |
| PLAN-003 | Create plan | `/plans/` | POST | Superadmin | 201 |
| PLAN-004 | Update plan | `/plans/{id}` | PUT | Superadmin | 200 |
| PLAN-005 | Delete plan | `/plans/{id}` | DELETE | Superadmin | 204 |
| PLAN-006 | Toggle plan active | `/plans/{id}` | PUT | Superadmin | 200 |
| PLAN-007 | Non-admin cannot create | `/plans/` | POST | Admin | 403 |

---

## 🔗 Ticket Relations Tests

### Relations API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| REL-001 | Get related tickets | `/tickets/{id}/relations` | GET | Bearer | 200 |
| REL-002 | Add relation | `/tickets/{id}/relations` | POST | Bearer | 201 |
| REL-003 | Create duplicate relation | `/tickets/{id}/relations` | POST | Bearer | 201 |
| REL-004 | Delete relation | `/tickets/{id}/relations/{rel_id}` | DELETE | Bearer | 204 |

---

## 📋 Ticket Audit Log Tests

### Audit API
| ID | Test Case | Endpoint | Method | Auth | Expected |
|----|-----------|----------|--------|------|----------|
| AUDIT-001 | Get ticket audit log | `/tickets/{id}/audit-log` | GET | Bearer | 200 |
| AUDIT-002 | Verify status change logged | `/tickets/{id}/audit-log` | GET | Bearer | contains status change |
| AUDIT-003 | Verify assignment logged | `/tickets/{id}/audit-log` | GET | Bearer | contains assignment |

---

## 🔄 Agent Ticket Workflow Tests

### Agent E2E
| ID | Test Case | Path |
|----|-----------|------|
|AGT-E2E-001 | View all tickets | /dashboard/atendente/tickets |
| AGENT-E2E-002 | Filter tickets by status | /dashboard/atendente/tickets |
| AGENT-E2E-003 | Open ticket detail | /dashboard/atendente/tickets/{id} |
| AGENT-E2E-004 | Assign ticket to self | /dashboard/atendente/tickets/{id} |
| AGENT-E2E-005 | Send customer message | /dashboard/atendente/tickets/{id} |
| AGENT-E2E-006 | Send internal note | /dashboard/atendente/tickets/{id} |
| AGENT-E2E-007 | Change ticket status | /dashboard/atendente/tickets/{id} |
| AGENT-E2E-008 | Resolve ticket | /dashboard/atendente/tickets/{id} |

---

## 📊 Dashboard Tests

### Dashboard E2E
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| DASH-E2E-001 | Superadmin dashboard | Superadmin | Menu: Empresas, Planos |
| DASH-E2E-002 | Admin dashboard | Admin | Menu: Usuarios, Config IA, Conhecimento |
| DASH-E2E-003 | Agent dashboard | Agent | Menu: Tickets, Aprovar IA |
| DASH-E2E-004 | Customer dashboard | Customer | Menu: Meus Tickets |

---

## Priority Matrix

| Priority | Test Cases |
|----------|------------|
| **P0 (Critical)** | AUTH-001-007, TICK-001, TICK-005, TICK-008, TICK-013 |
| **P1 (High)** | TICK-011, AI-001, AI-002, USER-001, USER-002 |
| **P2 (Medium)** | CAT-001-006, ATT-001-008, REL-001-004, KB-001-007 |
| **P3 (Low)** | PLAN-001-007, AUDIT-001-003, COMP-001-006 |

---

## Test Users

| Email | Senha | Role |
|-------|-------|------|
| superadmin@celx.com.br | 123456 | Super Admin |
| admin@teste.com | 123456 | Admin |
| atendente@teste.com | 123456 | Atendente |
| cliente@teste.com | 123456 | Cliente |

---

## Test Data Setup

### Required for API tests:
1. Company with ID `company_id`
2. Users with roles: superadmin, admin, agent, customer
3. Categories: at least 2
4. Ticket with ID `ticket_id`
5. Ticket with status `pending_ai`
6. AI config with valid API key

### Required for E2E tests:
1. All 4 user roles logged in
2. Sample tickets in various statuses
3. Sample knowledge articles
4. Companies in various statuses (pending, active)
