# Programa Feminino de Definição

Este é o projeto do seu funil de alta conversão para o Programa Feminino de Definição.

## 🚀 Como fazer o Deploy para o GitHub

Se você encontrar erros de "Authentication failed" ou "Missing credentials" ao dar `git push`, siga estes passos:

1.  **Limpar erro de AskPass**:
    No terminal, execute:
    ```bash
    unset GIT_ASKPASS
    ```

2.  **Configurar Autenticação**:
    O GitHub exige um **Personal Access Token (PAT)** em vez da sua senha de login.
    - Vá em GitHub > Settings > Developer Settings > Personal Access Tokens (Classic).
    - Gere um novo token com permissão de `repo`.
    - Copie o token.

3.  **Enviar Alterações**:
    ```bash
    git add .
    git commit -m "Minhas alterações"
    git push
    ```
    - **Username**: Seu usuário do GitHub.
    - **Password**: Cole o **Token** que você copiou (ele não aparecerá enquanto você cola, é normal).

## 🛠️ Tecnologias
- NextJS 15 (App Router)
- Tailwind CSS
- Genkit (IA para personalização)
- Recharts (Gráficos de evolução)
- UTMify (Rastreamento)
