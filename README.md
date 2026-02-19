# Sistema Escolar API

> API do sistema escolar para autenticacao, usuarios, alunos, turmas, presencas, avisos e eventos.

---

## Introducao da API

A API expoe endpoints REST para gestao escolar e e consumida pelo frontend.
O formato padrao e JSON e, quando ha upload de imagens, utiliza `multipart/form-data`.

Base URL (desenvolvimento):
`http://localhost:4457/api`

Uploads estaticos:
`http://localhost:4457/uploads`

### Autenticacao

- Rotas protegidas exigem o header `x-api-key` com o valor configurado em `API_KEY` no `.env`.
- O login usa JWT armazenado em cookie HTTP-only (`authToken`).
- A variavel `JWT_SECRET` no `.env` e obrigatoria para assinar e validar tokens.
- Em chamadas pelo browser, use `credentials: "include"` para enviar o cookie.

### Padrao de erros

As respostas de erro seguem o formato:

```json
{ "error": "mensagem" }
```

### Upload de imagens

- Campo do arquivo: `avatar`
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Limite: 5 MB

Documentacao completa da API:
`./docs/api.md`

---

## Como iniciar

Para manter a organizacao, o guia detalhado de configuracao de ambiente, instalacao de dependencias e setup do banco de dados foi movido para a pasta de documentacao.

[Acesse o Guia de Inicializacao (Passo a Passo)](./docs/start.md)

---

## Setup rapido (TL;DR)

Se voce ja esta familiarizado com o projeto e precisa apenas dos comandos essenciais:

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variaveis de ambiente
cp .env.example .env

# 3. Gerar cliente do banco (Prisma)
npx prisma generate

# 4. Iniciar servidor de desenvolvimento
npm run dev
```
