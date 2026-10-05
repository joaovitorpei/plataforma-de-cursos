# Roteiro de testes — EduCursos

Guia para conferir a plataforma à mão, começando do **banco zerado**.

A plataforma tem três tipos de conta, e boa parte do teste é ver que cada uma
enxerga e pode coisas diferentes:

| Conta | Quem é | O que pode |
|---|---|---|
| **Administrador** | dono | tudo, inclusive financeiro, e cria as contas da equipe |
| **Professor** | quem ensina | cria e edita **os próprios** cursos, módulos e aulas; acompanha alunos. **Sem financeiro** |
| **Aluno** | quem estuda | vê o catálogo, se matricula, assiste ao que comprou, avalia e paga o que é seu |

Vá marcando os `[ ]`. No fim tem o que me mandar.

---

## Antes de começar

```bash
# 1. banco — SEMPRE primeiro, tudo depende dele
cd ~/TCS/plataformaCursos/backend && docker compose up -d

# 2. (opcional) zerar o banco para começar do nada
cd ~/TCS/plataformaCursos/backend && npx prisma migrate reset

# 3. criar o administrador  ← OBRIGATÓRIO depois de todo reset
cd ~/TCS/plataformaCursos/backend && npm run admin-inicial

# 4. API — deixe aberto
cd ~/TCS/plataformaCursos/backend && npm run start:dev

# 5. tela — deixe aberto
cd ~/TCS/plataformaCursos/frontend && npm run dev
```

| Endereço | O que é |
|---|---|
| http://localhost:5173 | EduCursos |
| http://localhost:3000/api | Swagger |
| http://localhost:5555 | Prisma Studio (`npx prisma studio --port 5555`) |

**A conta de administrador que o passo 3 cria:**

```
João Vitor Peixoto · joaovitor@gmail.com · senha123
```

> **O passo 3 não é opcional.** O cadastro público só cria aluno, e só um admin
> cria outro admin. Com o banco zerado não existe ninguém para fazer o
> primeiro — por isso o comando escreve direto no banco. Se esquecer dele, não
> vai conseguir entrar como administrador.

### Erros comuns na hora de subir

| Mensagem | O que é |
|---|---|
| `EADDRINUSE: port 3000` | sobrou outro processo. `ss -ltnp \| grep :3000` e `kill <PID>` |
| `Port 5173 is in use, trying 5174` | **não deixe assim** — o CORS só libera a 5173. Libere a porta e suba de novo |
| Prisma Studio: *could not load schema metadata* | o banco está desligado. `docker compose up -d` e clique em Retry |
| Tela não carrega nada, console mostra CORS | o front está em porta diferente da 5173 |

> Deixe o console do navegador aberto (**F12 → Console**) o tempo todo.

---

## Roteiro A — O administrador prepara a plataforma

### A1. Entrar como administrador

- [ ] Abra http://localhost:5173
- [ ] Na tela de login há **três abas**: Aluno · Professor · Administrador
- [ ] Clique em **Administrador**
- [ ] `joaovitor@gmail.com` / `senha123` → **Entrar como administrador**

**Confira:** o selo ao lado do nome diz **Administrador**, e o menu tem cinco
itens: *Início · Catálogo · Conteúdo · Alunos · **Gestão***.

### A2. A aba orienta, mas não concede

- [ ] Clique em **Sair**
- [ ] Vá na aba **Aluno** e entre com `joaovitor@gmail.com` / `senha123`
- [ ] Deve aparecer: **"Esta conta é de administrador. Use a aba Administrador
      para entrar."** e o login **não** completa

> Isso mostra que a aba não dá poder nenhum — quem define o perfil é a conta.

- [ ] Entre de novo pela aba certa

### A3. Criar as contas da equipe

Menu **Gestão → Usuários → Novo usuário**

- [ ] Nome: `Rita Professora` · E-mail: `rita@educursos.com` · Senha: `senha123`
- [ ] **Tipo de conta: Professor** · Salvar
- [ ] Repita: `Carlos Professor` · `carlos@educursos.com` · `senha123` ·
      **Professor**
- [ ] Na lista, a coluna **Tipo** mostra o selo de cada um

### A4. Categoria e plano

Menu **Catálogo → Categorias → Nova categoria**

