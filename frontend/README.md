# EduCursos — Frontend

Interface da Plataforma de Cursos Online, em **React + TypeScript + Vite**, com
**Bootstrap 5** compilado a partir do Sass com um tema próprio.
Consome a API NestJS que está em `../backend`.

---

## Rodar

Precisa de **três coisas no ar**, nesta ordem:

```bash
# 1. banco
cd ../backend && docker compose up -d

# 2. API (deixa o terminal aberto)
cd ../backend && npm run start:dev

# 3. frontend (outro terminal)
npm install       # só na primeira vez
npm run dev
```

| Endereço | O que é |
|---|---|
| http://localhost:5173 | a tela |
| http://localhost:3000/api | Swagger da API |
| http://localhost:5555 | Prisma Studio (`npx prisma studio --port 5555`) |

### Dados de exemplo

Com a API no ar:

```bash
cd ../backend && npm run dados-exemplo
```

Cria cursos, módulos, aulas, trilha, matrículas, avaliações, certificado, planos,
assinatura e pagamento. Depois entre com **admin@educursos.com** / **senha123**.

---

## Estrutura

```
src/
├── models/      as 14 tabelas em TypeScript + validação zod
├── services/    conversa com a API
│   ├── http.ts     fetch central: token, erros, 401
│   ├── crud.ts     CRUD genérico (simples e de chave composta)
│   ├── token.ts    guarda o JWT no navegador
│   └── recursos.ts os 14 services, um por tabela
├── auth/        contexto de login e rota protegida
├── hooks/       carregamento, formulário e exclusão
├── components/
│   ├── ui/         botão, campo, tabela, modal, selo, alerta…
│   └── layout/     navbar, rodapé, casca
├── pages/       34 telas
├── routes/      mapa de rotas
├── styles/
│   └── tema.scss   variáveis do Bootstrap + peças próprias
└── utils/       formatação de data, moeda, duração
```

---

## O tema

O Bootstrap **não** entra pronto: ele é compilado do Sass com as nossas
variáveis definidas antes, em `src/styles/tema.scss`.

```scss
@import 'bootstrap/scss/functions';

$primary:   #0f5f5c;   // verde-petróleo
$body-bg:   #faf8f4;   // papel quente
$headings-font-family: 'Fraunces', Georgia, serif;
$border-radius: 0.625rem;

@import 'bootstrap/scss/bootstrap';
```

Com isso `.btn-primary`, `.badge`, `.nav-link` e o resto já nascem na cor da
plataforma — o CSS gerado traz `--bs-btn-bg: #0f5f5c`, não o azul padrão.

Os componentes em `components/ui/` são nossos, construídos **sobre** as classes
do Bootstrap: `Botao` monta `btn btn-primary`, `Tabela` monta
`table table-hover` dentro de `table-responsive`, `Modal` monta a estrutura
`modal / modal-dialog / modal-content` controlada por estado do React (sem
carregar o JavaScript do Bootstrap), e `Cartao` monta `card` + `card-body`.

As listagens em cartões usam o **grid system**: `row row-cols-1 row-cols-md-2
row-cols-lg-3 g-3`.

---

## Como o login funciona

1. `POST /auth/login` devolve `access_token`.
2. O token vai para o `localStorage` (`educursos.token`).
3. Todo pedido seguinte leva `Authorization: Bearer <token>` — isso é feito num
   lugar só, no `services/http.ts`.
4. O nome de quem está logado sai do próprio token: o `sub` é lido do payload e
   usado em `GET /usuarios/:id`.
5. Se a API responder **401**, o token é apagado e a tela volta para o login.

> O JWT é **assinado, não criptografado**. Dá para ler o conteúdo dele — por isso
> o backend não coloca senha lá dentro, e o frontend só confia no que a API
> responde, nunca no que está escrito no token.

---

## Detalhes que diferenciam esta API de um JSON Server

Quem vier de um `json-server` vai tropeçar nestes três pontos:

**1. Cada tabela tem o próprio nome de chave, e o id é número.**
Não existe um `id` genérico: é `idCurso`, `idUsuario`, `idPlano`. Por isso o
`CrudService` recebe o nome da chave:

```ts
new CrudService<ICurso, CursoEntrada>('cursos', 'idCurso')
```

**2. Atualização é `PATCH`**, não `PUT`.

**3. Duas tabelas não têm id: têm chave composta.**

| Rota | Chave |
|---|---|
| `/progresso-aulas/:idUsuario/:idAula` | `@@id([idUsuario, idAula])` |
| `/trilhas-cursos/:idTrilha/:idCurso` | `@@id([idTrilha, idCurso])` |

Essas usam o `CrudCompostoService`, que leva os dois ids na URL. Na edição, os
campos da chave ficam travados — mudar a chave seria criar outro registro.

**4. A API não tem filtro por query string.** Não existe `?idCategoria=1`. Onde a
tela filtra (cursos por categoria, aulas por módulo), o recorte é feito no
JavaScript depois de listar.

---

## Datas e dinheiro

**Datas** chegam em ISO (`2026-09-17T00:00:00.000Z`) e vão para a API como
`AAAA-MM-DD`. A conversão fica em `utils/formato.ts`.

**Decimal** (`preco`, `valorPago`) volta da API como **texto** — `"299.9"`, não
`299.9`. É assim que o Prisma serializa `Decimal`, para não perder centavos no
`float` do JavaScript. Por isso o modelo declara `preco: string` e a formatação
passa por `moeda()`.

---

## Telas

| Grupo | Rotas |
|---|---|
| Acesso | `/entrar`, `/cadastrar` |
| Painel | `/` |
| Núcleo | `/usuarios`, `/categorias` |
| Conteúdo | `/cursos` (+ detalhe), `/modulos`, `/aulas` |
| Interação | `/matriculas`, `/avaliacoes`, `/progresso` |
| Curadoria | `/trilhas` (+ detalhe), `/certificados` (+ certificado impresso) |
| Financeiro | `/planos`, `/assinaturas`, `/pagamentos` |

Todas as listagens têm **↻ Atualizar**, que relê do banco — é o botão que mostra
na tela o que foi inserido direto no PostgreSQL.

---

## Problemas comuns

**A tela abre mas nada carrega, e o console mostra erro de CORS**
A API precisa liberar a origem do Vite. Isso está em `backend/src/main.ts`
(`app.enableCors`) e na variável `FRONTEND_URL` do `.env` do backend.

**"Não foi possível falar com o servidor"**
A API não está no ar: `cd ../backend && npm run start:dev`.

**Login dá "E-mail ou senha incorretos" com um usuário antigo**
Usuários criados antes da autenticação existir têm a senha em texto puro no
banco, e o `bcrypt.compare` nunca bate. Cadastre um novo pela tela.

**Voltou para o login sozinho**
O token dura 1 hora (`expiresIn` no `AuthModule`). Depois disso, qualquer
requisição recebe 401 e a sessão cai.
