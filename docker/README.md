# Execução dos Testes End-to-End (E2E)

## Pré-requisitos

Antes de executar os testes E2E, certifique-se de que:

* O ambiente de desenvolvimento do projeto já foi configurado.
* Todas as dependências do projeto foram instaladas (`npm install`).
* O Docker e o Docker Compose estão instalados e em execução.
* O Playwright foi instalado juntamente com os navegadores necessários:

```bash
npx playwright install
```

Além disso, os repositórios que compõem a aplicação (**Web**, **BFF**, **User Service** e **Quiz Service**) devem possuir suas imagens Docker construídas localmente utilizando a tag `local`, conforme descrito na próxima seção.

---

## Build das imagens

O ambiente de testes utiliza imagens Docker locais para todos os serviços da aplicação.

Antes da primeira execução (ou sempre que houver alterações em algum serviço), construa as imagens correspondentes em seus respectivos repositórios.

Exemplo:

```bash
docker build -t anatoquizup-web:local -f Dockerfile.e2e .
```

As seguintes imagens devem estar disponíveis:

| Serviço      | Tag esperada                |
| ------------ | --------------------------- |
| Web          | `anatoquizup-web:local`     |
| BFF          | `anatoquizup-bff:local`     |
| User Service | `anatoquizup-backend:local` |
| Quiz Service | `anatoquizup-quiz:local`    |

Caso alguma dessas imagens não exista, o ambiente E2E não será iniciado corretamente.

---

## Preenchimento dos arquivos de variáveis de ambiente

O ambiente de testes utiliza um conjunto de arquivos de configuração localizados no diretório `docker/`.

```
docker/
├── .env.e2e
├── docker-compose.e2e.yml
└── envs
    ├── .env.e2e.bff
    ├── .env.e2e.quiz
    ├── .env.e2e.user
    └── .env.e2e.web
```

### `.env.e2e`

Contém as variáveis compartilhadas entre todos os serviços, como:

* credenciais do PostgreSQL;
* credenciais do MinIO;
* chaves JWT;
* token interno de comunicação;
* demais segredos compartilhados.

Essas variáveis devem ser preenchidas antes da execução do ambiente de testes e2e.

### `envs/.env.e2e.user`

Configuração específica do serviço de Usuário.

### `envs/.env.e2e.quiz`

Configuração específica do serviço de Quiz.

### `envs/.env.e2e.bff`

Configuração específica do BFF.

### `envs/.env.e2e.web`

Configuração específica da aplicação Web.

Na maioria dos casos esses arquivos já possuem valores adequados para execução local, sendo necessário alterar apenas os segredos presentes em `.env.e2e`, quando aplicável.

---

## Acessando o ambiente

Após iniciar o ambiente com o Docker Compose, a aplicação Web estará disponível em:

```text
http://localhost:15173
```

Esse endereço corresponde ao frontend utilizado pelos testes E2E e também pode ser acessado manualmente para validar o funcionamento da aplicação.

Os principais serviços ficam expostos nas seguintes portas:

| Serviço        | Endereço               |
| -------------- | ---------------------- |
| Frontend (Web) | http://localhost:15173 |
| BFF            | http://localhost:14000 |
| User Service   | http://localhost:3333  |
| Quiz Service   | http://localhost:3334  |
| MinIO API      | http://localhost:9000  |
| MinIO Console  | http://localhost:9001  |

> Os testes End-to-End utilizam automaticamente o frontend disponível em `http://localhost:15173`, conforme configurado no projeto Playwright.

---

# Formas de executar os testes E2E

Existem três formas de executar os testes.

## 1. Execução simples

```bash
npm run e2e
```

Executa todos os testes utilizando o ambiente que já estiver em execução.

Utilize este comando quando os containers já tiverem sido iniciados manualmente.

Exemplo:

```bash
docker compose \
  --env-file ./docker/.env.e2e \
  -f ./docker/docker-compose.e2e.yml \
  up --build -d

npm run e2e
```

Para realizar os testes novamente encerre os containers e remova seus volumes:

```bash
docker compose \
  --env-file ./docker/.env.e2e \
  -f ./docker/docker-compose.e2e.yml \
  down -v
```

---

## 2. Execução com interface gráfica

```bash
npm run e2e:ui
```

Abre a interface gráfica do Playwright.

Essa opção permite:

* executar testes individualmente;
* reexecutar testes rapidamente;
* visualizar logs;
* inspecionar seletores;
* acompanhar a execução em tempo real.

> Assim como `npm run e2e`, este comando pressupõe que o ambiente Docker já esteja em execução.
> Para realizar os testes novamente também é preciso encerrar os containers e remover seus volumes:

---

## 3. Execução completa

```bash
npm run e2e:complete
```

Executa todo o fluxo automaticamente.

O script realiza as seguintes etapas:

1. inicia todo o ambiente Docker utilizando `docker-compose.e2e.yml`;
2. aguarda a inicialização dos serviços;
3. executa todos os testes Playwright;
4. encerra os containers;
5. remove os volumes criados durante a execução.

Essa é a forma recomendada para execução em ambientes de integração contínua (CI) e para validações completas antes de uma entrega.

Não é necessário iniciar ou encerrar os containers manualmente ao utilizar este comando.
