# Plataforma de Cursos Online

Backend da plataforma de cursos (LAB03), feito com **NestJS + Prisma + PostgreSQL**.

```
plataformaCursos/
└── backend/     API NestJS, Prisma e o PostgreSQL em Docker
```

Quase todos os comandos deste guia rodam dentro da pasta `backend`:

```bash
cd ~/TCS/plataformaCursos/backend
```

---

## Pré-requisitos

- **Node.js** (v22 ou superior) — confira com `node -v`
- **Docker** — confira com `docker -v`

---

## Instalação (só na primeira vez)

```bash
npm install                   # baixa as dependências
cp .env.example .env          # cria o arquivo de configuração
docker compose up -d          # sobe o PostgreSQL
npx prisma migrate dev        # cria todas as tabelas
npx prisma generate           # gera o cliente do Prisma
```

---

## Rodar o projeto

O banco sobe em segundo plano e **precisa vir antes** da API:

```bash
docker compose up -d
```

Depois, cada comando abaixo ocupa um terminal. Deixe aberto.

| Comando | Abre em | O que é |
|---|---|---|
| `npm run start:dev` | http://localhost:3000/api | API + Swagger |
| `npx prisma studio --port 5555` | http://localhost:5555 | visualizador do banco |

`Ctrl+C` derruba o que estiver naquele terminal.

Para desligar o banco: `docker compose down` (os dados ficam salvos).

---

## Comandos do Prisma

Estes são os que você mais vai usar.

### Criar ou alterar tabelas

```bash
npx prisma migrate dev --name nome_da_mudanca
```

Compara o `prisma/schema.prisma` com o banco, gera o SQL da diferença, aplica e
já regenera o cliente. O `--name` é um apelido livre — use algo que descreva o
que mudou (`--name cursos`, `--name add_campo_nivel`).

### Regenerar o cliente TypeScript

```bash
npx prisma generate
```

Necessário sempre que o schema muda. Se esquecer, o build reclama:
`Property 'xxx' does not exist on type 'PrismaService'`.

### Ver e editar os dados

```bash
npx prisma studio --port 5555
```

Abre uma tela tipo planilha com todas as tabelas. Dá para **Add record**,
editar clicando na célula e apagar linhas. Mexe no banco de verdade.

### Organizar o schema

```bash
npx prisma format
```

Alinha as colunas e arruma a indentação do `schema.prisma`.

### Conferir o estado das migrations

```bash
npx prisma migrate status
```

Diz se o banco está em dia com as migrations do projeto.

### Apagar tudo e recomeçar

```bash
npx prisma migrate reset
```

⚠️ **Apaga todos os dados.** Derruba as tabelas, reaplica todas as migrations do
zero e regenera o cliente. Útil quando o banco fica em um estado esquisito e você
quer começar limpo. Ele pede confirmação antes.

---

## Como criar uma tabela nova

1. Abra `prisma/schema.prisma` e escreva o model:

   ```prisma
   model Exemplo {
     idExemplo Int    @id @default(autoincrement()) @map("ID_Exemplo")
     titulo    String @map("Titulo")

     @@map("Exemplos")
   }
   ```

2. Aplique no banco:

   ```bash
   npx prisma migrate dev --name exemplos
   ```

3. Gere as rotas da API:

   ```bash
   nest generate resource exemplos --no-spec
   ```

   Escolha **REST API** e responda **yes** para os endpoints do CRUD.

4. No `src/exemplos/exemplos.module.ts`, importe o `PrismaModule`:

   ```ts
   imports: [PrismaModule],
   ```

5. Preencha o service usando `this.prisma.exemplo` e o DTO com as validações.

> **Sobre o `@map`:** ele separa o nome no código do nome no banco. No
> TypeScript você escreve `idExemplo`; no PostgreSQL a coluna é `ID_Exemplo`,
> como pede o enunciado do trabalho.

---

## Consultar o banco pelo terminal

```bash
docker exec -it cursos-postgres psql -U postgres -d cursosdb
```

Já dentro do psql:

```sql
\dt                          -- lista as tabelas
\d "Usuarios"                -- mostra as colunas de uma tabela
select * from "Usuarios";    -- as aspas são obrigatórias (nome com maiúscula)
\q                           -- sair
```

---

## Docker

```bash
docker compose up -d      # ligar o banco
docker compose down       # desligar (dados preservados)
docker compose ps         # ver se está rodando
docker ps                 # todos os containers da máquina
```

> O `docker-compose.yml` declara `name: cursos` e publica a porta **5433**.
> Isso evita conflito com o banco do projetoCinema, que usa a 5432.

---

## Git

```bash
git status                # o que está pendente
git diff                  # o que mudou, linha por linha
git add .                 # marca tudo para o commit
git commit -m "mensagem"  # cria o commit
git push                  # envia para o GitHub
git log --oneline         # histórico
```

Antes de dar push, se errar a mensagem: `git commit --amend -m "nova mensagem"`

---

## Endpoints

Documentação interativa em http://localhost:3000/api — clique na rota,
**Try it out**, preencha e **Execute**.

Todas seguem o mesmo padrão: `GET`, `POST`, `GET/:id`, `PATCH/:id`, `DELETE/:id`.

| Rota | Tabela |
|---|---|
| `/usuarios` | Usuarios |
| `/categorias` | Categorias |
| `/cursos` | Cursos |
| `/modulos` | Modulos |
| `/aulas` | Aulas |
| `/matriculas` | Matriculas |
| `/avaliacoes` | Avaliacoes |
| `/trilhas` | Trilhas |
| `/certificados` | Certificados |

Duas tabelas têm **chave primária composta** — não têm um `id` só, então a rota
leva os dois ids em vez de um:

| Rota | Chave |
|---|---|
| `/progresso-aulas/:idUsuario/:idAula` | `@@id([idUsuario, idAula])` |
| `/trilhas-cursos/:idTrilha/:idCurso` | `@@id([idTrilha, idCurso])` |

No service, o Prisma junta os dois campos em um filtro só:

```ts
where: { idUsuario_idAula: { idUsuario, idAula } }
```

**Ainda sem rotas:** `Planos`, `Assinaturas` e `Pagamentos`. As tabelas já
existem no banco — falta gerar o CRUD seguindo o passo a passo acima.

### Datas

As colunas de data guardam só o dia (`@db.Date`), e o JSON manda texto. Nos DTOs
elas são validadas com `@IsDateString()` no formato `AAAA-MM-DD`, e o service
converte para `Date` antes de entregar ao Prisma:

```ts
dataPublicacao: dataPublicacao ? new Date(dataPublicacao) : undefined,
```

---

## Problemas comuns

**`EADDRINUSE: address already in use :::3000`**
A porta está ocupada, geralmente por uma instância antiga que ficou rodando.

```bash
ss -ltnp | grep :3000     # descobre o PID
kill <PID>                # derruba
```

**`Property 'xxx' does not exist on type 'PrismaService'`**
Faltou regenerar o cliente depois de mexer no schema: `npx prisma generate`

**`Can't reach database server at localhost:5433`**
O banco não está no ar: `docker compose up -d`

**A API cai sozinha enquanto está rodando**
Não rode `npm run build` com o `npm run start:dev` aberto — o build apaga a
pasta `dist` embaixo do watch. Use um ou outro.

**`Missing script: start:dev`**
Você está na pasta errada. Precisa estar em `backend`.

---

## Tecnologias

NestJS 11 · Prisma 7 · PostgreSQL 16 (Docker) · class-validator · Swagger
