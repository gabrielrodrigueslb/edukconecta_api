# Documentacao da API

## Visao geral

Base URL:
`http://localhost:4457/api`

Uploads estaticos:
`http://localhost:4457/uploads`

Formato:
- JSON em quase todas as rotas
- `multipart/form-data` nas rotas de upload de imagem

## Autenticacao e seguranca

API Key:
- Envie o header `x-api-key` em todas as rotas protegidas (todas exceto `/auth/*`).
- O valor vem de `API_KEY` no `.env` do backend.

JWT e cookie:
- `POST /api/auth/login` cria o cookie HTTP-only `authToken`.
- `POST /api/auth/logout` remove o cookie.
- `GET /api/auth/me` exige o cookie valido.
- `JWT_SECRET` no `.env` e obrigatorio para assinar e validar tokens.

Uso no browser:
- Ative envio de cookies com `credentials: "include"`.

Uploads:
- Campo de arquivo: `avatar`
- Tipos aceitos: `image/jpeg`, `image/png`, `image/webp`
- Limite: 5 MB

## Padrao de erros

Formato comum:
```json
{ "error": "mensagem" }
```

Codigos usados no codigo:
- 400 para validacoes e erros de negocio
- 401 quando faltam credenciais
- 403 para API Key invalida
- 500 para falhas internas em algumas rotas

## Modelos

### User (resposta)
- `id` (string)
- `name` (string)
- `email` (string)
- `avatarUrl` (string | null)
- `createdAt` (datetime)

### Guardian (entrada/saida de aluno)
- `full_name` (string)
- `cpf` (string)
- `relationship` (string)
- `phone` (string)
- `email` (string, opcional)
- `address` (string, opcional)
- `notes` (string, opcional)

### Student (resposta)
- `id` (string)
- `full_name` (string)
- `foto_aluno` (string | null) - caminho relativo como `/uploads/avatars/...`
- `birth_date` (YYYY-MM-DD)
- `grade` (string)
- `shift` (string | null)
- `status` ("Ativo" | "Inativo")
- `class_id` (string | "")
- `origin_school` (string)
- `cpf` (string)
- `address` (string)
- `allergies` (string)
- `blood_type` (string)
- `medical_reports` (string)
- `medications` (string)
- `behavior_notes` (string)
- `difficulty_subjects` (string[])
- `difficulty_reaction` (string)
- `previous_tutoring` (boolean | null)
- `performance_indicator` (string)
- `created_at` (datetime)
- `guardians` (Guardian[])

### Turma (resposta)
- `id` (string)
- `name` (string)
- `grade` (string)
- `shift` (string)
- `days_of_week` (string[])
- `start_time` (HH:mm)
- `end_time` (HH:mm)
- `status` (string)
- `max_students` (number)
- `created_at` (datetime)

### Presenca (resposta)
- `id` (string)
- `student_id` (string)
- `date` (YYYY-MM-DD)
- `shift` (string)
- `status` ("Presente" | "Justificado" | "Ausente")
- `justification` (string)
- `class_id` (string | undefined)
- `created_date` (datetime)

### Aviso (resposta)
- `id` (string)
- `title` (string)
- `content` (string)
- `date` (YYYY-MM-DD)
- `is_active` (boolean)
- `priority` (string)

### Evento (resposta)
- `id` (string)
- `title` (string)
- `description` (string)
- `event_type` (string)
- `date` (YYYY-MM-DD)
- `start_time` (HH:mm)
- `end_time` (HH:mm)
- `color` (string | null)

## Endpoints

### Auth

#### POST /api/auth/login
Requer:
```json
{ "email": "...", "password": "..." }
```
Resposta:
```json
{ "user": { "id": "...", "name": "...", "avatarUrl": "...", "email": "...", "role": "..." } }
```
Observacao: seta o cookie `authToken` (HTTP-only).

#### POST /api/auth/logout
Requer cookie `authToken` valido.
Resposta:
```json
{ "message": "Logout realizado" }
```

#### GET /api/auth/me
Requer cookie `authToken` valido.
Resposta: objeto de usuario (mesmo formato do login).

### Users

Todas as rotas abaixo exigem header `x-api-key`.

#### POST /api/user/createUser
Suporta JSON ou `multipart/form-data`.
Campos JSON:
- `name` (string, obrigatorio)
- `email` (string, obrigatorio)
- `password` (string, obrigatorio)

Upload:
- `avatar` (file, opcional)

Resposta: User.

#### GET /api/user/getUsers
Resposta: User[].

#### GET /api/user/getUserById/:id
Resposta: User.

