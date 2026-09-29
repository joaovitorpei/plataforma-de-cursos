# Roteiro de testes — EduCursos

Guia para conferir a plataforma à mão, do jeito que o professor vai avaliar:
**da tela para o banco** e **do banco para a tela**.

Vá marcando os `[ ]`. No fim tem o que me mandar para eu verificar o resto.

---

## Antes de começar

Três terminais, nesta ordem:

```bash
# 1. banco
cd ~/TCS/plataformaCursos/backend && docker compose up -d

# 2. API — deixe aberto
cd ~/TCS/plataformaCursos/backend && npm run start:dev

# 3. tela — deixe aberto
cd ~/TCS/plataformaCursos/frontend && npm run dev
```

| Endereço | O que é |
|---|---|
| http://localhost:5173 | EduCursos |
| http://localhost:3000/api | Swagger |
| http://localhost:5555 | Prisma Studio (`npx prisma studio --port 5555` no backend) |

> **Dica:** deixe o console do navegador aberto (**F12 → Console**) o tempo todo.
> Se algo não funcionar, o erro aparece ali — e é isso que eu preciso ver.

---

## Roteiro A — Da tela para o banco

O caminho principal. Cada passo cria algo pela interface; no fim conferimos no
PostgreSQL.

### A1. Cadastro

- [ ] Abra http://localhost:5173 — deve cair na tela de login
- [ ] Clique em **Cadastre-se**
- [ ] Preencha:
  - Nome completo: `Rita Instrutora`
  - E-mail: `rita@educursos.com`
  - Senha: `senha123`
- [ ] **Criar conta** → deve entrar direto no painel, sem pedir login de novo

**Teste de validação** — volte e tente cadastrar de novo com o mesmo e-mail:
- [ ] Deve aparecer erro **"Já existe um registro com este valor em: email"**

### A2. Login

- [ ] Clique em **Sair** (canto superior direito)
- [ ] Entre com `rita@educursos.com` / `senha123`
- [ ] Agora erre a senha de propósito → deve dizer **"E-mail ou senha incorretos"**

### A3. Categoria

Menu **Catálogo → Categorias → Nova categoria**

- [ ] Nome: `Banco de Dados`
- [ ] Descrição: `Modelagem, SQL e administração de bancos relacionais.`
- [ ] Salvar → deve voltar para a lista já com a linha nova

### A4. Curso

Menu **Catálogo → Cursos → Novo curso**

- [ ] Título: `PostgreSQL na Prática`
- [ ] Descrição: `Do modelo relacional às consultas do dia a dia.`
- [ ] Instrutor: **Rita Instrutora**
- [ ] Categoria: **Banco de Dados**
- [ ] Nível: `Intermediário`
- [ ] Data de publicação: escolha qualquer data
- [ ] Total de aulas: `3` · Carga horária: `9`
- [ ] Salvar

### A5. Módulos — atenção à ordem

Menu **Conteúdo → Módulos → Novo módulo**

- [ ] Curso: **PostgreSQL na Prática** · Título: `Modelagem` · Ordem: deve vir **1** sozinha
- [ ] Salvar
- [ ] Novo módulo de novo → mesmo curso · Título: `Consultas`
- [ ] **Confira:** a Ordem deve vir **2** automaticamente, não 1

### A6. Aulas

Menu **Conteúdo → Aulas → Nova aula**

- [ ] Módulo: **Modelagem** · Título: `Chaves primárias e estrangeiras`
- [ ] Tipo: `Video` · Duração: `25` · Ordem: deve vir **1**
- [ ] Salvar
- [ ] Nova aula → mesmo módulo · Título: `Normalização` · Tipo: `Texto` · Duração: `15`
- [ ] **Confira:** Ordem deve vir **2**

### A7. Ver o curso montado

Menu **Catálogo → Cursos** → clique em **PostgreSQL na Prática**

- [ ] Os dois módulos aparecem **na ordem certa** (Modelagem, depois Consultas)
- [ ] As aulas aparecem dentro de "Modelagem", numeradas 1 e 2
- [ ] O nome da instrutora e a categoria aparecem no topo

### A8. Matrícula e avaliação

Menu **Alunos → Matrículas → Nova matrícula**

- [ ] Aluno: **Rita Instrutora** · Curso: **PostgreSQL na Prática** · Salvar
- [ ] Na lista, a situação deve aparecer como **Em andamento** (selo amarelo)

