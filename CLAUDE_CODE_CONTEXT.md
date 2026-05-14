# Contexto do Projeto AnatoQuizUp — Para Claude Code

> **Versão deste documento:** 2.4 (atualizada em 2026-05-13 — snapshot pós-migração para Quiz-Service)
> **Verdade-base:** o código nos repositórios. Quando este documento e o código discordarem, **o código vence** e este documento deve ser atualizado.
>
> **🆕 Mudança estrutural recente (2026-05-13):** o projeto passou a ter **BFF + Backend/Auth + Quiz-Service**. Frontend consome **somente o BFF**, que repassa para Backend/Auth, Quiz-Service ou AI futuro. Detalhes em §26 e na PRD `arquitetura/prd-migracao-quiz-service.md` no repo Doc.
>
> **🆕 Migração concluída (2026-05-13):** `/questoes` saiu do Backend e passou para o **Quiz-Service**, com banco próprio. O Backend agora fica focado em autenticação, identidade e admin.
>
> **⚠️ Trechos parcialmente desatualizados:** §3 (estruturas de pasta), §7 (escopo R1), §22 (checklist) e §24 (BFF antes do Quiz-Service) descrevem histórico. Para **estado atual do código (2026-05-13)** ver §26.1. As convenções de §5, §6, §8 e §11 continuam válidas.
>
> **🇧🇷 Padrão de idioma do projeto: PORTUGUÊS BRASILEIRO em TUDO** — modelos, enums Prisma, middlewares, endpoints, respostas JSON, tipos de domínio em frontend e backend, nome de pastas e arquivos. Inglês só onde a stack obriga (palavras-chave de linguagem, dependências externas, padrões de framework). Esta é uma decisão consolidada do time em 26/04/2026 — não inventar híbridos PT/EN.

---

## 1. Visão Geral

**AnatoQuizUp** é uma plataforma web gamificada de quiz de anatomia para alunos de medicina da UnB. É uma reconstrução total de um projeto anterior (AnatoQuiz v1) que nunca foi deployado. O produto herda ~600 questões validadas por professores, mas todo o código é feito do zero.

- **Disciplina:** EPS (Engenharia de Produto de Software) — UnB 2026.1
- **Time:** 12 pessoas (Ana Catarina, Arthur Carneiro, Breno Soares, Bruno Ricardo, Caio Brandão, Genilson Silva, João Vitor, Kathlyn Murussi, Maria Luisa, Miguel Moreira, Pedro Cabaceira, Victor Hugo)
- **Sprint atual:** Release Major 1 — sprint única ~17/04 a 27/04/2026
- **Deploy:** https://anatoquizup.vercel.app (frontend) + Railway (backend + banco) — ainda em provisionamento

**Organização GitHub:** `fga-eps-mds`
**Repositórios (atualizados 2026-05-13):**
- `2026-1-AnatoQuizUp-Web` — frontend (este repo)
- `2026-1-AnatoQuizUp-BFF` — Backend-For-Frontend (ponto de entrada público; orquestra Backend/Auth, Quiz-Service e AI futuro).
- `2026-1-AnatoQuizUp-Backend` — Backend/Auth: autenticação, identidade, admin e exemplos. Privado em produção. **Antes este repo se chamava `-API`.**
- `2026-1-AnatoQuizUp-Quiz-Service` — serviço privado dono de `/questoes`, models de quiz, Quiz DB e storage de imagens de questões.
- `2026-1-AnatoQuizUp-AI` — serviço de IA (placeholder; vazio em R1, será iniciado em semestres futuros)
- `2026-1-AnatoQuizUp-Doc` — documentação MkDocs (também recebe `metrics.json` automatizado dos repos de código via CI)

---

## 2. Stack Tecnológica

### Backend/Auth (`2026-1-AnatoQuizUp-Backend`)

| Item | Versão / Escolha |
| --- | --- |
| Runtime | Node.js **24+** (`.nvmrc` = 24; `engines.node >= 24.0.0`) |
| Linguagem | TypeScript 5.9 (strict) |
| Framework HTTP | **Express 5.1** |
| ORM | Prisma 6.17 |
| Banco | PostgreSQL **18** (alpine, via docker-compose) |
| Validação | Zod 4 |
| Hash de senha | **bcryptjs** 3 (não `bcrypt`) — 10 salt rounds |
| Logs | **Pino 10** + `pino-http` 11 |
| Segurança HTTP | **Helmet** 8 |
| CORS | `cors` 2.8 |
| Bundling/exec dev | `tsx` 4 (com `tsconfig-paths`) |
| Build | `tsc` + `tsc-alias` (resolve aliases `@/*`) |
| Lint | ESLint 9 + `typescript-eslint` 8 + `eslint-config-prettier` |
| Format | Prettier 3 |
| Testes | **Jest ainda NÃO instalado** — só existem pastas `__tests__/` e `tests/e2e/` (placeholders com `.gitkeep`). A meta é Jest com cobertura ≥ 85%, mas a stack ainda não está montada. |
| Container | Docker (Dockerfile multi-stage; `docker-compose.yml` só sobe o Postgres em dev) |

### Frontend (`2026-1-AnatoQuizUp-Web`)

| Item | Versão / Escolha |
| --- | --- |
| Framework | **React 19** |
| Linguagem | TypeScript ~6.0 |
| Build/dev | **Vite 8** |
| Roteamento | **React Router 7** (`react-router-dom` v7) |
| Estilo | **Tailwind CSS 4** (via `@tailwindcss/vite`) |
| HTTP client | **Axios** 1.15 |
| Estado | **Zustand 5** (instalado, mas hoje o estado de auth ainda usa React Context — `AuthProvider`) |
| Ícones | **lucide-react** |
| Testes | **Jest 30** + `@swc/jest` + `@testing-library/{react,jest-dom,user-event}` + `jest-environment-jsdom` |
| Lint | ESLint 9 + `typescript-eslint` 8 + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh` |

### Documentação (`2026-1-AnatoQuizUp-Doc`)

- **MkDocs Material** (`mkdocs.yml`, `requirements.txt`)
- Workflow `deploy.yml` faz deploy do site
- Recebe automaticamente `metrics/backend/latest.json` e `metrics/frontend/latest.json` via CI dos repos de código (token `DOC_PUSH_TOKEN`)

### Hospedagem & CI

- **Frontend:** Vercel (https://anatoquizup.vercel.app)
- **Backend/Auth + Quiz-Service + bancos:** Railway (deploy de teste)
- **CI:** GitHub Actions — pipelines `CI - Backend` e `CI - Frontend`
- **Análise estática:** SonarCloud
  - Backend/Auth: `fga-eps-mds_2026-1-AnatoQuizUp-Backend` (org `fga-eps-mds`)
  - Quiz-Service: `fga-eps-mds_2026-1-AnatoQuizUp-Quiz-Service` (org `fga-eps-mds`)
  - Frontend: project key `fga-eps-mds_2026-1-AnatoQuizUp-Front`
- **Quality gate:** cobertura mínima 85% (verificada em `coverage-summary.json`); SonarCloud quality gate bloqueia merge

> ⚠️ **Atenção `coverageReporters`:** o gate de 85% lê `coverage/coverage-summary.json`. O frontend já configura `coverageReporters: ['text', 'lcov', 'json-summary']` (`jest.config.cjs`). O backend ainda **não tem Jest configurado** — quando for adicionar, inclua `json-summary`.

---

## 3. Estrutura de Pastas — REAL

### Backend

```
2026-1-AnatoQuizUp-Backend/
├── .github/
│   ├── ISSUE_TEMPLATE/{01_user_story.md, 02_bug_report.md, 03_task.md}
│   ├── workflows/ci.yml
│   └── pull_request_template.md
├── prisma/
│   ├── migrations/
│   │   ├── 20260412130000_init/                      ← cria tabela `exemplos`
│   │   └── 20260425160320_adicionar_usuarios_autenticacao/  ← cria usuarios, refresh_tokens, tokens_redefinicao_senha
│   ├── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts                                        ← cria 1 admin (upsert)
├── src/
│   ├── config/
│   │   ├── app.ts          ← monta Express, CORS, Helmet, rotas, error handler
│   │   ├── db.ts           ← PrismaClient singleton + connect/disconnect
│   │   ├── env.ts          ← validação de env com Zod
│   │   └── logger.ts       ← Pino + pinoHttp
│   ├── modules/
│   │   └── exemplo/        ← MÓDULO DE REFERÊNCIA (manter intocado para novos módulos seguirem o mesmo padrão)
│   │       ├── __tests__/.gitkeep
│   │       ├── dto/
│   │       │   ├── criar.exemplo.types.ts
│   │       │   ├── listar.exemplos.types.ts
│   │       │   └── resposta.exemplo.types.ts
│   │       ├── exemplo.controller.ts
│   │       ├── exemplo.repository.ts
│   │       ├── exemplo.routes.ts
│   │       ├── exemplo.schemas.ts
│   │       ├── exemplo.service.ts
│   │       └── index.ts
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── mensagens.ts
│   │   │   └── papeis.ts                              ← ALUNO | PROFESSOR | ADMINISTRADOR (Prisma enum ainda usa ADMIN — migration de renome pendente, ver §22)
│   │   ├── errors/
│   │   │   ├── codigos-de-erro.ts                     ← REQUISICAO_INVALIDA, ERRO_DE_VALIDACAO, NAO_AUTORIZADO, PROIBIDO, NAO_ENCONTRADO, CONFLITO, NAO_IMPLEMENTADO, ERRO_INTERNO
│   │   │   └── erro-aplicacao.ts                      ← classe `ErroAplicacao`
│   │   ├── middlewares/
│   │   │   ├── autenticacao.middleware.ts             ← STUB (responde 501 NAO_IMPLEMENTADO)
│   │   │   ├── papeis.middleware.ts                   ← STUB (responde 501)
│   │   │   ├── tratamento-erros.middleware.ts         ← já trata ErroAplicacao + Prisma errors
│   │   │   └── validacao.middleware.ts                ← `validarRequisicao(schema, "body"|"query"|"params")`
│   │   ├── types/
│   │   │   ├── api.types.ts                           ← RespostaApiSucesso, RespostaApiErro, RespostaPaginada
│   │   │   └── comuns.types.ts                        ← Nullable, Optional
│   │   └── utils/
│   │       ├── dados.util.ts                          ← converterParaIsoString
│   │       ├── formatacao.util.ts                     ← normalizarEspacos
│   │       └── paginacao.util.ts                      ← resolverParametrosPaginacao, montarMetadadosPaginacao
│   └── server.ts                                      ← bootstraps app + graceful shutdown
├── tests/e2e/.gitkeep
├── .env.example
├── .nvmrc                  (24)
├── docker-compose.yml      (apenas Postgres)
├── Dockerfile              (multi-stage)
├── eslint.config.js
├── prisma.config.ts
├── sonar-project.properties
└── tsconfig.json           (paths: { "@/*": ["./src/*"] })
```

**O que NÃO existe ainda no backend (precisa ser criado para a Release Major 1):**
- Módulos `auth/`, `user/`, `admin/` (apenas o `exemplo/` está pronto como template)
- `shared/utils/jwt.ts` (assinar/verificar tokens)
- `shared/services/emailService.ts` (envio de email para reset de senha)
- Suite de testes (Jest ainda não está instalado)
- Variáveis JWT/admin/email no `.env.example`

### Frontend

```
2026-1-AnatoQuizUp-Web/
├── .github/{ISSUE_TEMPLATE, workflows/ci.yml, pull_request_template.md}
├── public/                  (vazio por enquanto, exceto referências em index.html)
├── src/
│   ├── app/
│   │   ├── App.tsx                              ← monta AuthProvider + BrowserRouter + AppRouter
│   │   ├── App.test.tsx
│   │   ├── router.tsx                           ← Routes: /login, AuthenticatedLayout(/, /home), wildcard → /home
│   │   ├── layouts/
│   │   │   ├── AuthenticatedLayout.tsx          ← wrapper com Header lateral + Outlet
│   │   │   └── AuthenticatedLayout.test.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx                 ← Context: { user, isAuthenticated, login, logout }; persiste tokens em localStorage
│   │   │   └── AuthProvider.test.tsx
│   │   └── styles/global.css                    ← Tailwind import
│   ├── pages/
│   │   ├── home/{index.ts, ui/HomePage.{tsx,test.tsx}}
│   │   └── login/{index.ts, ui/LoginPage.{tsx,test.tsx}}
│   ├── widgets/
│   │   └── header/{index.ts, ui/Header.{tsx,test.tsx}}    ← sidebar/drawer responsivo, com toggle "Ver como aluno" (US07) e item "Gerenciar Usuários" para ADMIN
│   ├── features/
│   │   └── auth-by-credencials/                 ← ⚠️ TYPO + idioma: renomear para `autenticacao-por-credenciais/` (ver §22)
│   │       ├── model/authService.{ts,test.ts}   ← loginWithCredencials (com mocks de e-mails de teste)
│   │       └── ui/LoginForm.{tsx,test.tsx}      ← form, botão Microsoft, botão admin, link cadastro
│   ├── entities/
│   │   └── user/model/types.ts                  ← ⚠️ ainda em inglês (Role/User/UserStatus/AuthProviderType) — refatorar para `entities/usuario/` em PT (§22)
│   ├── shared/
│   │   ├── api/
│   │   │   ├── httpClient.ts                    ← axios + interceptor que injeta Bearer do localStorage
│   │   │   ├── httpClient.test.ts
│   │   │   └── config.ts                        ← API_CONFIG.baseURL
│   │   ├── assets/image/logo.png
│   │   ├── config/env.ts                        ← API_BASE_URL
│   │   └── ui/
│   │       ├── button/Button.{tsx,test.tsx}
│   │       └── input/Input.{tsx,test.tsx}
│   ├── __mocks__/{fileMock.ts, styleMock.ts}    ← Jest static asset stubs
│   ├── main.tsx
│   └── setupTests.ts
├── eslint.config.js
├── jest.config.cjs                              ← swc/jest, jsdom, coverageReporters: text/lcov/json-summary
├── tsconfig.{json,app.json,node.json}
├── vite.config.ts                               ← apenas plugin Tailwind (sem plugin-react explícito)
├── Dockerfile
└── index.html
```

**O que NÃO existe ainda no frontend (precisa ser criado para a Release Major 1):**
- Páginas: `register`, `professor-login`, `professor-register`, `professor-pending`, `admin-login`, `forgot-password`, `reset-password`, `admin-users`, `admin-user-details`, `not-found`
- Features: `register-student`, `register-professor`, `recover-password`, `switch-view` (a lógica de "ver como aluno" hoje vive **dentro** do `Header`, e não como feature separada), `manage-users`
- Mecanismo de rotas protegidas por role (o `AuthenticatedLayout` apenas renderiza Header + Outlet, não redireciona unauth)

---

## 4. Modelagem do Banco de Dados (Prisma) — VERDADE

```prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db    { provider = "postgresql"; url = env("DATABASE_URL") }