#### DELETE /api/user/deleteUser/:id
Resposta:
```json
{ "id": "...", "name": "...", "email": "..." }
```

#### PUT /api/user/updateUser/:id
Suporta JSON ou `multipart/form-data`.
Campos JSON (opcionais):
- `name`
- `email`
- `password`

Upload:
- `avatar` (file, opcional)

Resposta: User atualizado.

### Alunos

Todas as rotas abaixo exigem header `x-api-key`.

#### GET /api/alunos
Resposta: Student[].

#### GET /api/alunos/:id
Resposta: Student.

#### POST /api/alunos
Campos obrigatorios:
- `full_name`
- `birth_date` (YYYY-MM-DD)
- `grade`
- `cpf`
- `address`

Campos opcionais:
- `shift`
- `status` ("Ativo" | "Inativo" | "Matriculado")
- `class_id`
- `origin_school`
- `allergies`
- `blood_type`
- `medical_reports`
- `medications`
- `behavior_notes`
- `difficulty_subjects` (string[])
- `difficulty_reaction`
- `previous_tutoring` (boolean | null)
- `performance_indicator`
- `guardians` (Guardian[])

Resposta: Student.

#### PUT /api/alunos/:id
Mesmos campos do POST, todos opcionais.
Observacao: `class_id` vazio remove o aluno da turma.

#### PUT /api/alunos/:id/foto
`multipart/form-data` com o arquivo em `avatar`.
Resposta: Student atualizado (com `foto_aluno`).

#### DELETE /api/alunos/:id
Resposta:
```json
{ "id": "..." }
```

### Turmas

Todas as rotas abaixo exigem header `x-api-key`.

#### GET /api/turmas
Resposta: Turma[].

#### GET /api/turmas/:id
Resposta: Turma.

#### POST /api/turmas
Campos obrigatorios:
- `name`
- `grade`
- `shift`

Campos opcionais:
- `days_of_week` (string[])
- `start_time` (HH:mm)
- `end_time` (HH:mm)
- `status`
- `max_students` (number)

Resposta: Turma.

#### PUT /api/turmas/:id
Mesmos campos do POST, todos opcionais.

#### DELETE /api/turmas/:id
Resposta:
```json
{ "id": "..." }
```

### Presencas

Todas as rotas abaixo exigem header `x-api-key`.

#### GET /api/presencas
Query obrigatoria:
- `date` (YYYY-MM-DD)
- `turno`

Query opcional:
- `turmaId`

Resposta: Presenca[].

#### GET /api/presencas/history
Query obrigatoria:
- `from` (YYYY-MM-DD)
- `to` (YYYY-MM-DD)
- `turno`

Query opcional:
- `turmaId`

Resposta: Presenca[].

#### GET /api/presencas/aluno/:alunoId
Query opcional:
- `from` (YYYY-MM-DD)
- `to` (YYYY-MM-DD)

Resposta: Presenca[].

#### POST /api/presencas/chamada
Request:
```json
{
  "date": "YYYY-MM-DD",
  "turno": "Manha|Tarde",
  "turmaId": "1",
  "records": [
    { "student_id": "...", "status": "Presente" },
    { "student_id": "...", "status": "Justificado", "justification": "..." },
    { "student_id": "...", "status": "Ausente" }
  ]
}
```
Resposta: Presenca[] da chamada substituida.

### Avisos

Todas as rotas abaixo exigem header `x-api-key`.

#### GET /api/avisos
Retorna apenas avisos ativos.
Resposta: Aviso[].

#### POST /api/avisos
Campos obrigatorios:
- `title`
- `content`

Campos opcionais:
- `date` (YYYY-MM-DD)
- `is_active` (boolean)
- `priority` (string)

Resposta: Aviso.

#### PUT /api/avisos/:id
Mesmos campos do POST, todos opcionais.

#### DELETE /api/avisos/:id
Resposta:
```json
{ "id": "..." }
```

### Eventos

Todas as rotas abaixo exigem header `x-api-key`.

#### GET /api/eventos
Query opcional:
- `from` (YYYY-MM-DD)
- `to` (YYYY-MM-DD)

Resposta: Evento[].

#### POST /api/eventos
Campos obrigatorios:
- `title`
- `event_type`
- `date` (YYYY-MM-DD)

Campos opcionais:
- `description`
- `start_time` (HH:mm)
- `end_time` (HH:mm)
- `color`

Resposta: Evento.

#### PUT /api/eventos/:id
Mesmos campos do POST, todos opcionais.

#### DELETE /api/eventos/:id
Resposta:
```json
{ "id": "..." }
```