- [ ] Nome: `Banco de Dados` · Salvar
- [ ] Crie de novo com o mesmo nome → **"Já existe um registro cadastrado com
      este nome"**

Menu **Gestão → Planos → Novo plano**

- [ ] Nome: `Semestral` · Preço: `149.90` · Duração: `6` · Salvar
- [ ] Deve aparecer **R$ 149,90**
- [ ] Teste preço `-10` → recusa. Preço `10.999` → recusa (só duas casas)

---

## Roteiro B — O professor monta o curso dele

### B1. Entrar como professor

- [ ] **Sair** → aba **Professor** → `rita@educursos.com` / `senha123`
- [ ] Selo diz **Professor**
- [ ] O menu tem **quatro** itens: *Início · Catálogo · Conteúdo · Alunos*
- [ ] **Sumiu a Gestão** — sem planos, assinaturas, pagamentos nem usuários

### B2. Criar o curso

Menu **Catálogo → Cursos → Novo curso**

- [ ] **Confira:** o campo **Instrutor** está **travado** no nome da Rita, com
      a nota *"Você é o instrutor dos cursos que cria"*
- [ ] Título: `PostgreSQL na Prática` · Categoria: **Banco de Dados**
- [ ] Nível: `Intermediário` · Total de aulas: `2` · Carga: `9` · Salvar

### B3. Módulos — a ordem vem sozinha

Menu **Conteúdo → Módulos → Novo módulo**

- [ ] Curso: **PostgreSQL na Prática** · Título: `Modelagem`
- [ ] A **Ordem deve vir `1`** sozinha · Salvar
- [ ] Novo módulo, mesmo curso · Título: `Consultas`
- [ ] A **Ordem deve vir `2`**, não 1 · Salvar

### B4. Aulas — preencha a URL

Menu **Conteúdo → Aulas → Nova aula**

- [ ] Módulo: **Modelagem** · Título: `Chaves primárias` · Tipo: `Video`
- [ ] Duração: `25` · Ordem vem **1**
- [ ] **URL do conteúdo:** `https://exemplo.com/aula1` ← *não pule*
- [ ] Salvar
- [ ] Outra: `Normalização` · `Texto` · `15` · Ordem **2** ·
      URL `https://exemplo.com/aula2`

> A URL é o que o aluno só recebe **depois de se matricular**. Sem ela, não dá
> para ver a diferença no Roteiro C.

### B5. O professor não mexe no curso do outro

- [ ] **Sair** → entre como **Carlos** (`carlos@educursos.com`, aba Professor)
- [ ] Menu **Catálogo → Cursos** → ele **vê** o curso da Rita (é catálogo)
- [ ] Clique em **Editar** no curso dela, mude o título e **Salvar**
- [ ] Deve aparecer: **"Este conteúdo pertence a outro professor. Você só pode
      editar os cursos em que é o instrutor."**
- [ ] Tente **Excluir** o curso dela → mesma mensagem
- [ ] Em **Conteúdo → Módulos**, tente editar o módulo `Modelagem` → mesma coisa

### B6. O professor não entra no financeiro

- [ ] Digite na barra de endereço: `http://localhost:5173/planos`
- [ ] Deve aparecer a tela 🛡️ **"Esta área é dos professores"**… ou o bloqueio
      de permissão. O importante: **não** mostra os planos
- [ ] Repita com `/pagamentos` e `/usuarios`

---

## Roteiro C — O aluno usa a plataforma

### C1. Criar a conta pela tela

- [ ] **Sair** → **Cadastre-se**
- [ ] **Confira:** não há escolha de tipo. Um aviso diz *"Você está criando uma
      conta de aluno"*
- [ ] Nome: `Pedro Aluno` · `pedro@educursos.com` · `senha123` · Criar conta
- [ ] Entra direto, com selo **Aluno**
- [ ] Menu com **quatro** itens: *Início · Catálogo · Meus estudos · Assinatura*

### C2. Ver o curso sem estar matriculado

Menu **Catálogo → Cursos** → **PostgreSQL na Prática**