model Exemplo {
  id        String   @id @default(cuid())
  nome      String
  descricao String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("exemplos")
}

enum PerfilUsuario  { ALUNO PROFESSOR ADMIN }
enum StatusUsuario  { PENDENTE ATIVO INATIVO RECUSADO }
enum NivelEducacional { ENSINO_MEDIO GRADUACAO POS_GRADUACAO MESTRADO DOUTORADO OUTRO }

model Usuario {
  id    String @id @default(cuid())
  nome  String
  email String @unique
  senha String

  perfil PerfilUsuario
  status StatusUsuario @default(ATIVO)

  // Aluno
  instituicao      String?
  curso            String?
  semestre         Int?
  estado           String?
  cidade           String?
  nacionalidade    String?
  dataNascimento   DateTime?
  nivelEducacional NivelEducacional?

  // Professor
  departamento String?
  siape        String? @unique

  // Aprovação
  aprovadoPorId String?
  aprovadoEm    DateTime?

  refreshTokens          RefreshToken[]
  tokensRedefinicaoSenha TokenRedefinicaoSenha[]

  criadoEm     DateTime  @default(now())
  atualizadoEm DateTime  @updatedAt
  excluidoEm   DateTime?

  @@map("usuarios")
}

model RefreshToken {
  id         String    @id @default(cuid())
  token      String    @unique
  usuarioId  String
  expiraEm   DateTime
  revogadoEm DateTime?
  criadoEm   DateTime  @default(now())
  usuario    Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  @@map("refresh_tokens")
}

model TokenRedefinicaoSenha {
  id        String    @id @default(cuid())
  token     String    @unique
  usuarioId String
  expiraEm  DateTime
  usadoEm   DateTime?
  criadoEm  DateTime  @default(now())
  usuario   Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  @@map("tokens_redefinicao_senha")
}
```

> O schema **não** tem coluna para "provedor de auth" (LOCAL/MICROSOFT). Se a auth via Microsoft for adotada (ver §7), será preciso evoluir o schema (ex.: adicionar `enum ProvedorAuth { LOCAL, MICROSOFT }` + `microsoftId String? @unique`) — **decisão pendente**.

---

## 5. Convenção de Idioma — PT-BR EM TUDO (decisão consolidada 26/04/2026)

**Regra única:** o projeto inteiro fala português. Frontend e backend usam exatamente os mesmos nomes de domínio. Sem mapeamento PT↔EN na borda.

| Camada | Convenção (consolidada) |
| --- | --- |
| Banco / Prisma / enums Prisma | **PT** (`Usuario`, `PerfilUsuario`, `StatusUsuario`, `NivelEducacional`) |
| Backend código (modules, middlewares, types, services) | **PT** (`autenticacao.middleware.ts`, `papeis.middleware.ts`, `usuario.service.ts`) |
| Backend respostas JSON | **PT** — `{ mensagem, dados }` em sucesso, `{ erro: { codigo, mensagem, detalhes } }` em erro (ver §6) |
| Endpoints da API | **PT com prefixo `/api/v1`** — ex.: `/api/v1/autenticacao/login`, `/api/v1/admin/usuarios` (mapeamento completo em §8) |
| Backend papéis | **`ADMINISTRADOR`** — alinhar enum Prisma (`PerfilUsuario.ADMIN` → `PerfilUsuario.ADMINISTRADOR`) e manter `shared/constants/papeis.ts` como está |
| Frontend tipos (`entities/usuario/model/types.ts`) | **PT** — `Perfil = 'ALUNO' \| 'PROFESSOR' \| 'ADMINISTRADOR'`, `StatusUsuario = 'PENDENTE' \| 'ATIVO' \| 'INATIVO' \| 'RECUSADO'`. Refatorar `entities/user/` → `entities/usuario/` e mudar todos os campos do tipo `User` para PT (`nome`, `perfil`, `status`, `instituicao`, `curso`, `semestre`). |
| Frontend rotas e UI | **PT** (`/login`, `/cadastro`, `/admin/usuarios`, `/esqueci-senha`, etc.) |
| Frontend payloads de request/response | **PT** — body `{ email, senha }`, response `{ tokenAcesso, tokenAtualizacao, usuario }` |
| Frontend nome de feature/pastas | **PT** — `auth-by-credencials/` → `autenticacao-por-credenciais/` |
| Frontend nome de funções de serviço | **PT** — `loginWithCredencials` → `loginPorCredenciais`, `LoginResponse` → `RespostaLogin` |
| Storage keys (localStorage) | **PT** — `token_acesso`, `token_atualizacao`, `usuario` (não `access_token`/`refresh_token`) |

**Implicações práticas (estado em 2026-05-13):**

- O enum Prisma ainda é `PerfilUsuario.ADMIN` no banco. A conversão para `ADMINISTRADOR` acontece em `sessao.repository.ts` (`converterPerfilParaPapel`). **JWT já emite `papel: 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'` desde a refatoração consolidada.** Renomear o enum Prisma fica como débito para PR dedicado.
- **JWT canonical:** `papel` (não `perfil`). Apenas o detalhe interno do Backend (campo Prisma `usuario.perfil`) ainda usa o nome antigo.
- **BFF corrigido:** lê `payload.papel` e injeta `X-User-Papel` nas chamadas downstream. `perfil` é legado e não deve ser usado em código novo.
- **Não há mais "tradução na borda".** O backend retorna `papel: 'ALUNO'` no JWT e o frontend usa `papel` — mesmo nome.

