# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.ts >> Authentication >> AUTH-E2E-002: Login as Customer
- Location: frontend/tests/e2e.spec.ts:68:7

# Error details

```
Error: Channel closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e11]:
      - generic [ref=e13]: C
      - heading "celx-atendimento" [level=1] [ref=e14]
      - paragraph [ref=e15]: Sistema inteligente de tickets com agentes de IA para suporte ao cliente
      - generic [ref=e16]:
        - generic [ref=e17]:
          - generic [ref=e18]: ✓
          - generic [ref=e19]: Respostas automáticas com IA
        - generic [ref=e20]:
          - generic [ref=e21]: ✓
          - generic [ref=e22]: Aprovação humana
        - generic [ref=e23]:
          - generic [ref=e24]: ✓
          - generic [ref=e25]: Base de conhecimento RAG
      - link "Acessar Sistema →" [ref=e26] [cursor=pointer]:
        - /url: /login
        - generic [ref=e27]: Acessar Sistema
        - generic [ref=e28]: →
      - generic [ref=e29]:
        - generic [ref=e30]: FastAPI
        - generic [ref=e32]: Next.js
        - generic [ref=e34]: LangGraph
        - generic [ref=e36]: PostgreSQL
  - alert [ref=e38]
```