- [ ] Nos cards só existe o botão **Ver** — nada de Editar nem Excluir
- [ ] Não há botão "Novo curso"
- [ ] O nome da instrutora (**Rita Professora**) aparece no card
- [ ] Dentro do curso: faixa 🔒 **"Conteúdo bloqueado"**
- [ ] As duas aulas **aparecem** com título, tipo e duração…
- [ ] …mas cada uma com **cadeado** e **sem** botão Assistir

### C3. Matricular-se e ver liberar

- [ ] Clique em **Matricular-se**
- [ ] A faixa vira ✓ **"Você está matriculado"** (borda verde)
- [ ] Os cadeados viram **▶** e aparece **Assistir**
- [ ] Clique em **Assistir** → abre a URL que a Rita cadastrou

### C4. As três situações da matrícula

Menu **Meus estudos → Minhas matrículas**

- [ ] A matrícula nova aparece como **Em andamento** (amarelo)
- [ ] Clique em **Editar** e ponha uma data **futura** (ex. `20/12/2027`) ·
      Salvar
- [ ] A situação vira **Previsto para 20/12/2027** — *não* "Concluído"
- [ ] Edite de novo com uma data **passada** (ex. ontem) · Salvar
- [ ] Agora sim: **Concluído em …** (verde)

### C5. Cada um só mexe no que é seu

- [ ] Em **Meus estudos → Minhas avaliações → Nova avaliação**
- [ ] **Confira:** o campo "Aluno" tem **uma opção só** — Pedro Aluno
- [ ] Curso: **PostgreSQL na Prática** · Nota: 5 estrelas · Salvar

### C6. O certificado ao concluir

Menu **Meus estudos → Meu progresso → Registrar progresso**

- [ ] Aluno: Pedro · Aula: **Chaves primárias** · Situação `Concluido` · Salvar
- [ ] Volte no curso → aparece a barra **"Aulas concluídas 1/2"**
- [ ] Registre a segunda aula também
- [ ] Volte no curso → agora aparece 🏆 **"Curso concluído! Você já pode emitir
      o seu certificado"** com o botão
- [ ] Clique em **Emitir certificado**
- [ ] Em **Meus estudos → Meus certificados**, clique em **Ver** → o diploma
      com o nome dele e o código
- [ ] **Imprimir** → na prévia aparece **só o diploma**, sem menu nem rodapé

---

## Roteiro D — As proteções, forçadas de propósito

Continue logado como **Pedro** (aluno).

### D1. Forçar a URL de uma tela de equipe

- [ ] `http://localhost:5173/categorias` → tela 🛡️ **"Esta área é dos
      professores"**
- [ ] Repita com `/usuarios`, `/aulas`, `/planos`

### D2. Forçar pela API — a proteção de verdade

A tela esconder o botão é conveniência. Quem barra mesmo é a API:

- [ ] Com o Pedro logado, abra **F12 → Console** e cole:

  ```js
  fetch('http://localhost:3000/categorias', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('educursos.token'),
    },
    body: JSON.stringify({ nome: 'Invadida' }),
  })
    .then((r) => r.json())
    .then(console.log);
  ```

- [ ] Resposta: **403** *"Esta ação é restrita a administradores da
      plataforma"*
- [ ] Confirme como admin: a categoria "Invadida" **não** existe

### D3. A mesma rota, respostas diferentes

- [ ] Como **Pedro**, em **Meus estudos → Minhas matrículas**: aparece **1**
- [ ] Saia, entre como **Rita**, em **Alunos → Matrículas**: aparece a do Pedro

Mesma rota da API (`GET /matriculas`). Quem filtra é o backend, conforme quem
pergunta.

### D4. O admin promove alguém

- [ ] Entre como **administrador**
- [ ] **Gestão → Usuários** → **Editar** no Pedro → Tipo de conta: **Professor**
      → Salvar
- [ ] Saia e entre como Pedro, **aba Professor** → agora tem o menu de professor
- [ ] Volte como admin e devolva o Pedro para **Aluno**

> A mudança só vale depois que o Pedro **sai e entra de novo** — o perfil viaja
> dentro do token, que foi emitido no login.

---

## Roteiro E — Do banco para a tela

```bash
cd ~/TCS/plataformaCursos/backend && npx prisma studio --port 5555
```

- [ ] Tabela **Categorias** → botão de adicionar linha (**Insert row** ou
      **Add record**, depende da versão) → Nome: `Redes` → Save