> ⚠️ Esta seção substitui qualquer referência anterior a `Role: 'STUDENT'`, `STUDENT/PROFESSOR/ADMIN`, `ACTIVE/INACTIVE`, `access_token/refresh_token`, `auth-by-credencials`. Se ver isso no código, é débito a corrigir.

---

## 6. Padrão de Resposta da API (já implementado em `shared/types/api.types.ts`)

### Sucesso

```json
{
  "mensagem": "Mensagem human-readable",
  "dados": { /* payload */ }
}
```

### Sucesso paginado

```json
{
  "dados": [ /* lista */ ],
  "metadados": { "page": 1, "limit": 10, "total": 42, "totalPages": 5 }
}
```

### Erro (qualquer status >= 400)

```json
{
  "erro": {
    "codigo": "ERRO_DE_VALIDACAO",
    "mensagem": "Falha na validacao da requisicao.",
    "detalhes": { /* opcional, ex: árvore Zod */ }
  }
}
```

Códigos disponíveis em `shared/errors/codigos-de-erro.ts`:
`REQUISICAO_INVALIDA | ERRO_DE_VALIDACAO | NAO_AUTORIZADO | PROIBIDO | NAO_ENCONTRADO | CONFLITO | NAO_IMPLEMENTADO | ERRO_INTERNO`.

Erros disparáveis com `throw new ErroAplicacao({ codigoStatus, codigo, mensagem, detalhes? })` — o middleware `tratamento-erros` cuida do resto e também trata `Prisma.PrismaClientKnownRequestError`.

> ✅ **Decidido (26/04/2026):** o backend mantém o formato em PT acima e o **frontend é refatorado** para consumir exatamente esses campos. O `authService` atual (`data.message`, etc.) é débito a corrigir junto com a refatoração de tipos da §5.

---

## 7. Estado Atual do Escopo da Release Major 1

### O que JÁ existe

| Camada | Pronto |
| --- | --- |
| Backend | Scaffold com módulo `exemplo` (referência), middlewares stub para auth/papéis, validação Zod, error handler, logger, Prisma com schema Usuario + RefreshToken + TokenRedefinicaoSenha + migration aplicada, seed do admin |
| Frontend | Tela `/login` (com form, botão Microsoft mockado e botão "Entrar como Administrador"), tela `/home`, layout autenticado com Header+sidebar, AuthProvider (Context+localStorage), Header com toggle "ver como aluno" (PROFESSOR) e item "Gerenciar Usuários" (ADMIN), httpClient com interceptor Bearer, mocks de teste de login (`aluno@unb.br`, `desativado@unb.br`) |
| CI/CD | Pipelines de lint+build+test+coverage gate 85%+SonarCloud nos 2 repos; export de `metrics.json` para repo Doc |
| Docs | MkDocs Material com estrutura de páginas (a maioria ainda em branco com só "Histórico de Versão"); documentos preenchidos: `tecnologias.md`, `politica_branchs.md`, `politica_commits.md`, `codigo_conduta.md`, `reunioes.md`, atas 19/04 e 20/04 |

### O que FALTA (escopo da sprint atual)

**Backend:**
1. Adicionar dependências: `jsonwebtoken`, `@types/jsonwebtoken`, `nodemailer` (ou similar para email — ver TASK06 spike), Jest + ts-jest/swc-jest + supertest, dotenv para testes
2. Atualizar `.env.example` com `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_*`, `FRONTEND_URL`
3. Validar essas env no `config/env.ts` (Zod)
4. Implementar `shared/utils/jwt.ts` (sign + verify access/refresh)
5. Implementar `shared/services/emailService.ts`
6. Implementar middlewares **de verdade** (`autenticacao.middleware.ts` precisa: extrair Bearer, verificar JWT, **buscar usuário no banco** para checar status atual, anexar `request.usuario`)
7. Implementar `papeis.middleware.ts` para autorizar por role
8. Criar módulos `auth`, `user`, `admin` seguindo o padrão de `exemplo/`
9. Implementar endpoints (ver §8)
10. Adicionar tests (cobertura ≥ 85%)

**Frontend:**
1. **Refatoração PT-BR (precondição para tudo abaixo)** — renomear `entities/user/` → `entities/usuario/`, traduzir tipos (`User → Usuario`, `Role → Perfil` com valores `'ALUNO'|'PROFESSOR'|'ADMINISTRADOR'`, `UserStatus → StatusUsuario` com valores `'PENDENTE'|'ATIVO'|'INATIVO'|'RECUSADO'`), renomear `features/auth-by-credencials/` → `features/autenticacao-por-credenciais/`, traduzir `loginWithCredencials → loginPorCredenciais`, atualizar localStorage keys (`access_token` → `token_acesso`, `refresh_token` → `token_atualizacao`).
2. **Remover botão Microsoft** do `LoginForm` (caminho local com SIAPE+senha foi escolhido para R1).
3. Criar páginas que faltam (ver §3)
4. Criar features `cadastro-aluno`, `cadastro-professor`, `recuperar-senha`, `gerenciar-usuarios`
5. Implementar guards de rota por autenticação e por perfil
6. Adicionar flag `VITE_USAR_MOCKS` (boolean) — quando `true`, mantém `aluno@unb.br`/`desativado@unb.br` mockados; quando `false`, sempre chama o backend real (ver §18)
7. Cobertura ≥ 85%

---

## 8. Endpoints da API — STATUS

> ⚠️ **Atenção ao prefixo:** o backend usa `/api/v1/...` (ver `src/config/app.ts`). Todos os caminhos públicos devem sair pelo BFF nesse prefixo.

### Implementados hoje

- `GET /health` — healthcheck
- `POST /api/v1/exemplos` — criar exemplo (referência)
- `GET /api/v1/exemplos` — listar paginado (`?page=&limit=`)
- `GET /api/v1/exemplos/:id` — buscar por id

### A implementar (Release Major 1) — todos em PT-BR

#### Públicos
- `POST /api/v1/autenticacao/cadastro` — cadastro de aluno (status inicial `ATIVO`)
- `POST /api/v1/autenticacao/cadastro/professor` — cadastro de professor (status inicial `PENDENTE`)
- `POST /api/v1/autenticacao/login` — login (aluno, professor ou administrador)
- `POST /api/v1/autenticacao/atualizar-token` — refresh token rotation
- `POST /api/v1/autenticacao/recuperar-senha` — solicita link de reset (sempre 200)
- `POST /api/v1/autenticacao/redefinir-senha` — redefine com token

#### Autenticados
- `POST /api/v1/autenticacao/sair` — invalida refresh token no banco

#### Admin (perfil `ADMINISTRADOR`)
- `GET /api/v1/admin/usuarios?page=&limit=&busca=&status=` — paginado, filtra por status (`PENDENTE|ATIVO|INATIVO|RECUSADO`) e busca por nome/email
- `GET /api/v1/admin/usuarios/:id` — detalhes completos
- `PATCH /api/v1/admin/usuarios/:id/status` — body `{ "status": "PENDENTE|ATIVO|INATIVO|RECUSADO" }` — usado para aprovar/rejeitar/desativar/reativar

### Contratos de payload (todos em PT-BR)

**Login — request:** `{ "email": "...", "senha": "..." }`

**Login — response 200:**
```json
{
  "mensagem": "Login realizado com sucesso.",
  "dados": {
    "tokenAcesso": "...",
    "tokenAtualizacao": "...",
    "usuario": {
      "id": "...",
      "nome": "...",
      "email": "...",
      "perfil": "ALUNO|PROFESSOR|ADMINISTRADOR",
      "status": "ATIVO"
    }
  }
}
```

**Atualizar token — request:** `{ "tokenAtualizacao": "..." }`
**Atualizar token — response 200:** `{ "mensagem": "...", "dados": { "tokenAcesso": "...", "tokenAtualizacao": "..." } }`

### Mensagens de login (regra de negócio)

- Credenciais erradas → **401** `NAO_AUTORIZADO` "Email ou senha inválidos"
- `PENDENTE` → **403** `PROIBIDO` "Seu cadastro está em análise pelo administrador"
- `INATIVO` → **403** `PROIBIDO` "Conta desativada. Entre em contato com o administrador"
- `RECUSADO` → **403** `PROIBIDO` "Cadastro recusado. Entre em contato com o administrador"
- `ATIVO` → **200** com payload acima

### Validações

- Email professor: regex `.+@(.+\.)?unb\.br$`
- SIAPE: regex `^\d{7}$`, único
- Senha: mínimo 8 caracteres
- JWT: access 60min, refresh 7 dias com **rotation** (deletar antigo e gerar novo)
- Reset de senha: token válido 1h; endpoint `recuperar-senha` sempre retorna 200 (não vazar se email existe)
- Middleware `autenticacao` deve **revalidar status** do usuário no banco a cada request (impede que token de usuário desativado posteriormente continue válido)

---

## 9. Variáveis de Ambiente

### Backend (`.env.example` REAL)

```
NODE_ENV=development
PORT=3333                       # ⚠️ a porta REAL é 3333
POSTGRES_USER=
POSTGRES_PASSWORD=
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"
LOG_LEVEL=info
```

### Backend (a adicionar para Release Major 1)