Menu **Alunos → Avaliações → Nova avaliação**

- [ ] Aluno: **Rita** · Curso: **PostgreSQL na Prática** · Nota: **5 estrelas**
- [ ] Comentário: `Exemplos muito bons.` · Salvar
- [ ] Volte no detalhe do curso → a avaliação deve aparecer no rodapé com as estrelas

### A9. Progresso — chave composta

Menu **Alunos → Progresso → Registrar progresso**

- [ ] Aluno: **Rita** · Aula: **Chaves primárias e estrangeiras**
- [ ] Data de conclusão: hoje · Situação: `Concluido` · Salvar
- [ ] Na lista, veja a coluna **Chave** — deve mostrar algo como `12/3`
      (é o par aluno/aula: essa tabela não tem id próprio)
- [ ] Clique em **Editar** → aluno e aula devem estar **travados** (cinza)
- [ ] Mude a situação para `Revisado` e salve

### A10. Trilha — a outra chave composta

Menu **Catálogo → Trilhas → Nova trilha**

- [ ] Título: `Especialista em Dados` · Categoria: **Banco de Dados** · Salvar
- [ ] Clique na trilha para abrir o detalhe
- [ ] Em **Adicionar curso**: escolha **PostgreSQL na Prática**, ordem `1` → Adicionar
- [ ] O curso deve aparecer na tabela acima, com a coluna **Chave**

### A11. Certificado

Menu **Alunos → Certificados → Emitir certificado**

- [ ] Aluno: **Rita** · Curso: **PostgreSQL na Prática**
- [ ] O código já vem sugerido (`CERT-2026-XXXXX`) — pode manter
- [ ] Salvar → clique em **Ver**
- [ ] O diploma deve aparecer com o nome dela e a carga horária
- [ ] Clique em **Imprimir** → na prévia deve aparecer **só o diploma**,
      sem menu e sem rodapé (depois é só cancelar)

### A12. Financeiro

Menu **Financeiro → Planos → Novo plano**

- [ ] Nome: `Semestral` · Preço: `149.90` · Duração: `6` · Salvar
- [ ] Na lista deve aparecer formatado como **R$ 149,90**

**Teste de validação:**
- [ ] Tente criar um plano com preço `-10` → deve recusar
- [ ] Tente com preço `10.999` → deve recusar (só duas casas)

Menu **Financeiro → Assinaturas → Nova assinatura**

- [ ] Assinante: **Rita** · Plano: **Semestral**
- [ ] **Confira:** ao escolher o plano, a data de fim deve se preencher sozinha
      6 meses à frente
- [ ] Salvar → a situação deve aparecer como **Vigente**

Menu **Financeiro → Pagamentos → Registrar pagamento**

- [ ] Assinatura: a que você acabou de criar
- [ ] **Confira:** o valor deve se preencher sozinho com `149.9`
- [ ] Método: `Pix` · Código: `TX-2026-000777` · Salvar
- [ ] Acima da tabela deve aparecer o card **Total recebido**

---

## Roteiro B — Do banco para a tela

O sentido inverso. É a outra metade da avaliação.

```bash
cd ~/TCS/plataformaCursos/backend && npx prisma studio --port 5555
```

- [ ] No Prisma Studio, abra a tabela **Categorias**
- [ ] **Add record** → Nome: `Redes` → Descricao: `Infraestrutura e protocolos.`
- [ ] **Save 1 change**
- [ ] Volte na aba do EduCursos, em **Catálogo → Categorias**
- [ ] Clique em **↻ Atualizar** → a categoria `Redes` tem que aparecer

Repita com algo mais visível:

- [ ] No Prisma Studio, tabela **Cursos** → edite o `Titulo` do
      "PostgreSQL na Prática" para `PostgreSQL na Prática (revisado)`
- [ ] **Save**
- [ ] No EduCursos, **Catálogo → Cursos** → **↻ Atualizar**
- [ ] O título novo tem que aparecer no card

- [ ] No painel inicial (**Início**), clique em **↻ Atualizar do banco**
- [ ] Os contadores têm que refletir tudo que você criou

---

## Roteiro C — Erros e segurança

- [ ] Estando logado, aperte **F5** → a tela não pode piscar no login;
      deve mostrar "Verificando sua sessão…" e voltar para onde estava
- [ ] Clique em **Sair** → deve cair no login
- [ ] Com a sessão encerrada, tente abrir http://localhost:5173/usuarios
      na barra de endereço → deve **mandar de volta para o login**
