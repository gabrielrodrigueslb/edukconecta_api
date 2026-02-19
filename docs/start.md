
# 🚀 Inicialização do Projeto — Node.js + Prisma

Este documento descreve **passo a passo** como preparar o ambiente, configurar o banco de dados e iniciar a API corretamente após clonar o repositório.

---

## 📦 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- **Node.js** (versão recomendada pelo projeto)
- **npm** (incluso com o Node)
- **Banco de dados** compatível com o projeto (PostgreSQL / MySQL / SQLite)
- **Git**

---

## 📥 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
````


## 📦 2. Instalar dependências

```bash
npm install
```

> Caso ocorram erros estranhos de dependências, consulte a seção **Problemas comuns** no final do documento.


## 🔐 3. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto (caso não exista):

```bash
cp .env.example .env
```

Configure a variável de conexão com o banco de dados:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/nome_do_banco?schema=public"
```

> Ajuste os valores conforme o banco e credenciais utilizadas.

Defina também as variáveis usadas pela autenticação da API:

```env
API_KEY="sua-chave-da-api"
JWT_SECRET="um-segredo-longo-e-aleatorio"
```

> `API_KEY` é usado para autenticar chamadas protegidas pela API.  
> `JWT_SECRET` é obrigatório para assinar e validar os tokens de login.


## 🧬 4. Gerar o Prisma Client

Esse passo é **obrigatório** para que a API funcione corretamente:

```bash
npx prisma generate
```


## 🗄️ 5. Criar ou sincronizar o banco de dados

Verifique se existe a pasta:

```text
prisma/migrations
```

### ✅ Caso EXISTAM migrations

Use as migrations versionadas:

```bash
npx prisma migrate dev
```

### ⚠️ Caso NÃO existam migrations

Empurre o schema diretamente para o banco:

```bash
npx prisma db push
```


## 🔍 6. Conferir o banco com Prisma Studio (opcional)

```bash
npx prisma studio
```

Uma interface web será aberta para visualização das tabelas e dados.


## ▶️ 7. Iniciar a API

Liste os scripts disponíveis:

```bash
npm run
```

Normalmente, para ambiente de desenvolvimento:

```bash
npm run dev
```

Ou para produção:

```bash
npm start
```


## 🌐 8. Testar a API

Após iniciar, a API geralmente estará disponível em:

```text
http://localhost:3000
```

ou na porta definida no arquivo `.env`.

Teste um endpoint simples (ex: health check ou listagem).



## 🛠️ Problemas comuns

### ❌ Prisma Client não encontrado

```bash
npx prisma generate
```



### ❌ Erro: `Environment variable not found: DATABASE_URL`

* Confirme que o arquivo `.env` existe
* Verifique se `DATABASE_URL` está corretamente definida



### ❌ Erros de engine / arquivos `.wasm`

Certifique-se de que as versões estão alinhadas:

```bash
npm ls prisma @prisma/client
```

Ambos devem estar na **mesma versão**.

Se necessário, faça uma reinstalação limpa:

```bash
rm -rf node_modules package-lock.json
npm install
```



## ✅ Checklist rápido de inicialização

```text
✔ Repositório clonado
✔ npm install
✔ .env configurado
✔ npx prisma generate
✔ migrate dev OU db push
✔ npm run dev
```

Se todos os itens acima foram concluídos com sucesso, o projeto está pronto para uso 🚀