- [ ] No EduCursos (como admin), **Catálogo → Categorias**, aperte **F5** →
      `Redes` aparece
- [ ] Tabela **Cursos** → mude o `Titulo` → Save → **F5** na tela → aparece
- [ ] Tabela **Usuarios** → veja a coluna **Perfil**: `ADMIN`, `INSTRUTOR` e
      `USER`
- [ ] Veja a coluna **SenhaHash**: começa com `$2b$10$…` — nenhuma senha em
      texto puro

---

## Roteiro F — Erros e sessão

- [ ] Logado, aperte **F5** → não pode piscar no login; mostra "Verificando sua
      sessão…" e volta para onde estava
- [ ] **Sair** → cai no login
- [ ] Com a sessão encerrada, abra `http://localhost:5173/cursos` → manda para
      o login
- [ ] Entre → volta para `/cursos` automaticamente

**Chave estrangeira** (como admin):
- [ ] **Catálogo → Categorias** → excluir `Banco de Dados` (que tem curso) →
      **"Não é possível excluir: existem cursos que dependem deste registro"**

**Validação:**
- [ ] Cadastre-se com e-mail `abc` → **"Digite um e-mail válido"**
- [ ] Senha com 3 letras → **"Senha deve ter no mínimo 6 caracteres"**

**API fora do ar:**
- [ ] `Ctrl+C` no terminal da API → F5 numa listagem →
      **"Não foi possível falar com o servidor. Ele está no ar?"**
- [ ] Suba de novo e atualize

---

## Roteiro G — Visual

- [ ] Na tela de login, o painel verde tem **o símbolo da plataforma** e a
      frase — sem lista de texto
- [ ] Os títulos estão numa fonte **serifada** (Fraunces)? Se não, a fonte do
      Google não carregou
- [ ] Diminua a janela até uns **600px**:
  - [ ] o botão **☰** aparece e abre o menu em coluna
  - [ ] nenhuma tabela faz a **página** rolar de lado
  - [ ] os cards passam de 3 colunas para 1
  - [ ] no login, o símbolo encolhe e o painel vira faixa no topo
- [ ] Passe o mouse sobre os cards → sobem um pouco
- [ ] Abra um modal de exclusão e aperte **Esc** → fecha

---

## Roteiro H — Pelo Swagger

Abra **http://localhost:3000/api**

### H1. Como escolher o tipo de conta aqui

**Não existe botão nem caixinha.** No Swagger você monta o JSON na mão, e o
tipo de conta é um campo dentro dele. **Mas atenção: são duas rotas
diferentes.**

| Rota | Quem usa | O que cria |
|---|---|---|
| `POST /auth/cadastrar` | qualquer um, sem token | **sempre aluno** |
| `POST /usuarios` | só administrador, com token | o tipo que você escolher |

**Teste o cadastro público primeiro:**

- [ ] `POST /auth/cadastrar` → **Try it out** → corpo:

  ```json
  {
    "nomeCompleto": "Aluno do Swagger",
    "email": "alunoswagger@educursos.com",
    "senha": "senha123"
  }
  ```

- [ ] **Execute** → **201**, e a resposta traz `"perfil": "USER"`
- [ ] Repare que **não existe** campo `perfil` nesse corpo — nem dá para pedir
      outra coisa
- [ ] A resposta também **não traz a senha**

### H2. A pegadinha do 401

- [ ] `GET /usuarios` → **Try it out** → **Execute** → **401**

Está certo: todas as rotas exigem token, menos login e cadastro.

### H3. Pegar o token e autorizar

- [ ] `POST /auth/login` → corpo:

  ```json
  { "email": "joaovitor@gmail.com", "senha": "senha123" }
  ```

- [ ] **Execute** → copie o `access_token` (só o texto entre aspas)
- [ ] Botão **Authorize** 🔓 no topo → cole → **Authorize** → **Close**
- [ ] Repita `GET /usuarios` → agora **200**

> Cole **só o token**, sem escrever "Bearer" — o Swagger já põe isso.

### H4. Criar professor pelo Swagger

Agora sim, com token de admin:

- [ ] `POST /usuarios` → corpo:

  ```json
  {
    "nomeCompleto": "Professor do Swagger",
    "email": "profswagger@educursos.com",
    "senha": "senha123",
    "perfil": "INSTRUTOR"
  }
  ```

- [ ] **Execute** → **201** com `"perfil": "INSTRUTOR"`
- [ ] O campo aceita exatamente três palavras, em maiúsculas:

  | Valor | Vira |
  |---|---|
  | `"USER"` | aluno |
  | `"INSTRUTOR"` | professor |
  | `"ADMIN"` | administrador |

- [ ] Escreva errado (`"professor"`) → **400** *"Perfil tem um valor que não é
      aceito"*

### H5. O filtro que alimenta os seletores da tela

- [ ] `GET /usuarios` com o parâmetro **perfil** = `USER` → só alunos
- [ ] Troque para `INSTRUTOR` → só professores
- [ ] Deixe em branco → todos

É este filtro que faz o campo "Aluno" de um formulário mostrar só alunos, e o
campo "Instrutor" só professores.

### H6. Professor pode, aluno não

- [ ] **Authorize → Logout**, pegue o token da **Rita** (H3 com
      `rita@educursos.com`) e autorize
- [ ] `POST /categorias` com `{ "nome": "Pelo Swagger" }` → **201**
- [ ] `GET /pagamentos` → **403** *"restrita a administradores"* ← o professor
      não entra no financeiro
- [ ] `POST /usuarios` → **403** ← nem cria contas

Agora com o aluno:

- [ ] Logout, pegue o token do **Pedro**, autorize
- [ ] `POST /categorias` → **403**
- [ ] `GET /cursos` → **200** ← ler o catálogo todo mundo pode

### H7. Um professor contra o curso do outro

- [ ] Autorizado como **Carlos**, faça `GET /cursos` e anote o `idCurso` do
      curso da Rita
- [ ] `DELETE /cursos/{id}` desse curso → **403** *"Este conteúdo pertence a
      outro professor"*
- [ ] `PATCH /cursos/{id}` → mesma coisa

### H8. O professor não escolhe de quem é o curso

- [ ] Ainda como **Carlos**, faça `POST /cursos` mandando o id de **outra**
      pessoa no instrutor:

  ```json
  {
    "titulo": "Teste de dono",
    "idInstrutor": 999,
    "idCategoria": 1
  }
  ```

- [ ] **Execute** → **201**, mas veja a resposta: o `idInstrutor` gravado é o
      **do Carlos**, não o 999

> O backend sobrescreve. Nem adianta mandar outro valor.

### H9. O certificado só sai com o curso concluído

- [ ] Autorize como um **aluno** que não terminou um curso
- [ ] `GET /certificados/elegibilidade/{idCurso}` → mostra
      `{"totalAulas":2,"aulasConcluidas":0,"concluiu":false,"jaEmitido":false}`
- [ ] `POST /certificados` para si mesmo → **403** *"Você ainda não concluiu
      todas as aulas deste curso"*

### H10. Os erros aparecem certinho

- [ ] `POST /categorias` com nome repetido → **409**
- [ ] `POST /avaliacoes` com `"nota": 9` → **400** *"Nota não pode ser maior
      que 5"*
- [ ] `POST /modulos` com `"idCurso": 999999` → **400** *"O curso informado não
      existe"*
- [ ] `DELETE /planos/999999` → **404** *"Registro não encontrado"*

---

## O que me mandar depois

Copie e preencha:

```
ROTEIRO A (admin prepara):        passou / parou no passo ___
ROTEIRO B (professor monta):      passou / parou no passo ___
ROTEIRO C (aluno usa):            passou / parou no passo ___
ROTEIRO D (proteções forçadas):   passou / parou no passo ___
ROTEIRO E (banco → tela):         passou / parou no passo ___
ROTEIRO F (erros e sessão):       passou / parou no passo ___
ROTEIRO G (visual):               passou / parou no passo ___
ROTEIRO H (Swagger):              passou / parou no passo ___

Erros no console (F12 → Console), se houver:


O que achei estranho:

```

Se algum passo falhar, me diga **qual**, **o que apareceu na tela** e **com
qual conta você estava** — essa última parte é a que mais ajuda, agora que são
três perfis.