- [ ] Entre de novo → deve voltar para `/usuarios` automaticamente

**Erro de chave estrangeira:**
- [ ] Vá em **Catálogo → Categorias** e tente excluir `Banco de Dados`
      (que tem curso dentro) → deve dar erro explicando a referência,
      não uma tela branca

**API fora do ar:**
- [ ] No terminal da API, dê `Ctrl+C`
- [ ] No EduCursos, clique em **↻ Atualizar** em qualquer lista
- [ ] Deve aparecer **"Não foi possível falar com o servidor. Ele está no ar?"**
- [ ] Suba a API de novo (`npm run start:dev`) e atualize

---

## Roteiro D — Visual

- [ ] Os títulos estão numa fonte **serifada** (Fraunces)? Se estiverem iguais
      ao texto comum, a fonte do Google não carregou
- [ ] Diminua a janela até uns **600px** de largura:
  - [ ] o botão **☰** aparece
  - [ ] clicando nele, o menu abre em coluna
  - [ ] nenhuma tabela faz a página rolar de lado (a tabela rola sozinha)
- [ ] Passe o mouse sobre os cards de curso → devem subir um pouquinho
- [ ] Abra um modal de exclusão e aperte **Esc** → deve fechar

---

## Roteiro E — Pelo Swagger

O mesmo teste do Roteiro B, mas entrando pela **API** em vez do Prisma Studio.
É o caminho mais provável de o professor usar.

Abra **http://localhost:3000/api**

### E1. A pegadinha do 401

Antes de autorizar, veja o que acontece numa rota protegida:

- [ ] Abra `GET /usuarios` → **Try it out** → **Execute**
- [ ] Deve responder **401 Unauthorized**

Isso está **certo**, não é defeito: `/usuarios` exige token. As outras 11 rotas
(cursos, categorias, módulos, aulas, matrículas, avaliações, progresso, trilhas,
certificados, planos, assinaturas, pagamentos) respondem sem token nenhum.

### E2. Pegar o token

- [ ] Abra `POST /auth/login` → **Try it out**
- [ ] No corpo, troque pelos seus dados:

  ```json
  { "email": "rita@educursos.com", "senha": "senha123" }
  ```

- [ ] **Execute** → copie o valor de `access_token` da resposta
      (só o texto entre aspas, sem as aspas)

### E3. Autorizar

- [ ] Clique no botão **Authorize** 🔓 no topo da página
- [ ] Cole o token no campo → **Authorize** → **Close**
- [ ] Repita o `GET /usuarios` → agora deve responder **200** com a lista

> O Swagger já manda o `Bearer` na frente do token — cole só o token puro.

### E4. Criar pela API e ver na tela

- [ ] Em `POST /categorias` → **Try it out** → corpo:

  ```json
  { "nome": "Redes", "descricao": "Infraestrutura e protocolos." }
  ```

- [ ] **Execute** → deve responder **201** com o `idCategoria` novo
- [ ] Vá para o EduCursos em **Catálogo → Categorias** e aperte **F5**
- [ ] A categoria `Redes` tem que aparecer na tabela

### E5. Os erros aparecem certinho

- [ ] `POST /categorias` de novo com o **mesmo nome** `Redes`
      → deve dar **409 Conflict**: "Já existe um registro com este valor em: nome"
- [ ] `POST /avaliacoes` com `"nota": 9`
      → deve dar **400**: "nota must not be greater than 5"
- [ ] `POST /modulos` com `"idCurso": 999999`
      → deve dar **400**: "Referência inválida em: Modulos_ID_Curso_fkey"
- [ ] `DELETE /planos/999999`
      → deve dar **404**: "Registro não encontrado"

Esses quatro mostram o tratamento de erro do Prisma funcionando — é o
`PrismaExceptionFilter` traduzindo os códigos do banco para HTTP.

---

## O que me mandar depois

Copie e preencha:

```
ROTEIRO A: passou / parou no passo ___
ROTEIRO B: passou / parou no passo ___
ROTEIRO C: passou / parou no passo ___
ROTEIRO D: passou / parou no passo ___
ROTEIRO E: passou / parou no passo ___

Erros no console (F12 → Console), se houver:


O que achei estranho no visual:

```

Se algum passo falhar, me diga **qual** e **o que apareceu na tela**. Com isso
eu consigo olhar o banco e o código e corrigir.
