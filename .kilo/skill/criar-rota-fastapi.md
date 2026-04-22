# Skill: Criar Rota FastAPI

## Descrição
Use esta habilidade quando o usuário pedir para criar um novo endpoint na API Backend (FastAPI).

## Passos para Execução
1. **Verificar a estrutura**: Vá até a pasta `backend/app/api/`. Verifique se já existe um arquivo ou roteador (`router`) para o domínio solicitado (ex: `tickets.py`, `users.py`).
2. **Modelos e Schemas**: Antes de escrever a rota, verifique `backend/app/models/` para os modelos de banco de dados (SQLAlchemy) e `backend/app/schemas/` para os modelos Pydantic de validação de entrada/saída.
3. **Criar a Rota**:
   - Utilize `@router.get`, `@router.post`, etc.
   - Utilize a injeção de dependência padrão para a sessão do banco de dados: `db: Session = Depends(get_db)`.
   - Adicione tipagem completa e defina `response_model` no decorador.
4. **Regra de Negócio**: Não coloque a lógica pesada de negócios diretamente na rota. Chame um serviço/crud em `backend/app/crud/` ou invoque um fluxo do LangGraph se envolver IA.
5. **Registro**: Se um novo arquivo de roteador for criado, lembre-se de incluí-lo em `backend/app/main.py` ou `backend/app/api/api.py` usando `app.include_router()`.
6. **Teste**: Sugira ao usuário rodar a aplicação localmente e checar o Swagger em `http://localhost:8000/docs` para garantir que a rota apareceu corretamente.