```
# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=60m
JWT_REFRESH_EXPIRES_IN=7d

# Admin seed
ADMIN_EMAIL=admin@anatoquizup.com
ADMIN_PASSWORD=

# Email (depende do spike TASK06)
EMAIL_API_KEY=
EMAIL_FROM=

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Frontend

```
VITE_API_URL=http://localhost:4000/api/v1   # aponta para o BFF (a partir de 2026-05-05)
VITE_USE_MOCKS=false                        # mocks controlados em código por VITE_USE_MOCKS (boolean) — ver §18
```

> A partir de 2026-05-05, `VITE_API_URL` aponta para o **BFF** (porta 4000), não mais para o Backend. O default em `src/shared/config/env.ts` foi atualizado.

---

## 10. Fluxo de Autenticação — DECIDIDO: LOCAL com SIAPE+senha (R1)

**Decisão consolidada (26/04/2026):** para a Release Major 1, professor faz cadastro **local** com email `*@unb.br` + SIAPE + senha; admin aprova manualmente. Não há OAuth Microsoft nesta release.

### Implicações práticas

- **Backend:** schema atual (`Usuario` sem `microsoftId`/`provedorAuth`) já comporta o caminho local. Não evoluir o schema com colunas Microsoft.
- **Frontend:** o botão/link "Entrar como Professor (UnB)" deve levar para `/professor/login` (tela própria), sem endpoint Microsoft no BFF. Remover do `User`/`Usuario` os campos `authProvider`/`microsoftId` (foram especulação).
- **OAuth Microsoft fica como follow-up** (release futura). Pode ser registrado como issue de débito técnico para quando o time quiser priorizar.

### Resumo do fluxo local de professor

1. Professor acessa `/professor/cadastro` → preenche nome, email `*@unb.br`, SIAPE 7 dígitos, senha, departamento, curso (instituição = "UnB").
2. POST `/api/v1/autenticacao/cadastro/professor` cria com `status = PENDENTE`. Frontend redireciona para `/professor/cadastro-em-analise`.
3. Admin acessa `/admin/usuarios`, vê seção "Aguardando aprovação", clica "Aprovar" → PATCH `/api/v1/admin/usuarios/:id/status` com `{ status: 'ATIVO' }`. Backend grava `aprovadoPorId` + `aprovadoEm`.
4. Professor faz login em `/professor/login` → POST `/api/v1/autenticacao/login` → retorna tokens + usuário com `perfil: 'PROFESSOR'`.
5. Frontend redireciona para `/home`. Header já tem o toggle "Ver como aluno" (US07 parcial).

---

## 11. Decisões Consolidadas (26/04/2026)

| # | Tópico | Decisão |
| --- | --- | --- |
| 1 | Auth de professor na R1 | **Local com SIAPE+senha.** Microsoft fica para release futura. |
| 2 | Naming dos endpoints | **PT-BR**: `/api/v1/autenticacao/...`, `/api/v1/admin/usuarios`, etc. (mapeamento completo em §8). |
| 3 | Papel admin | **`ADMINISTRADOR`** em todo lugar. Migration nova para renomear `PerfilUsuario.ADMIN` → `ADMINISTRADOR` no Prisma. `shared/constants/papeis.ts` já está correto. |
| 4 | Mapeamento de tipos backend↔frontend | **Sem mapeamento.** Frontend usa os mesmos enums do backend (PT). Refatorar `entities/user/` para `entities/usuario/`. |
| 5 | Estratégia de branch | **Git Flow** (`main`, `develop`, `feature/*`, `release/x.y.z`, `hotfix/*`). |
| 6 | Porta backend | **3333.** Frontend default no `shared/config/env.ts` deve ser corrigido para 3333. |
| 7 | US01 — campos opcionais aluno | **Flag única "Não estou matriculado em nenhuma universidade"** (ata 20/04 sobrescreve a regra antiga das 3 "Não se aplica"). |
| 8 | Mocks de login frontend | **Flag `VITE_USAR_MOCKS`** (boolean). Quando `true`, mantém mocks `aluno@unb.br`/`desativado@unb.br`. Quando `false`, sempre chama o backend real. Default em dev: `true`. Em produção/Vercel: `false`. |
| 9 | Renomear pasta com typo | **`features/auth-by-credencials/` → `features/autenticacao-por-credenciais/`** já nesta sprint. |
| 10 | Zustand | **Pós-release.** AuthProvider em Context API + localStorage fica como está em R1. Migração para Zustand vira issue de débito técnico para R2. |

### Conflitos ainda em aberto (não bloqueiam R1, mas merecem follow-up)

- **SonarCloud project keys:** Backend/Auth usa `fga-eps-mds_2026-1-AnatoQuizUp-Backend`, Quiz-Service usa `fga-eps-mds_2026-1-AnatoQuizUp-Quiz-Service` e a org canônica é `fga-eps-mds`. Se algum workflow antigo ainda apontar para `API`, tratar como bug de migração.
- **CI Node version:** backend roda Node 24 no CI; frontend roda Node 20. Não é prioridade — alinhar quando fizer sentido.

---

## 12. Convenções de Código

- TypeScript **strict** em ambos os repos.
- ESLint obrigatório — CI bloqueia merge.
- Cobertura ≥ 85% — CI bloqueia merge.
- Branch protection: nenhum commit direto na `main`/`develop`; PR exige aprovação + CI verde.
- **Estratégia de branch: Git Flow** (`main`, `develop`, `feature/*`, `release/x.y.z`, `hotfix/*`).
- **Commits: Conventional Commits / Commitizen** (`feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`).
- Validação com Zod no backend (em `*.schemas.ts` por módulo).
- Validação client-side antes de enviar.
- Bcrypt 10 salt rounds (com `bcryptjs`).
- **Senha sempre em plaintext via HTTPS** — hash exclusivamente no servidor. NÃO fazer hash no frontend.
- JWT: nunca incluir senha no payload.
- CORS: especificar URL do frontend, nunca `*`.
- Variáveis de ambiente sempre via `.env`, validadas em `config/env.ts`.
- Backend usa `process.env.PORT` (Railway injeta).
- Prisma: `migrate deploy` em produção, `migrate dev` em local.
- **Idioma de UI:** português do Brasil.
- **Mensagens de erro:** genéricas para credenciais; específicas para `PENDENTE | INATIVO | RECUSADO`.

---

## 13. Padrão para criar módulos no backend

Tomar `src/modules/exemplo/` como referência. Cada módulo deve ter:

```
src/modules/<dominio>/
├── __tests__/                              ← testes unitários
├── dto/
│   ├── <acao>.<dominio>.types.ts           ← tipos (sem Zod)
│   └── resposta.<dominio>.types.ts         ← `converterParaResposta...` para mapear modelo Prisma → DTO
├── <dominio>.controller.ts                 ← classe com handlers async, recebe service no construtor
├── <dominio>.repository.ts                 ← acesso Prisma
├── <dominio>.routes.ts                     ← `Router()`, instancia repo→service→controller, monta rotas com `validarRequisicao(schema, alvo)`
├── <dominio>.schemas.ts                    ← schemas Zod (`schemaCriar...`, `schemaListar...`)
├── <dominio>.service.ts                    ← regra de negócio; lança `ErroAplicacao` quando aplicável
└── index.ts                                ← re-exporta o router
```

E registrar o router no `src/config/app.ts`:

```ts
roteadorApi.use("/<recurso>", novoRouter);
```

---

## 14. Padrão para criar páginas/features no frontend (FSD)

- Camadas (acima → abaixo): `app` → `pages` → `widgets` → `features` → `entities` → `shared`. **Camada superior pode importar inferior, nunca o contrário.**
- Cada `pages/*`, `widgets/*`, `features/*` tem `index.ts` que re-exporta a UI.
- Componentes/Tela ficam em `ui/`; lógica de negócio em `model/`.
- Testes ao lado do arquivo (`Foo.tsx` + `Foo.test.tsx`).
- Tailwind para estilo.
- Tipos centrais de domínio em `entities/<entidade>/model/types.ts`.
- HTTP via `shared/api/httpClient.ts` (já injeta Bearer).

### Rotas do frontend (PT)

| Rota | Conteúdo |
| --- | --- |
| `/login` | login de aluno (já existe) — botão Microsoft removido, troca para link "Entrar como Professor" → `/professor/login` |
| `/cadastro` | cadastro de aluno (a criar) |
| `/professor/login` | login de professor local (a criar) |
| `/professor/cadastro` | cadastro de professor (a criar) |
| `/professor/cadastro-em-analise` | mensagem pós-cadastro (a criar) |
| `/admin/login` | login admin (a criar) |
| `/admin/usuarios` | painel admin (a criar) |
| `/admin/usuarios/:id` | detalhes (a criar) |
| `/esqueci-senha`, `/redefinir-senha` | reset (a criar) |
| `/home` | autenticada (já existe) |
| `*` | hoje redireciona para `/home`; trocar por `nao-encontrada` quando criada |

---

## 15. Product Backlog (US — escopo Release Major 1)

> Pontuação total e regras vêm do backlog do time. Ajustar onde o cliente atualizou (ver §11.7).

- **US01 — Cadastro de Aluno** (5pts, fullstack)
  - Campos sempre obrigatórios: nome, email, senha, confirmar senha, dataNascimento, nacionalidade, estado, cidade, escolaridade.
  - **Flag única (decisão consolidada 26/04/2026):** checkbox "Não estou matriculado em nenhuma universidade".
    - Quando **desmarcado**: `instituicao`, `curso`, `semestre` viram obrigatórios.
    - Quando **marcado**: os 3 campos somem do form e são salvos como `null` no banco.
  - Validações: email único, senha ≥ 8, confirmação bate.
  - Status inicial: `ATIVO`.

- **US02 — Login de Aluno** (5pts, fullstack)
  - `/login` com link "Entrar como Professor" (→ `/professor/login`) e botão "Entrar como Administrador" (→ `/admin/login`).

- **US03 — Cadastro de Professor** (5+3pts) — **caminho local consolidado para R1**
  - Email validado por regex `.+@(.+\.)?unb\.br$`, SIAPE 7 dígitos único, instituição = "UnB" (fixo), departamento (texto livre), curso (texto livre), senha.
  - Status inicial: `PENDENTE`.
  - Após cadastro, redireciona para `/professor/cadastro-em-analise` com mensagem "Cadastro em análise pelo administrador".

- **US04 — Login de Professor** (3+2pts)
  - Tela `/professor/login`. Mensagens distintas para credenciais/PENDENTE/INATIVO/RECUSADO (ver §8).

- **US05 — Logout** (2pts) — invalida refresh token no banco; limpa estado/localStorage no front.

- **US06 — Recuperação de Senha** (5pts) — email com link de reset (1h). Sempre retornar 200.

- **US07 — Professor com Visão de Aluno** (3pts, frontend) — toggle no header (já parcialmente implementado em `widgets/header/ui/Header.tsx`). **Persiste navegação:** ainda precisa banner global "Você está na visão de aluno" e persistência em localStorage/sessionStorage.

- **US08 — Painel Admin de Usuários** (5+4pts)
  - Lista paginada com busca + filtro por status.
  - Seção "Aguardando aprovação" no topo com Aprovar/Rejeitar.
  - Detalhes ao clicar.
  - Ações: aprovar, rejeitar, desativar, reativar.
  - Restrições: admin não pode desativar a si mesmo nem alterar status de outro `ADMIN`.

---

## 16. Project Backlog (Tasks técnicas)

- TASK01 — Modelagem Prisma + migration ✅ (já feito; existem 2 migrations)
- TASK02 — Seed admin ✅ (`prisma/seed.ts`)
- TASK03 — Setup módulo auth no backend ❌ (a fazer; usar `exemplo/` como template)
- TASK04 — JWT access+refresh ❌
- TASK05 — Setup FSD no frontend ✅ (estrutura existe; faltam só páginas/features)
- TASK06 — Spike de lib de email ❌
- TASK09 — Configuração serviço email ❌ (depende TASK06)
- TASK10 — Middleware de autenticação ⚠️ (stub criado, falta implementar)
- TASK11 — Middleware de autorização por role ⚠️ (stub criado, falta implementar)
- TASK12 — Refresh token rotation ❌
- TASK13 — Rotas protegidas frontend ❌
- TASK14 — Widget Header/Navbar ✅ (`widgets/header/`)
- TASK15 — Página Home placeholder ✅
- TASK16 — Tela 404 + error boundary ❌

---

## 17. Setup local — comandos

### Backend (`2026-1-AnatoQuizUp-Backend`)

```bash
cp .env.example .env
# Preencher INTERNAL_TOKEN (mesmo valor do BFF) entre as outras vars.
docker compose up -d db
npm ci
npm run prisma:generate
npm run prisma:migrate -- --name init        # ou "npx prisma migrate dev"
npm run prisma:seed
npm run dev                                   # tsx watch em http://localhost:3333
```

Scripts úteis: `dev`, `build`, `start`, `lint`, `format`, `prisma:generate`, `prisma:migrate`, `prisma:seed`, `db:up`, `db:down`.

### BFF (`2026-1-AnatoQuizUp-BFF`) — novo

```bash
cp .env.example .env
# Preencher INTERNAL_TOKEN e JWT_SECRET_KEY (mesmos valores do Backend).
npm ci
npm run dev                                   # tsx watch em http://localhost:4000
```

### Frontend (`2026-1-AnatoQuizUp-Web`)

```bash
npm ci
echo "VITE_API_URL=http://localhost:4000/api/v1" > .env   # aponta pro BFF, nao para o Backend direto
npm run dev                                   # vite em http://localhost:5173
npm test                                      # jest
npm run test:ci                               # jest --coverage --runInBand
```

> Em desenvolvimento sobem **três** processos: Backend (3333), BFF (4000), Web (5173). O Web nunca chama o Backend diretamente — sempre via BFF.

---

## 18. Login mockado no frontend — controlado por flag `VITE_USAR_MOCKS`

**Decisão (26/04/2026):** os mocks ficam no código, mas só ativam quando `VITE_USAR_MOCKS=true`. Isso permite que o frontend siga sendo desenvolvido em paralelo enquanto o backend implementa auth de verdade, e funciona como fallback de demo se o backend cair.

### Comportamento

| `VITE_USAR_MOCKS` | Email | Comportamento |
| --- | --- | --- |
| `true` | `aluno@unb.br` | Retorna sucesso com usuário mock (João José, Medicina, UnB, semestre 3) sem chamar a API |
| `true` | `desativado@unb.br` | Lança "Conta desativada. Entre em contato com o administrador." |
| `true` | qualquer outro | Cai no fluxo normal (`POST /api/v1/autenticacao/login`) |
| `false` | qualquer | Sempre chama o backend |

### Onde implementar a flag

- `src/shared/config/env.ts`: ler `import.meta.env.VITE_USAR_MOCKS === 'true'` e exportar `USAR_MOCKS`.
- `src/features/autenticacao-por-credenciais/model/authService.ts`: o early-return dos emails mockados só acontece quando `USAR_MOCKS` é `true`.

### Defaults

- **Local dev:** `VITE_USAR_MOCKS=true` (no `.env` que cada dev cria).
- **Vercel produção/preview:** `VITE_USAR_MOCKS=false` (env var configurada na Vercel).
- **CI:** indiferente (testes mockam o `httpClient` diretamente, não dependem da flag).

### Tipo do mock — ATUALIZAR para PT-BR

Hoje o `MOCK_USER` no `authService` usa campos em inglês (`role: 'STUDENT'`, `course`, etc.). Atualizar junto com a refatoração da §5 para:

```ts
const USUARIO_MOCK: Usuario = {
  id: '...',
  nome: 'João José',
  email: 'aluno@unb.br',
  perfil: 'ALUNO',
  status: 'ATIVO',
  curso: 'Medicina',
  instituicao: 'Universidade de Brasília',
  semestre: 3,
};
```

---

## 19. CI/CD — fluxo e artefatos

Cada repo de código (API e Web) tem em `.github/workflows/ci.yml` os passos:

1. Checkout (fetch-depth: 0 — necessário para SonarCloud)
2. Setup Node (`node-version-file: .nvmrc` no backend; `'20'` no frontend — ⚠️ inconsistente, frontend usa Node 20 enquanto backend exige 24)
3. `npm ci`
4. `npm run lint`
5. (backend) `prisma generate`
6. `npm run build`
7. `npm test -- --coverage --passWithNoTests`
8. **Coverage gate ≥ 85%** (lê `coverage/coverage-summary.json`; se não existir, só warn)
9. **SonarCloud Scan** + Quality Gate
10. (apenas em push para `main`) export de `metrics.json` e commit em `2026-1-AnatoQuizUp-Doc/metrics/{backend|frontend}/`

> ⚠️ Inconsistência: frontend roda em Node 20 no CI, enquanto backend exige 24. Avaliar se alinhar para 24.

---

## 20. Documentação MkDocs (`2026-1-AnatoQuizUp-Doc`)

Estrutura `mkdocs.yml`:

- Início (`index.md`)
- Produto: Visão, Lean Inception (em branco)
- Backlog: Visão Geral, Histórias (em branco)
- Arquitetura: Visão Geral (em branco), Tecnologias (preenchido), Decisões (em branco)
- Protótipos: Figma (em branco)
- Projeto e Processo: Roadmap, Sprints, Reuniões (preenchido), Metodologia (em branco)
- Qualidade e Métricas: Métricas/Dashboard (em branco)
- Decisões: Decisões do projeto (em branco)
- Contribuição: Código de Conduta, Política de Branchs (Git Flow), Política de Commits (Commitizen) — todos preenchidos

> A maioria das páginas tem só o cabeçalho "Histórico de Versão". Conforme a documentação for evoluindo, manter esse índice atualizado.


## 21. Resumo de pontos de mudança (vs. documento original)

> Decisões fechadas em 26/04/2026 marcadas com ✅; conflitos ainda abertos marcadas com ⚠️.

1. **Stack frontend:** doc não mencionava Tailwind 4, Vite 8, React 19, TS 6, React Router 7, Axios, Zustand, lucide-react, Jest 30 + swc/jest, testing-library.
2. **Stack backend:** Express **5** (não 4); Pino + Helmet; bcryptjs (não bcrypt); **Jest ainda não instalado**; PostgreSQL 18; Node 24.
3. **Idioma:** ✅ **PT-BR em tudo** (§5).
4. **Estrutura backend:** doc previa `index.ts` + `server.ts`; real só `server.ts` + `config/app.ts`. Tem `shared/errors/`, `shared/types/`, `shared/utils/{paginacao, dados, formatacao}`, `shared/constants/{mensagens, papeis}`.
5. **Estrutura frontend:** doc previa 13 páginas; real tem 2. ✅ Pasta `auth-by-credencials` será renomeada para `autenticacao-por-credenciais` (§22).
6. **Endpoints:** ✅ **`/api/v1/autenticacao/...` em PT** (§8).
7. **Porta backend:** ✅ **3333** (frontend será corrigido).
8. **`.env.example` backend:** ✅ vars JWT/admin/email/frontend a adicionar (§22).
9. **Branching:** ✅ **Git Flow** (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`).
10. **Auth professor:** ✅ **Local com SIAPE+senha em R1** (§10). Botão Microsoft removido do `LoginForm`.
11. **`ADMINISTRADOR`:** ✅ migration de renome do enum Prisma (`ADMIN` → `ADMINISTRADOR`) está no checklist (§22).
12. **US01:** ✅ flag única "Não estou matriculado em nenhuma universidade" (§15).
13. **US07:** Header já tem toggle "Ver como aluno" (parcial). Mantém em R1.
14. **CI export `metrics.json` para repo Doc:** documentado em §19.
15. **Convenção de resposta API:** `{mensagem, dados}` / `{dados, metadados}` / `{erro: {codigo, mensagem, detalhes}}` (§6, §8).
16. **Padrão de módulo backend:** `repository → service → controller → routes` com instanciação manual (sem DI), espelhado de `modules/exemplo/`.
17. **Login mockado:** ✅ controlado por `VITE_USAR_MOCKS` (§18).
18. **⚠️ Node CI mismatch:** backend 24, frontend 20 — não bloqueia R1.
19. **⚠️ SonarCloud project keys:** `sonar-project.properties` (`-API`/`-Web`) divergem do `PROJECT_KEY` exportado pelo CI (`-Back`/`-Front`). Não bloqueia quality gate, mas pode quebrar export de métricas.
20. **Issue templates** em ambos os repos (`01_user_story`, `02_bug_report`, `03_task`).


## 22. Refatorações concretas a fazer (checklist da sprint)

> Lista derivada das decisões consolidadas (§11). Use como guia para abrir issues/PRs.

### Backend
- [ ] **Migration nova** renomeando `PerfilUsuario.ADMIN` → `ADMINISTRADOR` (`prisma/schema.prisma`, atualizar seed `prisma/seed.ts`).
- [ ] Remover (ou ignorar) o aviso da §3 sobre conflito `ADMIN`/`ADMINISTRADOR` — após a migration, `papeis.ts` e Prisma estão alinhados.
- [ ] Adicionar deps: `jsonwebtoken`, `@types/jsonwebtoken`, `nodemailer` (ou similar — TASK06), `jest`, `ts-jest` ou `@swc/jest`, `supertest`, `@types/{jest,supertest}`.
- [ ] Atualizar `.env.example` com `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `EMAIL_*`, `FRONTEND_URL`.
- [ ] Validar essas envs em `src/config/env.ts` (Zod).
- [ ] Implementar `src/shared/utils/jwt.ts`.
- [ ] Implementar `src/shared/services/emailService.ts`.
- [ ] Implementar middlewares de verdade: `autenticacao.middleware.ts` (extrai Bearer, verifica JWT, **busca usuário no banco para revalidar status**, anexa `request.usuario`); `papeis.middleware.ts` (autoriza por perfil).
- [ ] Criar módulos `src/modules/autenticacao/`, `src/modules/usuario/`, `src/modules/admin/` seguindo o padrão de `exemplo/`.
- [ ] Implementar todos os endpoints de §8.
- [ ] Configurar Jest com `coverageReporters: ['text', 'lcov', 'json-summary']`. Cobertura ≥ 85%.

### Frontend (refatoração PT-BR — abrir como PR única antes das US)
- [ ] Renomear `src/entities/user/` → `src/entities/usuario/`. Traduzir `User` → `Usuario`, `Role` → `Perfil` (`'ALUNO'|'PROFESSOR'|'ADMINISTRADOR'`), `UserStatus` → `StatusUsuario` (`'PENDENTE'|'ATIVO'|'INATIVO'|'RECUSADO'`). Remover `AuthProviderType`, `microsoftId`. Traduzir todos os campos do `Usuario` (`name`→`nome`, `course`→`curso`, etc.).
- [ ] Renomear `src/features/auth-by-credencials/` → `src/features/autenticacao-por-credenciais/`.
- [ ] Renomear `loginWithCredencials` → `loginPorCredenciais`. Renomear `LoginResponse` → `RespostaLogin`. Atualizar tests.
- [ ] Mudar localStorage keys: `access_token` → `token_acesso`, `refresh_token` → `token_atualizacao`. (Atualizar `AuthProvider` e `httpClient`.)
- [ ] Atualizar `httpClient` para consumir `RespostaApiSucesso<T>` (`{mensagem, dados}`) e `RespostaApiErro` (`{erro:{codigo, mensagem, detalhes}}`).
- [ ] Em `LoginForm`: remover botão Microsoft, trocar por link "Entrar como Professor" → `/professor/login`.
- [ ] Em `shared/config/env.ts`: manter default da `API_BASE_URL` apontando para o BFF (`http://localhost:4000/api/v1`). Adicionar export `USAR_MOCKS` lendo `VITE_USAR_MOCKS`.
- [ ] Atualizar `MOCK_USER` para PT-BR (ver §18).

### Frontend (US — depois da refatoração)
- [ ] Páginas: `cadastro/`, `professor-login/`, `professor-cadastro/`, `professor-cadastro-em-analise/`, `admin-login/`, `admin-usuarios/`, `admin-usuarios-detalhes/`, `esqueci-senha/`, `redefinir-senha/`, `nao-encontrada/`.
- [ ] Features: `cadastro-aluno/`, `cadastro-professor/`, `recuperar-senha/`, `gerenciar-usuarios/`. (Toggle "ver como aluno" hoje vive no Header — pode ficar lá ou migrar para feature `visao-aluno-do-professor/`. Manter como está em R1.)
- [ ] Guard de rota por autenticação + por perfil (`AuthenticatedLayout` precisa redirecionar para `/login` se `!isAutenticado`; criar `LayoutPorPerfil` para rotas de admin).
- [ ] US01: implementar checkbox "Não estou matriculado em nenhuma universidade" com a regra única (§15).

---

## 23. Histórico deste documento

| Versão | Data | Mudança |
| --- | --- | --- |
| 1.0 | (anterior) | Documento inicial baseado em planejamento |
| 2.0 | 2026-04-25 | Sincronizado com o estado real dos 3 repositórios; convenções PT/EN explicitadas; decisões pendentes consolidadas; pontos de mudança listados |
| 2.1 | 2026-04-26 | Decisões consolidadas pelo time: PT-BR em tudo (endpoints `/autenticacao/...`, enum Prisma `ADMINISTRADOR`, frontend refatorado para PT), auth de professor local com SIAPE+senha em R1 (Microsoft fica para release futura), US01 com flag única "Não estou matriculado", `VITE_USAR_MOCKS` controlando mocks, renomear pasta com typo, Zustand pós-release. Checklist concreto adicionado em §22. |
| 2.2 | 2026-05-05 | Migração para arquitetura BFF: novo repositório `-BFF` entre Web e Backend; renomeação de `-API` para `-Backend`; Frontend reaponta para `http://localhost:4000/api/v1`; Backend e AI passam a ser privados, protegidos por `X-Internal-Token`; novas seções §24 (Arquitetura BFF) e §25 (Contextualização Completa do Projeto). Detalhes na PRD `arquitetura/prd-migracao-bff.md` no repo Doc. |
| 2.3 | 2026-05-13 | Snapshot pré-migração para Quiz-Service: nova seção §26 com estado atual real dos 5 repos (incluindo módulos `question`, `professor`, `manage-questions`, etc. já implementados), correção do mapa em §1 incluindo Quiz-Service, ajustes em §5 explicando o estado real do `papel`/`PerfilUsuario.ADMIN` (corte limpo `papel`; conversão interna no Backend). Detalhes da próxima migração em `prd-migracao-quiz-service.md`. |
| 2.4 | 2026-05-13 | Snapshot pós-migração para Quiz-Service: BFF roteia `/questoes`, Backend/Auth ficou sem quiz/storage, Quiz-Service recebeu domínio de questões e banco próprio. |

---

## 26. Snapshot atual (2026-05-13) — Quiz-Service migrado

Esta seção é a **referência viva** para o estado real do projeto. Os trechos anteriores (§3, §7, §22) descrevem decisões e planos antigos preservados como histórico — quando este documento e eles divergirem, prevalece o que está aqui.

### 26.1. Repositórios e estado atual

| Repo | Branch ativa | Estado real |
|---|---|---|
| `2026-1-AnatoQuizUp-Web` | `fix/correcoes-ci` (entre outras) | Features: `auth-by-credencials`, `manage-questions`, `recover-password`, `register-professor`, `register-student`. Pages: `forgot-password`, `home`, `homeAluno`, `homeProfessor`, `login`, `professor`, `professor-register`, `questao`, `register`, `reset-password`. Cadastros e CRUD de questão já integrados com o BFF. |
| `2026-1-AnatoQuizUp-BFF` | `fix/correcoes-ci` | Rotas: `/autenticacao`, `/admin`, `/exemplos`, `/questoes`, `/ia`. Usa `QUIZ_SERVICE_URL`, `quiz.client.ts`, `payload.papel` e `X-User-Papel`. |
| `2026-1-AnatoQuizUp-Backend` | `fix/correcoes-ci` | Backend/Auth: módulos `auth/{aluno,professor,recuperar-senha,sessao}`, `admin` e `exemplo`. Não possui mais módulo `question`, models de quiz ou storage de questões. Sonar org canônica `fga-eps-mds`. |
| `2026-1-AnatoQuizUp-Quiz-Service` | `main` | Serviço Express/Prisma com domínio de quiz migrado: `/questoes`, `Tema`, `Questao`, `QuestaoAlternativa`, `ResolucaoQuestao`, Quiz DB, MinIO/S3, README, Makefile, CI e Sonar. |
| `2026-1-AnatoQuizUp-AI` | `main` | Placeholder. Sem código. |
| `2026-1-AnatoQuizUp-Doc` | (varia) | Tem `prd-migracao-bff.md` (executada), `prd-migracao-quiz-service.md` v0.2 (próxima migração), `guia-arquitetura-bff.md` para devs. |

### 26.2. Schema Prisma apos migracao

O Prisma do Backend/Auth não mistura mais usuários e questões. O Quiz-Service tem schema próprio para o domínio de quiz.

**Models que permanecem no Backend (Auth):**

- `Usuario` (com campos de aluno e professor unificados, `nickname`, `siape`, `aprovadoPorId`, soft delete via `excluidoEm`)
- `RefreshToken` (com `revogadoEm`)
- `TokenRedefinicaoSenha`
- `Exemplo` (módulo didático)

**Models que ficam no Quiz-Service:**

- `Tema` (id, nome, relação com `Questao`)
- `Questao` (com `enunciado`, `tipoQuestao`, `respostaCorreta`, `saibaMais`, `status`, `feitoPorIa`, `urlImagem`, `dificuldade`, e **self-relation `questaoOriginalId`** para versionamento)
- `QuestaoAlternativa` (`alternativaA..E`, `questaoId @unique` — 1:1 com `Questao`)
- `ResolucaoQuestao` (`respostaMarcada`, `usuarioId`, `questaoId`)

**Enums do Quiz-Service:** `TipoQuestao`, `AlternativaQuestao`, `StatusQuestao`, `Dificuldade`.

**Relations quebradas na migração:** `Usuario.questoesCriadas` e `Usuario.resolucoes`. No Quiz-Service, `criadoPorId` e `usuarioId` são strings externas sem FK.

### 26.3. Migração executada — Quiz-Service

**Por que:** atender ao pedido do professor de microsserviços; isolar domínio de quiz; preparar terreno para AI Service futuro.

**Decisões aprovadas (em 2026-05-13):**

- **DP20** — Fragmentar o domínio de quiz em serviço próprio (`Quiz-Service`) com banco próprio. JWT validado localmente por claims; sem FK cross-DB para `Usuario`.
- **DP21** — Storage (MinIO/S3) é **exclusivo** do Quiz-Service. Sair do Backend.
- **DP22** — `papel` é o nome canônico no domínio e nos JWT. Sem compatibilidade com `perfil`. Headers internos: `X-User-Papel` (não `X-User-Profile`).
- **DP23** — Sonar org canônica do projeto: `fga-eps-mds` (Backend/Auth usa `_2026-1-AnatoQuizUp-Backend`; Quiz-Service usa `_2026-1-AnatoQuizUp-Quiz-Service`).

**Topologia alvo:**

```mermaid
flowchart LR
    web["Web"]
    bff["BFF"]
    auth["Backend/Auth<br/>(privado)"]
    quiz["Quiz-Service<br/>(privado, novo)"]
    ai["AI Service<br/>(reservado)"]
    authDb["Auth DB"]
    quizDb["Quiz DB"]
    storage["MinIO/S3"]

    web --> bff
    bff --> auth
    bff --> quiz
    bff -.-> ai
    auth --> authDb
    quiz --> quizDb
    quiz --> storage
```

**Portas locais alvo:**

| Serviço | Porta HTTP | Postgres local |
|---|---:|---:|
| Web | 5173 | — |
| BFF | 4000 | — |
| Backend/Auth | 3333 | 5432 |
| Quiz-Service | 3334 | 5433 |
| AI futuro | 8000 | 5434 |

**Fases executadas (resumo — detalhe completo na PRD):**

1. Pasta local do BFF padronizada como `2026-1-AnatoQuizUp-BFF`.
2. Quiz-Service scaffoldado com Node 24, TypeScript, Express, Prisma, Makefile, README, CI e Sonar.
3. Quiz DB criado com migration inicial para `Tema`, `Questao`, `QuestaoAlternativa` e `ResolucaoQuestao`.
4. Módulo `question` migrado do Backend para o Quiz-Service, incluindo testes.
5. Backend limpo: sem `src/modules/question`, `src/config/storage.ts`, models/enums de quiz, MinIO e relations de quiz no Prisma.
6. BFF atualizado com `QUIZ_SERVICE_URL`, `quiz.client.ts`, rota `/questoes`, `payload.papel` e `X-User-Papel`.
7. Web preservado: `manage-questions` continua chamando `/questoes`.
8. Docs atualizadas para a arquitetura Backend/Auth + Quiz-Service.

### 26.4. Variáveis sensíveis após Quiz-Service

| Variável | BFF | Backend | Quiz-Service | AI futuro |
|---|:---:|:---:|:---:|:---:|
| `INTERNAL_TOKEN` | ✓ (mesmo valor) | ✓ (mesmo valor) | ✓ (mesmo valor) | ✓ (mesmo valor) |
| `JWT_SECRET_KEY` | ✓ (mesmo valor) | ✓ (mesmo valor) | ✓ (mesmo valor) | — |
| `BACKEND_URL` | ✓ | — | — | — |
| `QUIZ_SERVICE_URL` | ✓ | — | — | — |
| `AI_URL` | ✓ (vazio enquanto AI placeholder) | — | — | — |
| `DATABASE_URL` | — | ✓ (Auth DB) | ✓ (Quiz DB) | ✓ (AI DB futuro) |
| `MINIO_*` | — | ❌ (remover) | ✓ (exclusivo) | — |

### 26.5. Aviso para devs do Web

A migração para Quiz-Service **não deve quebrar o Web**:

- `VITE_API_URL` continua apontando para o BFF.
- `features/manage-questions` continua chamando `/questoes` no `httpClient`. O que muda é o destino interno (Backend → Quiz-Service), invisível para o front.
- Após a migração, `manage-questions` usa a rota `/questoes` do BFF, que encaminha internamente para o Quiz-Service.

### 26.6. Aviso para devs do Backend

Após a migração:

- Backend deixa de ter o módulo `question` e seus models Prisma.
- Backend deixa de ter `src/config/storage.ts` e dependências MinIO/S3.
- README do Backend deve dizer que ele é o "Auth Backend" (autenticação, identidade, admin de usuários).
- Compose do Backend volta a ter só Postgres.

---

## 24. Arquitetura BFF (a partir de 2026-05-05)

### 24.1. Diagrama

```mermaid
flowchart LR
    user(["Usuário"])
    web["Frontend Web<br/>React + Vite<br/>(Vercel — público)"]
    bff["BFF<br/>Node + Express<br/>(Railway — público)"]
    backend["Backend<br/>Node + Express + Prisma<br/>(Railway — privado)"]
    ai["AI Service<br/>(reservado, Railway — privado)"]
    db["PostgreSQL 18<br/>(Railway)"]

    user --> web
    web --> bff
    bff --> backend
    bff -.-> ai
    backend --> db
```

### 24.2. Roteamento por path no BFF

| Prefixo público | Destino |
|---|---|
| `GET /health` | proprio BFF |
| `/api/v1/autenticacao/*` | Backend `/api/v1/autenticacao/*` |
| `/api/v1/admin/usuarios*` | Backend `/api/v1/admin/usuarios*` |
| `/api/v1/exemplos/*` | Backend `/api/v1/exemplos/*` |
| `/api/v1/ia/*` | AI `/api/v1/*` (placeholder: 503 enquanto AI vazio) |

### 24.3. Modelo de segurança

- **JWT validado em duas camadas:** o BFF valida assinatura/expiração com `JWT_SECRET_KEY`; o Backend continua validando o JWT *e* revalidando status do usuário no banco. Defesa em profundidade.
- **`X-Internal-Token`:** o BFF injeta esse header em toda chamada downstream. Backend rejeita 403 se ausente/divergente. AI fará o mesmo quando subir.
- **Rede privada:** em Railway, Backend e AI ficam em rede interna (`*.railway.internal`). Sem domínio público.

### 24.4. Stack do BFF

| Item | Versão / Escolha |
|---|---|
| Runtime | Node.js 24+ |
| Linguagem | TypeScript 5.9 |
| Framework | Express 5.1 |
| Cliente HTTP | Axios 1.7 |
| Validação env | Zod 4 |
| Logs | Pino 10 + pino-http |
| Segurança HTTP | Helmet 8 |
| Auth | jsonwebtoken 9 (validação local) |
| Testes | Jest 30 + ts-jest + supertest |

### 24.5. Variáveis do BFF

```
NODE_ENV=development
PORT=4000
LOG_LEVEL=info
BACKEND_URL=http://localhost:3333
AI_URL=
INTERNAL_TOKEN=<segredo, igual ao do Backend>
JWT_SECRET_KEY=<igual ao do Backend>
CORS_ORIGINS=http://localhost:5173
REQUEST_TIMEOUT_MS=15000
```

### 24.6. Implicações para o Frontend

- `VITE_API_URL` agora aponta para o BFF (`http://localhost:4000/api/v1` em dev; URL pública do BFF em produção).
- **Nada muda em código do front** — `httpClient.ts` continua igual, só a variável muda.
- Endpoint `/api/v1/ia/*` está disponível mas responde 503 com código `IA_INDISPONIVEL` enquanto o AI estiver vazio.

### 24.7. Variável que muda no Backend

Adicionar `INTERNAL_TOKEN` no `.env`. **Mesmo valor** que está no BFF. Em produção (Railway), gerar com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

---

## 25. Contextualização Completa do Projeto AnatoquizUp

> Este apêndice consolida o pano de fundo do produto, complementando a visão técnica das §1–§24.
> Útil quando precisar contextualizar agentes de IA sobre o projeto sem expor toda a documentação.

### 25.1. Origem e Motivação

O AnatoquizUp nasce dentro de um problema real identificado por professores do curso de Medicina da Universidade de Brasília (UnB): o baixo engajamento dos alunos nas disciplinas de anatomia. O ensino tradicional de anatomia, historicamente baseado em aulas expositivas, leitura de atlas e sessões de laboratório, coloca o aluno em uma posição predominantemente passiva — ele absorve conteúdo, mas não interage com ele de forma ativa e motivadora. Professores da UnB perceberam que esse modelo não acompanha o perfil dos estudantes atuais, que cresceram em ambientes digitais, estão acostumados com estímulos interativos e respondem melhor a dinâmicas que envolvam desafio, recompensa e progressão — mecânicas comuns em jogos.

A partir dessa constatação, surgiu a ideia de usar gamificação como estratégia pedagógica: transformar o estudo de anatomia em uma experiência de jogo, onde o aluno é desafiado por quizzes, acumula conquistas, personaliza avatares e compete de forma saudável com colegas. Essa abordagem se apoia em evidências da literatura acadêmica que demonstram que a gamificação, quando bem aplicada, aumenta a motivação, o engajamento, a colaboração e a capacidade de resolução de problemas dos estudantes.

### 25.2. O Projeto Original: Anatoquiz (Versão 1.0)

Antes do AnatoquizUp, existiu um projeto predecessor chamado Anatoquiz. Esse projeto foi desenvolvido por uma equipe multidisciplinar anterior que envolveu alunos da área da saúde (responsáveis pela criação e validação das questões) e alunos de computação (responsáveis pelo desenvolvimento técnico do sistema).

O Anatoquiz tinha as seguintes características e entregas:

- **Banco de questões robusto:** Aproximadamente 600 questões objetivas e casos clínicos, cobrindo temas como tórax, neuroanatomia (encéfalo), abdome e esqueleto apendicular. Todas as questões foram elaboradas por alunos da saúde com base em referências acadêmicas e validadas/aprovadas por uma professora médica da UnB, o que confere alto grau de confiabilidade ao conteúdo.
- **Mecânicas de gamificação planejadas:** O projeto previa formato de quiz estilo game show, sistema de moedas virtuais (chamadas ATP, em referência à molécula de energia biológica), loja de itens, avatares personalizáveis, mapas de progressão, sistema de conquistas, desafios entre jogadores, funcionalidade "Saiba mais" para conteúdo complementar, e feedback de desempenho.
- **Tecnologia utilizada:** A engine de desenvolvimento escolhida foi Godot 3.5 com GDScript, e o backend foi o SilentWolf, um serviço que armazenava dados de usuário, progresso, pontuação e itens desbloqueados.
- **Resultado final:** O projeto entregou um protótipo funcional com a estrutura do jogo montada, porém ficou incompleto — faltava a integração final do banco de questões ao sistema e ajustes de programação e design. Mais importante: o projeto nunca teve deploy realizado, ou seja, nunca foi publicado e disponibilizado de fato para os alunos usarem. Além disso, o cliente (os professores da UnB que demandaram o projeto) não aprovou o resultado por questões técnicas — a equipe anterior não tinha capacidade técnica suficiente para entregar o produto no nível esperado.

Em resumo, o Anatoquiz existe conceitualmente e possui um banco de questões valioso, mas como produto de software utilizável, ele é essencialmente inexistente. Nunca foi usado em produção por nenhum aluno.

### 25.3. O Projeto Atual: AnatoquizUp (Versão 2.0)

O AnatoquizUp é o projeto que está sendo desenvolvido agora. O nome carrega o "Up" justamente para sinalizar que se trata de um upgrade significativo do Anatoquiz original. É desenvolvido por uma nova equipe de alunos da disciplina EPS (Engenharia de Produto de Software) do curso de Engenharia de Software da UnB.

A premissa fundamental é: **tudo será refeito do zero.** A base de código do Anatoquiz original não será reaproveitada. O que se herda do projeto anterior é principalmente o conceito, a visão do produto, o banco de questões validadas e os aprendizados sobre o que não funcionou. O cliente (professores da UnB) continua querendo essencialmente a mesma coisa — um software gamificado de quiz de anatomia — mas agora com melhorias importantes e novos módulos.

#### 25.3.1. O Que Muda em Relação ao Original

**Reconstrução completa com stack web moderna:**

O Anatoquiz original foi desenvolvido em Godot (uma engine de jogos). O AnatoquizUp será desenvolvido como uma aplicação web convencional, utilizando:

- **Frontend:** React
- **BFF (Backend-For-Frontend):** Node.js + Express (intermediário público entre Frontend e serviços de domínio)
- **Backend:** Node.js + Express + Prisma (privado, atrás do BFF)
- **Banco de Dados:** PostgreSQL

Essa mudança é estratégica: uma aplicação web com React é muito mais manutenível, escalável e acessível do que um jogo feito em Godot para fins educacionais. Ela roda diretamente no navegador, sem necessidade de instalação.

**Multiplataforma via responsividade:**

O sistema será acessível tanto em desktop quanto em dispositivos móveis (celulares e tablets), mas não por meio de aplicativos nativos Android/iOS. A estratégia é desenvolver um único site web com design responsivo que se adapte a diferentes tamanhos de tela. Isso simplifica enormemente o desenvolvimento e a manutenção, pois não há necessidade de codar, publicar ou manter aplicativos em lojas como Google Play ou App Store. O aluno simplesmente acessa o site pelo navegador de qualquer dispositivo.

**Três novos módulos de Inteligência Artificial:**

Esta é a principal inovação do AnatoquizUp em relação ao projeto original. Serão integrados três módulos baseados em IA ao sistema:

##### Módulo 1 — Geração de Questões por IA

Um modelo de inteligência artificial será treinado (ou ajustado por fine-tuning / prompting estruturado) com base no banco de questões existente (~600 questões validadas). O objetivo é que esse modelo aprenda o padrão, o nível de dificuldade, o estilo e a estrutura das questões feitas pelos professores, e passe a gerar novas questões automaticamente. Essas questões geradas pela IA não entram diretamente no banco oficial — elas são submetidas à aprovação dos professores. Somente após a validação de um professor, a questão gerada pela IA é incorporada ao banco de questões oficial. Dessa forma, o banco é enriquecido continuamente com questões que mantêm o mesmo nível de confiabilidade das questões originais, mas com uma velocidade de produção muito maior.

##### Módulo 2 — Geração de Imagens Anatômicas por IA

Um módulo de IA voltado para geração de imagens de conteúdo anatômico. A ideia é dar suporte visual às questões do quiz, permitindo que questões sejam acompanhadas de imagens anatômicas geradas especificamente para aquele contexto. Isso é particularmente útil em anatomia, onde a identificação visual de estruturas é parte essencial do aprendizado. Com esse módulo, é possível criar questões que apresentem imagens próprias (geradas sob demanda) em vez de depender exclusivamente de imagens pré-existentes ou de atlas.

##### Módulo 3 — Chatbot Educacional com IA

Um chatbot inteligente treinado com duas fontes de conhecimento: o banco de questões do próprio sistema e livros digitais do acervo da UnB relacionados à anatomia. Esse chatbot funcionará de forma semelhante a um LLM conversacional (como ChatGPT, Claude, etc.), mas especializado no conteúdo de anatomia. O objetivo é que, quando um aluno tiver dúvidas durante o estudo ou após responder questões do quiz, ele possa perguntar ao chatbot e receber explicações contextualizadas, fundamentadas no material acadêmico da própria universidade. Isso cria uma camada de suporte ao aprendizado que opera 24/7, sem depender da disponibilidade de monitores ou professores.

#### 25.3.2. O Que se Mantém do Projeto Original

- **O conceito central:** continua sendo um quiz gamificado de anatomia para alunos de medicina da UnB.
- **O banco de questões:** as ~600 questões validadas por professores continuam sendo a base de conteúdo do sistema. Elas cobrem tórax, neuroanatomia, abdome e esqueleto apendicular, incluindo questões objetivas e casos clínicos.
- **A gamificação como estratégia:** mecânicas de jogo como recompensas, progressão, avatares, competição saudável e feedback continuam sendo pilares do design do produto.
- **O cliente e o público-alvo:** o projeto continua atendendo a demanda dos professores de anatomia da UnB, e o público-alvo primário são os alunos de medicina da universidade.

### 25.4. Contexto Acadêmico e Organizacional

O AnatoquizUp é desenvolvido como projeto da disciplina EPS (Engenharia de Produto de Software) do curso de Engenharia de Software da UnB. Isso significa que, além de entregar um produto funcional, a equipe precisa seguir práticas de engenharia de software exigidas pela disciplina, como metodologias ágeis, documentação, rituais de equipe, entregas incrementais e validação com o cliente.

A equipe está atualmente na fase de **Lean Inception**, que é uma metodologia colaborativa usada para alinhar a visão do produto entre todos os envolvidos (equipe de desenvolvimento e cliente). Durante o Lean Inception, são definidos elementos como: visão do produto, personas (quem vai usar o sistema e como), funcionalidades prioritárias, jornadas de usuário, sequenciamento de entregas e o MVP (Produto Mínimo Viável). A importância dessa fase é enorme, pois é aqui que a equipe garante que está construindo o que o cliente realmente quer — algo que falhou na versão anterior do projeto.

### 25.5. Resumo das Características Técnicas Planejadas

| Aspecto | Decisão |
|---|---|
| Tipo de aplicação | Aplicação web (site) |
| Frontend | React |
| BFF | Node.js + Express (intermediário entre Frontend e serviços de domínio) |
| Backend | Node.js + Express + Prisma |
| Banco de dados | PostgreSQL |
| Multiplataforma | Sim, via design responsivo (sem app nativo) |
| Módulo IA 1 | Geração de questões com validação docente |
| Módulo IA 2 | Geração de imagens anatômicas |
| Módulo IA 3 | Chatbot educacional (questões + livros UnB) |
| Gamificação | Moedas, avatares, progressão, conquistas, competição |
| Banco de questões | ~600 questões validadas (herdadas do projeto anterior) |
| Deploy | Será feito (diferente da v1 que nunca teve deploy) |

### 25.6. Problemas da Versão Anterior Que o AnatoquizUp Busca Resolver

1. **Nunca houve deploy:** O Anatoquiz nunca foi publicado. O AnatoquizUp precisa obrigatoriamente ser entregue em produção, acessível de verdade.
2. **Qualidade técnica insuficiente:** A equipe anterior não conseguiu entregar o produto com a qualidade que o cliente esperava. A nova equipe está usando stack moderna (React + Node.js + PostgreSQL) e seguindo práticas de engenharia de software da disciplina EPS.
3. **Falta de alinhamento com o cliente:** O produto anterior não ficou de acordo com o que o cliente queria. Por isso, a equipe atual está passando pelo processo de Lean Inception para garantir alinhamento total antes de começar a desenvolver.
4. **Ausência de IA:** O projeto original não tinha nenhum componente de inteligência artificial. Os três módulos de IA são a principal adição de valor do AnatoquizUp.
5. **Tecnologia inadequada para o contexto:** Godot é uma engine de jogos, não a ferramenta ideal para um quiz web educacional. A migração para React + Node.js torna o projeto mais adequado, manutenível e acessível.
6. **Sem suporte mobile:** O projeto original não era facilmente acessível em celulares. O AnatoquizUp será responsivo desde o início.

### 25.7. Stakeholders e Público-Alvo

- **Cliente:** Professores de anatomia da Faculdade de Medicina da UnB, que demandam uma ferramenta para aumentar o engajamento dos alunos.
- **Usuários primários:** Alunos de medicina da UnB que cursam disciplinas de anatomia.
- **Usuários secundários:** Os próprios professores, que utilizarão o sistema para validar questões geradas pela IA e acompanhar o progresso dos alunos.
- **Equipe de desenvolvimento:** Alunos do curso de Engenharia de Software da UnB, na disciplina EPS (Engenharia de Produto de Software).

### 25.8. Visão Geral do Fluxo Esperado do Produto

1. O aluno acessa o site pelo navegador (desktop ou celular).
2. Faz login e acessa seu perfil gamificado (avatar, progresso, moedas).
3. Escolhe um tema de anatomia (ex: tórax, neuroanatomia) e inicia um quiz.
4. Responde questões (objetivas e casos clínicos, algumas com imagens anatômicas geradas por IA).
5. Recebe feedback sobre suas respostas e acumula recompensas.
6. Se tiver dúvidas, pode consultar o chatbot de IA para receber explicações baseadas no conteúdo acadêmico da UnB.
7. Professores, em paralelo, recebem sugestões de novas questões geradas pela IA, revisam e aprovam as que consideram adequadas, enriquecendo o banco de questões.

### 25.9. Estado Atual do Projeto

O projeto está em fase inicial. A equipe está conduzindo o Lean Inception com o cliente para definir a visão do produto, personas, funcionalidades prioritárias e o MVP. Decisões técnicas de stack (React, Node.js, PostgreSQL) já foram tomadas. Frontend e Backend já têm código real e parcialmente em produção; o BFF foi introduzido em 2026-05-05 como camada intermediária para isolar Backend e AI e padronizar o ponto de entrada público da plataforma.
