# Como funciona o módulo de Usuários e a autenticação

Guia de estudo do `backend/src/usuarios/` e do `backend/src/auth/`.

Escolhi esses dois porque é neles que mora tudo o que os outros 13 recursos
(cursos, categorias, planos…) apenas **usam**: a senha com hash, o login, o
token e as regras de quem pode o quê.

A plataforma tem **três** tipos de conta:

| Perfil | Quem é | O que faz |
|---|---|---|
| **USER** | aluno | vê o catálogo, se matricula, assiste ao que comprou, avalia e paga o que é seu |
| **INSTRUTOR** | professor | mantém **os próprios** cursos, módulos e aulas, e acompanha os alunos. Não mexe no financeiro |
| **ADMIN** | dono | tudo, inclusive planos e pagamentos, e é quem cria as contas da equipe |

E quatro regras que se somam, cada uma respondendo uma pergunta diferente:

| Regra | Pergunta | Onde mora |
|---|---|---|
| **Autenticação** | Quem é você? | `jwt-auth.guard.ts` |
| **Perfil** | Seu tipo de conta permite isso? | `perfis.guard.ts` |
| **Dono do registro** | Esta matrícula é sua? | `propriedade.ts` |
| **Dono do curso** | Este curso é seu? | `dono-do-curso.ts` |

As duas primeiras são decididas antes do controller, só com o token. As duas
últimas precisam ir ao banco — por isso vivem no service.

---

## 1. A ideia por trás da divisão em arquivos

O NestJS separa cada recurso em três papéis. A regra é simples: **cada arquivo
tem um trabalho só**.

| Arquivo | Trabalho | Analogia |
|---|---|---|
| **Controller** | Recebe a requisição HTTP e devolve a resposta | o garçom |
| **Service** | Executa a regra de negócio e fala com o banco | a cozinha |
| **Module** | Declara quem existe e quem pode usar quem | o gerente |
| **DTO** | Define o formato dos dados que entram | o cardápio |

Por que separar? Porque o controller não precisa saber **como** se salva no
banco, e o service não precisa saber que existe HTTP. Se amanhã a aplicação
virasse um aplicativo de celular sem HTTP, o service continuaria igual.

---

## 2. O caminho de uma requisição

Quando alguém faz `DELETE /cursos/4` com um token, acontece isto, **nesta ordem**:

```
1. Chega a requisição          DELETE /cursos/4
                               Authorization: Bearer eyJhbGci...
                                      │
2. GUARD 1 — quem é você?      JwtAuthGuard confere a assinatura e o prazo
   (auth/jwt-auth.guard.ts)    → token ruim ou ausente? para aqui com 401
                                      │  ok, req.user preenchido
3. GUARD 2 — você pode?        PerfisGuard compara o perfil do token
   (auth/perfis.guard.ts)        com o que a rota exige via @Perfis(ADMIN)
                               → é aluno? para aqui com 403
                                      │  é professor, segue
4. PIPE                        ValidationPipe valida o corpo
   (main.ts)                   → inválido? para aqui com 400
                                      │
5. CONTROLLER                  CursosController.remove('4')
   (cursos.controller.ts)      converte "4" (texto) para 4 (número)
                                      │
6. SERVICE                     CursosService.remove(4)
   (cursos.service.ts)         — nos recursos do aluno, é aqui que mora
                                 a regra de dono (ver seção 11)
                                      │
7. PRISMA                      DELETE FROM "Cursos" WHERE "ID_Curso" = 4
   (prisma.service.ts)
                                      │
8. Volta o JSON                { "idCurso": 4, "titulo": "...", ... }
```

Três paradas possíveis, e cada código diz uma coisa diferente:

| Código | Quem barrou | Significa |
|---|---|---|
| **401** | JwtAuthGuard | "não sei quem você é" — token ausente, inválido ou vencido |
| **403** | PerfisGuard ou a regra de dono | "sei quem você é, e você não pode fazer isso" |
| **400** | ValidationPipe | "sei quem você é e você pode, mas os dados estão errados" |

> **Detalhe que o professor pode cobrar:** os **guards rodam antes do pipe**. Se
> o token estiver vencido, você recebe **401** e a validação do corpo nem chega
> a acontecer. E se você for aluno numa rota de professor, recebe **403** antes
> de o controller existir — nenhuma linha do service roda.

---

## 3. `usuarios.module.ts` — o gerente

```ts
@Module({
  imports: [PrismaModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
```

São quatro listas, e cada uma responde uma pergunta:

- **`imports`** — *de que outros módulos eu preciso?*
  Precisamos do `PrismaModule` porque o service conversa com o banco.

- **`controllers`** — *quais rotas este módulo registra?*
  É isto que faz `/usuarios` existir.

- **`providers`** — *quais classes este módulo sabe construir?*
  O `UsuariosService` entra aqui para poder ser injetado no controller.

- **`exports`** — *o que eu empresto para outros módulos?*
  **Esta linha é a mais importante do arquivo.** Sem ela, o `AuthModule` não
  conseguiria usar o `UsuariosService` no login. Um provider é privado ao seu
  módulo por padrão; exportar é o que torna público.

### Injeção de dependência

No controller você vê isto:

```ts
constructor(private readonly usuariosService: UsuariosService) {}
```

Repare que **ninguém escreve `new UsuariosService()`**. Você só declara o tipo
no construtor e o NestJS entrega a instância pronta. Isso se chama **injeção de
dependência**, e funciona porque o service está listado em `providers`.

Se você remover o service de `providers`, a aplicação **nem sobe** — o Nest
reclama que não sabe resolver a dependência. É um erro comum e o recado dele é
claro: *"Nest can't resolve dependencies of the UsuariosController"*.

---

## 4. `usuarios.controller.ts` — o garçom

Ele faz três coisas e nada além disso: **define a rota, extrai os dados da
requisição e chama o service**.

```ts
@ApiTags('usuarios')
@Controller('usuarios')      // tudo aqui dentro começa com /usuarios
export class UsuariosController {
```

### As rotas

| Decorator | Vira | Método do service |
|---|---|---|
| `@Post()` | `POST /usuarios` | `create` |
| `@Get()` | `GET /usuarios` | `findAll` |
| `@Get(':id')` | `GET /usuarios/4` | `findOne` |
| `@Patch(':id')` | `PATCH /usuarios/4` | `update` |
| `@Delete(':id')` | `DELETE /usuarios/4` | `remove` |

### De onde vêm os dados

- **`@Body()`** pega o JSON do corpo da requisição
- **`@Param('id')`** pega o pedaço da URL marcado como `:id`

```ts
findOne(@Param('id') id: string) {
  return this.usuariosService.findOne(+id);
}
```

O `+id` converte texto para número. **Por que precisa?** Porque na URL tudo é
texto: `/usuarios/4` entrega a string `"4"`, e o Prisma espera o número `4`.
Sem o `+`, o Prisma recusaria a consulta.

### Toda rota exige login — menos duas

Os dois guards estão registrados como **globais** no `app.module.ts`:

```ts
providers: [
  AppService,
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_GUARD, useClass: PerfisGuard },
],
```

`APP_GUARD` é uma chave especial do NestJS: o que for registrado assim vale
para **todas as rotas da aplicação**, sem precisar repetir `@UseGuards` em cada
controller. Isso inverte o padrão — em vez de lembrar de proteger cada rota, é
preciso lembrar de **liberar** as poucas que devem ficar abertas.

As duas exceções estão no `AuthController`, marcadas com `@Publico()`:

```ts
@Publico() @Post('login')      // POST /auth/login
@Publico() @Post('cadastrar')  // POST /auth/cadastrar
```

Sem elas, ninguém conseguiria entrar na plataforma: para ter token é preciso
logar, e para logar é preciso ter conta. Um nó impossível.

> **Repare onde o cadastro mora.** Ele é `POST /auth/cadastrar`, não
> `POST /usuarios`. São coisas diferentes:
>
> | Rota | Quem usa | O que cria |
> |---|---|---|
> | `POST /auth/cadastrar` | qualquer visitante | sempre **aluno** |
> | `POST /usuarios` | só o **ADMIN** | conta com o perfil que ele escolher |
>
> Separar as duas é o que impede alguém de se promover a professor sozinho: o
> DTO do cadastro público (`CadastroDto`) **não tem** o campo `perfil`.

### As quatro marcações que aparecem nas rotas

```ts
@Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)   // equipe: professor ou dono
@Delete(':id')
remove(...) { ... }
```

| Marcação | O que faz |
|---|---|
| `@Publico()` | libera a rota de qualquer token |
| `@Perfis(...)` | exige um dos perfis listados; quem não tem leva 403 |
| `@Logado()` | injeta quem está logado como parâmetro do método |
| `@ApiBearerAuth('token')` | só documentação: faz o cadeado 🔒 aparecer no Swagger |

> O `'token'` do `@ApiBearerAuth` não é mágico: é um nome que precisa ser
> **idêntico** ao usado no `main.ts`, no `.addBearerAuth(..., 'token')`. É assim
> que o Swagger liga o botão *Authorize* a esta rota.

### Quando a regra não cabe num decorator

Em `/usuarios` há um caso que nenhum guard resolve sozinho: o aluno pode ver e
editar **o próprio cadastro**, mas não o dos outros. Isso depende do `id` que
veio na URL, então vira um método do controller:

```ts
findOne(@Param('id') id: string, @Logado() logado: UsuarioLogado) {
  this.somenteDonoOuAdmin(+id, logado);
  return this.usuariosService.findOne(+id);
}

private somenteDonoOuAdmin(id: number, logado: UsuarioLogado): void {
  if (ehAdmin(logado) || logado.idUsuario === id) return;
  throw new ForbiddenException('Você só pode acessar o seu próprio cadastro');
}
```

E há uma trava a mais no `update`: mesmo podendo editar o próprio cadastro, o
aluno **não pode mudar o próprio perfil** — senão se promoveria a professor.

```ts
if (updateUsuarioDto.perfil !== undefined && !ehAdmin(logado)) {
  throw new ForbiddenException(
    'Somente um administrador pode alterar o perfil de um usuário',
  );
}
```

---

## 5. `usuarios.service.ts` — a cozinha

É aqui que mora a regra de negócio. No caso do usuário, a regra é a senha.

### Nunca salvar a senha como veio

```ts
async create(createUsuarioDto: CreateUsuarioDto) {
  const senha = await this.gerarHash(createUsuarioDto.senha);
  return this.prisma.usuario.create({
    data: { ...createUsuarioDto, senha },
  });
}

private async gerarHash(senha: string) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(senha, salt);
}
```

O `...createUsuarioDto` copia todos os campos, e o `senha` logo depois
**sobrescreve** o original pelo hash. A senha digitada some ali e nunca chega ao
banco.

**O que é um hash?** Uma transformação de mão única. `senha123` vira algo como
`$2b$10$N9qo8uLOickgx2ZMRZo...`. Não existe conta que desfaça isso.

**E o salt?** Um valor aleatório misturado antes de gerar o hash. Serve para que
duas pessoas com a mesma senha tenham hashes **diferentes** — sem ele, alguém
que visse dois hashes iguais saberia que as senhas são iguais.

### A senha também vira hash no update

```ts
async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
  const { senha, ...dados } = updateUsuarioDto;
  return this.prisma.usuario.update({
    where: { idUsuario: id },
    data: {
      ...dados,
      ...(senha && { senha: await this.gerarHash(senha) }),
    },
  });
}
```

O `...(senha && { ... })` significa: *"se veio senha, inclua o campo com o hash;
se não veio, não inclua nada"*. Sem isso, um `PATCH` com senha salvaria o texto
puro e o furo de segurança voltaria.

### A senha nunca volta nas respostas

Isso está configurado no `prisma/prisma.service.ts`:

```ts
super({
  adapter,
  omit: { usuario: { senha: true } },   // esconde a senha em TODA consulta
});
```

Com isso, `findAll`, `findOne` e `create` devolvem o usuário **sem o campo
senha**, automaticamente. Não é preciso lembrar de remover em cada método — o
que seria fácil de esquecer.

### A exceção: `findByEmail`

```ts
findByEmail(email: string) {
  return this.prisma.usuario.findUnique({
    where: { email },
    omit: { senha: false },   // aqui eu PRECISO do hash
  });
}
```

Este é o único método que pede a senha de volta, e por um motivo claro: é ele
que o **login** usa. Sem o hash guardado, não há com o que comparar a senha
digitada.

É um desenho em que o seguro é o padrão e a exceção é explícita.

---

## 6. A pasta `dto/` — o cardápio

**DTO** quer dizer *Data Transfer Object*: uma classe que descreve **o formato
dos dados que entram** na API.

### `create-usuario.dto.ts`

```ts
export class CreateUsuarioDto {
  @ApiProperty({ example: 'João Vitor Silva', description: 'Nome completo' })
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @ApiProperty({ example: 'joao@email.com', description: 'Email (único)' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({ enum: Perfil, default: Perfil.USER })
  @IsOptional()
  @IsEnum(Perfil)
  perfil?: Perfil;
}
```

O **`perfil`** é o campo que define se a conta é de aluno (`USER`) ou de
professor (`ADMIN`). É opcional: quem não informar nasce `USER`, porque o banco
tem `@default(USER)` na coluna.

> **Vale saber, se o professor perguntar:** deixar essa escolha livre no
> cadastro foi decisão de projeto, para facilitar a demonstração. Num sistema
> aberto ao público, isso precisaria de alguma trava — convite, código de
> instrutor ou aprovação — senão qualquer pessoa se promoveria. A autorização
> em si continua real: um `USER` de fato não consegue criar nem apagar nada do
> catálogo, e a API responde 403.

Cada campo carrega **dois tipos de decorator**, com funções bem diferentes:

- **`@IsEmail()`, `@MinLength(6)`** — do **class-validator**. São as regras.
  Se alguém mandar um e-mail torto, a requisição morre com **400** antes de
  chegar ao controller.

- **`@ApiProperty({...})`** — do **Swagger**. Não valida nada; só documenta.
  É o que faz o exemplo aparecer preenchido na página `/api`.

> Para as regras valerem, o `ValidationPipe` precisa estar ligado no `main.ts`.
> Sem ele os decorators ficam ali, bonitos e inertes.

### `update-usuario.dto.ts`

```ts
export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
```

Três palavras que economizam um arquivo inteiro. O **`PartialType`** pega o DTO
de criação e torna **todos os campos opcionais**.

Faz sentido porque `PATCH` é uma atualização parcial: se você só quer trocar o
e-mail, não deveria ser obrigado a reenviar nome e senha. As regras continuam
valendo para os campos que vierem — mandou e-mail, tem que ser e-mail válido.

---

## 7. A pasta `entities/` — honestamente, está vazia

```ts
// entities/usuario.entity.ts
export class Usuario {}
```

Essa pasta foi criada pelo gerador (`nest g resource`) e **não é usada neste
projeto**. Se o professor perguntar, a resposta honesta é:

> *"A entity representaria a tabela no código. Mas quem usa Prisma não precisa
> escrevê-la à mão: o Prisma lê o `schema.prisma` e **gera** os tipos
> automaticamente em `src/generated/prisma`. Então a classe ficou vazia."*

Em projetos com **TypeORM** em vez de Prisma, é nessa classe que ficariam os
`@Entity()` e `@Column()` descrevendo a tabela. Com Prisma, esse papel é do
`schema.prisma`.

---

## 8. A pasta `auth/` — autenticação e autorização

São doze arquivos, e eles resolvem **duas perguntas diferentes**. Separar as
duas é a ideia central desta pasta:

| Pergunta | Nome técnico | Quem responde |
|---|---|---|
| *Quem é você?* | **autenticação** | `jwt.strategy.ts` + `jwt-auth.guard.ts` |
| *Você pode fazer isso?* | **autorização** | `perfis.guard.ts`, `propriedade.ts`, `dono-do-curso.ts` |

```
auth/
├── dto/
│   ├── login.dto.ts        e-mail + senha
│   └── cadastro.dto.ts     cadastro público — SEM o campo perfil
├── auth.controller.ts      POST /auth/login e /auth/cadastrar
├── auth.service.ts         confere a senha, assina o token, cria aluno
├── auth.module.ts          amarra tudo
├── jwt.strategy.ts         ensina a ler o token
├── jwt-auth.guard.ts       exige o token            ← autenticação
├── publico.decorator.ts    @Publico() — libera a rota
├── perfis.decorator.ts     @Perfis(ADMIN, INSTRUTOR)
├── perfis.guard.ts         confere o perfil          ← autorização
├── usuario-logado.ts       @Logado(), ehAdmin(), ehEquipe()
├── propriedade.ts          "esta matrícula é minha?" ← autorização
└── dono-do-curso.ts        "este curso é meu?"       ← autorização
```

### `ehAdmin` e `ehEquipe` — dois atalhos, dois sentidos

```ts
export function ehAdmin(u: UsuarioLogado) {
  return u.perfil === Perfil.ADMIN;             // só o dono
}

export function ehEquipe(u: UsuarioLogado) {
  return u.perfil === Perfil.ADMIN || u.perfil === Perfil.INSTRUTOR;
}
```

A escolha entre os dois decide muita coisa:

- **`ehEquipe`** nas listagens de alunos — o professor precisa ver as
  matrículas e o progresso de todos para acompanhar as turmas.
- **`ehAdmin`** no financeiro e na troca de perfil — ali o professor não entra.

### `dto/login.dto.ts` — o formato do login

```ts
export class LoginDto {
  @IsEmail()     email: string;
  @IsNotEmpty()  senha: string;
}
```

Só dois campos. Note que ele **não** reaproveita o `CreateUsuarioDto`: entrar e
cadastrar pedem coisas diferentes.

### `auth.controller.ts` — a porta de entrada

```ts
@Post('login')
@HttpCode(HttpStatus.OK)
login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

Uma rota só: `POST /auth/login`.

**Por que o `@HttpCode(HttpStatus.OK)`?** Porque no NestJS todo `POST` devolve
**201 Created** por padrão. Mas o login não *cria* nada — ele verifica. O código
certo é **200 OK**. É um detalhe pequeno que mostra cuidado com o significado dos
códigos HTTP.

### `auth.service.ts` — onde o login acontece

```ts
async login(loginDto: LoginDto) {
  const usuario = await this.usuariosService.findByEmail(loginDto.email);

  const senhaConfere =
    usuario && (await bcrypt.compare(loginDto.senha, usuario.senha));
  if (!senhaConfere) {
    throw new UnauthorizedException('E-mail ou senha incorretos');
  }

  const payload: JwtPayload = {
    sub: usuario.idUsuario,
    email: usuario.email,
    perfil: usuario.perfil,
  };
  return { access_token: this.jwtService.sign(payload) };
}
```

Três momentos:

**1. Busca o usuário** — usando o `UsuariosService`, que só está disponível aqui
porque o `UsuariosModule` o **exportou** (lembra da seção 3?).

**2. Confere a senha com `bcrypt.compare`.** Repare que ele **não descriptografa
o hash** — isso é impossível. O que ele faz é aplicar a mesma transformação na
senha digitada e ver se os dois resultados batem.

> **Por que a mensagem é igual para os dois erros?** Se dissesse "e-mail não
> encontrado" num caso e "senha incorreta" no outro, qualquer pessoa poderia
> descobrir quais e-mails têm conta na plataforma, só testando. Chama-se
> *enumeração de usuários*, e a defesa é exatamente essa: uma mensagem só.

**3. Monta o payload e assina o token.** O `sub` é uma convenção do padrão JWT —
vem de *subject*, "de quem é este token". **Nada de senha aqui dentro**, porque
o JWT é **assinado, não criptografado**: qualquer um consegue ler o conteúdo.

> **Por que o `perfil` vai dentro do token?** Para o guard não precisar
> consultar o banco a cada requisição — a informação chega junto com o pedido.
> E não, isso não é inseguro: o token é **assinado**. Se alguém editar o
> conteúdo trocando `"USER"` por `"ADMIN"`, a assinatura deixa de bater e o
> token é recusado no passo anterior.
>
> O preço disso é que **o perfil só muda depois de sair e entrar de novo**. Se
> um professor promover um aluno enquanto ele está logado, o token antigo
> continua dizendo `USER` até expirar (1 hora) ou até ele fazer login outra vez.

### `jwt.strategy.ts` — a regra de leitura do token

```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: secret,
});

validate({ sub, email, perfil }: JwtPayload): UsuarioLogado {
  return { idUsuario: sub, email, perfil };
}
```

Este arquivo ensina a aplicação a reconhecer um token. Três configurações:

- **`fromAuthHeaderAsBearerToken()`** — o token vem no cabeçalho
  `Authorization: Bearer <token>`
- **`ignoreExpiration: false`** — token vencido é recusado (nosso prazo é 1 hora)
- **`secretOrKey`** — a chave que confere a assinatura

O método **`validate`** só roda se a assinatura e o prazo estiverem bons. O que
ele devolve vira o **`req.user`** da requisição — é assim que um controller
saberia quem está logado, se precisasse.

> O construtor começa checando a `JWT_SECRET` e **estoura um erro** se ela não
> existir. É proposital: é melhor a aplicação não subir do que subir assinando
> tokens com uma chave vazia.

### `jwt-auth.guard.ts` — o porteiro

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(erro: unknown, usuario: TUser): TUser {
    if (erro || !usuario) {
      throw new UnauthorizedException(
        'Sessão expirada ou ausente. Entre novamente para continuar.',
      );
    }
    return usuario;
  }
}
```

É o `AuthGuard('jwt')` do Passport com um ajuste: o original responde
`{"message":"Unauthorized"}`, em inglês. Aqui trocamos por uma frase em
português que diz **o que fazer**.

O `'jwt'` dentro do parêntese é o nome da estratégia — é o que liga o guard ao
`JwtStrategy` do arquivo anterior.

E tem um segundo trabalho: deixar passar as rotas marcadas com `@Publico()`.

```ts
canActivate(contexto: ExecutionContext) {
  const ehPublico = this.reflector.getAllAndOverride<boolean>(E_PUBLICO, [
    contexto.getHandler(),   // o método
    contexto.getClass(),     // o controller
  ]);
  if (ehPublico) return true;

  return super.canActivate(contexto);
}
```

O **`Reflector`** é como o NestJS lê as marcações que os decorators deixaram.
O `@Publico()` não faz nada sozinho — ele só grava `ehPublico = true` no método,
e é aqui que alguém lê esse recado.

### `perfis.guard.ts` — o porteiro da autorização

```ts
canActivate(contexto: ExecutionContext): boolean {
  const exigidos = this.reflector.getAllAndOverride<Perfil[] | undefined>(
    PERFIS_EXIGIDOS,
    [contexto.getHandler(), contexto.getClass()],
  );

  // Rota sem @Perfis(): basta estar autenticado.
  if (!exigidos?.length) return true;

  const usuario = contexto.switchToHttp().getRequest().user;

  if (!usuario || !exigidos.includes(usuario.perfil)) {
    throw new ForbiddenException(
      'Esta ação é restrita a administradores da plataforma',
    );
  }
  return true;
}
```

Mesma mecânica do anterior, outra pergunta. Ele roda **depois** do JwtAuthGuard,
então o `request.user` já existe — foi o `JwtStrategy.validate()` que o colocou
lá.

Repare na linha do meio: **rota sem `@Perfis()` passa**. É o que permite o aluno
ler o catálogo: aquelas rotas exigem login, mas não exigem perfil nenhum.

### `usuario-logado.ts` — quem está logado, como parâmetro

```ts
export const Logado = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): UsuarioLogado => {
    return contexto.switchToHttp().getRequest().user;
  },
);
```

Um **decorator de parâmetro** — escrito por nós, não vem do NestJS. Ele existe
só por legibilidade:

```ts
create(@Body() dto: CreateMatriculaDto, @Logado() logado: UsuarioLogado)
```

é mais claro que receber `@Req() req` e depois escrever `req.user` com o tipo
solto.

### `auth.module.ts` — amarrando tudo

```ts
@Module({
  imports: [
    UsuariosModule,          // para usar o UsuariosService no login
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

Dois pontos que valem decorar:

- **`expiresIn: '1h'`** — é aqui que se define a validade do token. Depois de
  uma hora, qualquer rota protegida responde 401 e é preciso logar de novo.
- **`JwtStrategy` está em `providers`** — sem essa linha a estratégia nunca é
  registrada, e o guard falharia sempre, mesmo com token válido.

---

## 9. Como as duas pastas se conectam

```
      usuarios/                            auth/
    ┌──────────────────┐             ┌──────────────────┐
    │ UsuariosModule   │             │ AuthModule       │
    │                  │  importa    │                  │
    │ exports:         │◄────────────│ imports:         │
    │  UsuariosService │             │  UsuariosModule  │
    └────────┬─────────┘             └────────┬─────────┘
             │                                │
             │ fornece                        │ usa
             ▼                                ▼
    ┌──────────────────┐             ┌──────────────────┐
    │ UsuariosService  │◄────────────│ AuthService      │
    │                  │ findByEmail │                  │
    │ create (hash)    │             │ login (compare)  │
    └──────────────────┘             └──────────────────┘
```

E a dependência volta na outra direção: o `UsuariosController` importa o
`JwtAuthGuard`, que está dentro de `auth/`. Ou seja, **os dois módulos dependem
um do outro** — `auth` precisa do service de usuários, e `usuarios` precisa do
guard de auth.

### O ciclo completo, do zero

```
1. CADASTRO     POST /usuarios          (público)
                senha → bcrypt → hash no banco

2. LOGIN        POST /auth/login        (público)
                bcrypt.compare → token assinado, válido por 1h

3. USO          GET /cursos             (exige login, qualquer perfil)
                Authorization: Bearer <token>
                JwtAuthGuard confere → PerfisGuard não exige nada → libera

4. ESCRITA      DELETE /cursos/4        (exige login + ADMIN)
                professor → 204
                aluno     → 403 "Esta ação é restrita a administradores"

5. UMA HORA DEPOIS
                qualquer requisição → 401 → repetir o passo 2
```

---

## 10. Os quatro grupos de recursos

Os 14 recursos não são todos iguais. Eles se dividem conforme **quem pode
mexer neles**.

### Grupo 1 — o catálogo compartilhado

`categorias` · `trilhas` · `trilhas-cursos`

Todo mundo logado **lê**; qualquer um da equipe escreve:

```ts
@Perfis(Perfil.ADMIN, Perfil.INSTRUTOR)
@Delete(':id')
remove(@Param('id') id: string) { ... }
```

Não têm dono porque são **taxonomia da plataforma**. "Programação" e "Banco de
Dados" não pertencem a um professor — se cada um só pudesse editar as suas,
apareceriam cinco categorias "Programação" diferentes.

### Grupo 2 — o conteúdo, que tem dono

`cursos` · `modulos` · `aulas`

A equipe escreve, **mas só no que é seu**. O dono de um curso é o instrutor
dele (`Cursos.ID_Instrutor`), e a posse desce em cadeia:

```
Curso   -> ID_Instrutor diz o dono
Módulo  -> pertence a um curso  -> mesmo dono
Aula    -> pertence a um módulo -> pertence a um curso -> mesmo dono
```

Isso não cabe num decorator — o guard roda antes do controller e não conhece o
banco. Então vive em `auth/dono-do-curso.ts`:

```ts
export async function exigirDonoDoCurso(prisma, idCurso, logado) {
  if (ehAdmin(logado)) return;                  // o dono da plataforma passa

  const curso = await prisma.curso.findUnique({
    where: { idCurso },
    select: { idInstrutor: true },
  });
  if (curso.idInstrutor !== logado.idUsuario) {
    throw new ForbiddenException(
      'Este conteúdo pertence a outro professor...',
    );
  }
}
```

E tem uma proteção a mais na criação: o professor **não escolhe** de quem é o
curso. O `idInstrutor` que vier no corpo é ignorado e trocado pelo dele.

```ts
idInstrutor: ehAdmin(logado) ? dados.idInstrutor : logado.idUsuario,
```

> Dá para provar isso num teste: mande `"idInstrutor": 999` ao criar um curso
> como professor. Grava o id de quem está logado, não o 999.

### Grupo 3 — os recursos do aluno: regra de dono

`matriculas` · `avaliacoes` · `progresso-aulas` · `assinaturas` · `pagamentos`

Aqui o aluno **pode** escrever, mas só sobre o que é dele. Isso não cabe num
decorator, porque depende do conteúdo do banco: para saber de quem é a matrícula
7, é preciso buscá-la. Então a regra vive no service, em `auth/propriedade.ts`:

```ts
export function exigirDono(idDonoDoRegistro: number, logado: UsuarioLogado) {
  if (ehEquipe(logado)) return;                      // equipe passa sempre
  if (logado.idUsuario === idDonoDoRegistro) return; // aluno passa se for dele
  throw new ForbiddenException('...');
}

export function filtroDoDono(logado: UsuarioLogado) {
  return ehEquipe(logado) ? undefined : { idUsuario: logado.idUsuario };
}
```

E o service fica assim:

```ts
create(dto: CreateMatriculaDto, logado: UsuarioLogado) {
  exigirDono(dto.idUsuario, logado);   // aluno só matricula a si mesmo
  return this.prisma.matricula.create({ ... });
}

findAll(logado: UsuarioLogado) {
  // `undefined` no where do Prisma significa "sem filtro"
  return this.prisma.matricula.findMany({ where: filtroDoDono(logado) });
}
```

Repare no efeito do `findAll`: **a mesma rota devolve coisas diferentes**. O
professor vê as 7 matrículas da plataforma; o aluno vê as 3 dele. Não é a tela
que filtra — é a API.

> Dois casos fogem um pouco do molde:
>
> - **`progresso-aulas`** tem o id do usuário na própria chave primária, que vai
>   na URL (`/progresso-aulas/13/2`). Não precisa consultar o banco: basta olhar
>   o primeiro id da rota.
> - **`pagamentos`** não guarda o id do usuário. Quem diz de quem ele é é a
>   assinatura, então o service busca o dono lá antes de decidir.

### Grupo 4 — o financeiro e os usuários

`planos` · `assinaturas` · `pagamentos` · `usuarios`

Aqui o **professor não entra**. Dinheiro e contas são do dono da plataforma:

```ts
@Perfis(Perfil.USER, Perfil.ADMIN)   // repare quem NÃO está na lista
@Controller('pagamentos')
```

O aluno continua vendo as próprias assinaturas e pagamentos — ele é quem paga.
Quem fica de fora é o INSTRUTOR.

`usuarios` é meio-termo: a equipe **lista** (o professor precisa escolher o
aluno ao lançar matrícula), mas criar, excluir e trocar perfil é só do admin.
E a listagem aceita `?perfil=USER`, que é o que faz o campo "Aluno" de um
formulário mostrar só alunos.

#### Por que `usuarios` é o recurso mais diferente de todos

| Só em `usuarios` | Por quê |
|---|---|
| `bcrypt` no create e no update | é o único com senha |
| `findByEmail` | o login precisa buscar por e-mail |
| `omit` da senha no Prisma | é o único com campo que não pode vazar |
| regra de dono **no controller** | depende só do id da URL, não do banco |
| `exports` no module | é o único que outro módulo usa |

### A quarta camada: conteúdo liberado por matrícula

Há ainda uma regra que não é sobre perfil nem sobre dono: **o aluno vê a lista
de aulas de qualquer curso, mas só assiste às do curso em que se matriculou.**

Isso vive em `aulas.service.ts`:

```ts
private async cursosLiberados(logado: UsuarioLogado) {
  if (ehAdmin(logado)) return 'todos';

  const matriculas = await this.prisma.matricula.findMany({
    where: { idUsuario: logado.idUsuario },
    select: { idCurso: true },
  });
  return new Set(matriculas.map((m) => m.idCurso));
}
```

E a resposta de cada aula sai assim:

```ts
return {
  ...dados,
  idCurso: modulo.idCurso,
  liberada,
  urlConteudo: liberada ? dados.urlConteudo : null,   // ← o conteúdo some
};
```

O título, o tipo e a duração continuam vindo — é o que permite a pessoa decidir
se vale se matricular. O que não vem é o `urlConteudo`, o endereço do vídeo.

> **Importante para a apresentação:** esconder não é o mesmo que bloquear. Aqui
> o campo realmente **não sai do servidor** — nem abrindo o DevTools dá para
> achar o endereço. Se a tela apenas escondesse o botão, o dado estaria lá.

---

## 11. Ordem para criar e para apagar

As 14 tabelas se apoiam umas nas outras por **chave estrangeira**. Isso impõe
duas ordens obrigatórias: o que criar antes, e o que apagar antes. Tentar fora
de ordem dá erro — e desde a última correção o erro diz exatamente o quê.

### Quem depende de quem

```
NÍVEL 0 — não dependem de ninguém, podem ser criados a qualquer momento
   Usuários        Categorias        Planos
       │                │               │
       ├────────┬───────┤               │
       ▼        ▼       ▼               ▼
NÍVEL 1    Cursos     Trilhas      Assinaturas
   (instrutor+categoria) (categoria)  (usuário+plano)
       │        │                       │
       ▼        ▼                       ▼
NÍVEL 2   Módulos   Trilhas_Cursos   Pagamentos
          Matrículas  Avaliações     (assinatura)
          Certificados
       │
       ▼
NÍVEL 3   Aulas  (módulo)
       │
       ▼
NÍVEL 4   Progresso_Aulas  (usuário + aula)
```

### Ordem de criação

Siga de cima para baixo. Dentro do mesmo nível, a ordem não importa.

| # | Criar | Precisa que já exista |
|---|---|---|
| 1 | **Usuários** | — |
| 2 | **Categorias** | — |
| 3 | **Planos** | — |
| 4 | **Cursos** | usuário (instrutor) + categoria |
| 5 | **Trilhas** | categoria |
| 6 | **Assinaturas** | usuário + plano |
| 7 | **Módulos** | curso |
| 8 | **Matrículas** | usuário + curso |
| 9 | **Avaliações** | usuário + curso |
| 10 | **Trilhas_Cursos** | trilha + curso |
| 11 | **Certificados** | usuário + curso (+ trilha, se quiser) |
| 12 | **Pagamentos** | assinatura |
| 13 | **Aulas** | módulo |
| 14 | **Progresso_Aulas** | usuário + aula |

> **O caminho mais curto para uma demonstração completa:**
> usuário → categoria → curso → módulo → aula → matrícula → progresso.
> Sete cadastros e você já exercitou os quatro níveis, incluindo uma tabela de
> chave composta.

### Ordem de exclusão — o inverso

Para apagar, comece pelas pontas. **Quem não tem ninguém dependendo dele sai
primeiro.**

| Apagar primeiro | Depois | Depois | Por último |
|---|---|---|---|
| Progresso_Aulas | Aulas | Módulos | Cursos |
| Pagamentos | Assinaturas | — | Planos |
| Trilhas_Cursos, Certificados | Trilhas | — | Categorias |
| Matrículas, Avaliações | — | — | Usuários |

### Quem me impede de apagar

Esta é a tabela para consultar quando aparecer *"Não é possível excluir"*:

| Para apagar… | antes é preciso apagar |
|---|---|
| **Usuário** | matrículas, avaliações, progresso, certificados, assinaturas **e os cursos que ele ministra** |
| **Categoria** | cursos e trilhas dessa categoria |
| **Curso** | módulos, matrículas, avaliações, certificados e vínculos com trilhas |
| **Módulo** | as aulas dele |
| **Aula** | os registros de progresso dela |
| **Trilha** | os vínculos com cursos e os certificados dela |
| **Plano** | as assinaturas desse plano |
| **Assinatura** | os pagamentos dela |
| Matrícula, Avaliação, Progresso, Trilha_Curso, Certificado, Pagamento | nada — são pontas, saem direto |

> **Atenção ao usuário:** ele é o mais travado de todos, porque aparece em seis
> tabelas. E tem uma armadilha: se a pessoa for **instrutora de algum curso**,
> não dá para apagá-la enquanto o curso existir — mesmo que ela não tenha
> matrícula nenhuma.

### A mensagem de erro já te diz

Não precisa decorar a tabela. Se você tentar apagar fora de ordem, a API
responde dizendo **o que** está travando:

```
Não é possível excluir: existem módulos que dependem deste registro
                                 ↑
                        apague os módulos primeiro
```

E se você criar fora de ordem, ela diz **o que falta**:

```
O curso informado não existe   →  crie o curso antes do módulo
A categoria informada não existe →  crie a categoria antes do curso
```

### Por que o banco é assim

Isso se chama **integridade referencial**, e é o banco protegendo os dados de
ficarem inconsistentes. Sem essa regra seria possível ter um módulo apontando
para o curso 7 que não existe mais — um registro órfão, impossível de exibir na
tela e difícil de rastrear depois.

> Daria para configurar o Prisma com `onDelete: Cascade` — apagar o curso
> levaria junto módulos e aulas, em cascata. **Não fizemos isso de propósito:**
> num trabalho de faculdade, um clique apagando dezenas de registros em efeito
> dominó é mais perigoso do que útil. Melhor o banco recusar e avisar.

---

## 12. Perguntas que o professor pode fazer

**"Por que separar controller e service?"**
Para cada um ter uma responsabilidade só. O controller cuida de HTTP; o service
cuida da regra. Dá para testar a regra sem levantar servidor, e se a entrada
mudasse de HTTP para outra coisa, o service continuaria igual.

**"O que o `@Injectable()` faz?"**
Marca a classe como algo que o NestJS pode construir e injetar em outras.
Sem ele, o Nest não consegue resolver a dependência.

**"Como o service chega ao controller sem `new`?"**
Injeção de dependência: basta declarar o tipo no construtor. O Nest cria uma
instância única e entrega a quem pedir, porque ela está em `providers`.

**"Para que serve o `exports` no module?"**
Um provider é privado ao módulo dele. O `exports` o torna visível para quem
importar o módulo. É o que permite o `AuthService` usar o `UsuariosService`.

**"Qual a diferença entre DTO e entity?"**
O DTO descreve o que **entra** pela API, com as validações. A entity
representaria a tabela. Como usamos Prisma, os tipos da tabela são gerados a
partir do `schema.prisma`, então a entity ficou vazia.

**"Por que a senha vira hash e não criptografia?"**
Criptografia tem volta, hash não. Nunca precisamos recuperar a senha — só
conferir se a digitada é a mesma. O `bcrypt.compare` aplica a mesma
transformação e compara os resultados.

**"O JWT é seguro? Dá para ler o que tem dentro?"**
Dá, e é por isso que não guardamos senha lá. O JWT é **assinado**, não
criptografado. A assinatura garante que ninguém **alterou** o conteúdo — se
trocarem o `sub` para virar outro usuário, a assinatura não bate e o token é
recusado.

**"Onde fica a chave que assina o token?"**
Na variável `JWT_SECRET`, no arquivo `.env`, que **não vai para o Git**. Quem
tiver essa chave consegue forjar token de qualquer usuário.

**"Por que o cadastro não exige token?"**
Porque seria impossível criar o primeiro usuário: para ter token é preciso
logar, e para logar é preciso ter conta. Por isso ele é marcado `@Publico()`,
junto com o login — as duas únicas rotas abertas da API.

**"O que acontece se o token vencer?"**
Qualquer rota protegida responde 401. No frontend isso é tratado: o token é
apagado e a tela volta para o login automaticamente.

---

### Sobre perfis e permissão

**"Qual a diferença entre autenticação e autorização?"**
Autenticação é *quem é você* — resolvida pelo token e pelo `JwtAuthGuard`.
Autorização é *você pode fazer isso* — resolvida pelo `PerfisGuard` e pela
regra de dono. São dois guards separados, e dois códigos HTTP: **401** para a
primeira, **403** para a segunda.

**"Um aluno pode apagar um curso?"**
Não. A rota exige `@Perfis(ADMIN, INSTRUTOR)` e a API responde **403**. A tela
também esconde o botão, mas isso é só conveniência — a proteção de verdade está
na API. Mesmo forçando pelo Swagger ou por curl, o aluno leva 403.

**"E um professor pode apagar o curso de outro professor?"**
Também não — e esse é mais interessante, porque o guard de perfil sozinho
deixaria passar (os dois são INSTRUTOR). Quem barra é a regra de dono no
service: ela busca o curso, compara `ID_Instrutor` com quem está logado e
responde **403** se forem diferentes. Vale também para os módulos e as aulas
daquele curso.

**"Por que são três perfis e não dois?"**
Porque professor e dono têm responsabilidades diferentes. O professor cuida do
ensino — cursos, aulas, acompanhamento dos alunos. O dono cuida do negócio —
planos, assinaturas, pagamentos e as contas da equipe. Juntar os dois num
perfil só daria ao professor acesso ao caixa da plataforma.

**"Como nasce o primeiro administrador, se só admin cria admin?"**
É um problema do ovo e da galinha, e a saída é nascer fora da API: o comando
`npm run admin-inicial` escreve direto no banco. Depois dele o fluxo normal
assume — o admin cria os professores pela tela de Usuários.

**"A tela de login deixa escolher o perfil. Não é um furo?"**
Não, porque a aba **não concede** nada. Ela orienta. Se você entrar pela aba
"Administrador" com uma conta de aluno, o login é desfeito e aparece "esta
conta é de aluno". O perfil continua vindo da coluna `Perfil` da conta, e é o
token assinado que o carrega.

**"Onde fica guardado o perfil?"**
Numa coluna `Perfil` da tabela `Usuarios`, como um **enum** do PostgreSQL com
dois valores: `USER` e `ADMIN`. E vai também dentro do token, para o guard não
precisar consultar o banco a cada requisição.

**"Então dá para virar admin editando o token?"**
Não. O JWT é **assinado** com a `JWT_SECRET`. Trocar `"USER"` por `"ADMIN"` no
conteúdo faz a assinatura deixar de bater, e o token é recusado antes de chegar
ao guard de perfil.

**"Como alguém vira professor?"**
Escolhendo no cadastro — a tela tem "Sou aluno" e "Sou professor". Foi uma
decisão de projeto para facilitar a demonstração. Num sistema real isso
precisaria de trava (convite, código de instrutor, aprovação), senão qualquer
um se promove. O que **não** muda é a autorização em si: ela continua
funcionando de verdade para quem já tem um perfil.

**"Por que o aluno vê 3 matrículas e o professor vê 7, na mesma rota?"**
Porque o service filtra pelo dono: `where: filtroDoDono(logado)`. Para o
professor a função devolve `undefined`, que no Prisma significa "sem filtro".
A rota é a mesma; o que muda é quem está perguntando.

**"Por que a regra de dono não é um guard também?"**
Porque o guard roda **antes** do controller e não conhece o banco. Para saber de
quem é a matrícula 7, é preciso buscá-la — e quem fala com o banco é o service.
Já a regra de perfil cabe num guard porque a resposta está no próprio token.

**"O aluno consegue ver o vídeo de um curso em que não se matriculou?"**
Não. A API devolve `urlConteudo: null` e `liberada: false` para quem não está
matriculado. O título e a duração vêm — para a pessoa decidir se quer o curso —
mas o endereço do conteúdo não sai do servidor.

**"Quem emite o certificado?"**
O próprio aluno, quando termina. A API confere se ele tem progresso
`Concluido` em **todas** as aulas do curso; se faltar uma, responde 403. A tela
mostra uma barra "3 de 5 aulas" enquanto não fecha, e o botão de emitir quando
fecha. Professor e dono também podem emitir manualmente para qualquer aluno.

**"Uma matrícula com data de conclusão em 2027 está concluída?"**
Não — está **prevista**. A situação tem três estados: sem data é "Em
andamento", data futura é "Previsto para…", e só data que já passou vira
"Concluído em…". Antes, qualquer data preenchida dizia "concluído", e um curso
com término marcado para 2027 aparecia como terminado.

**"Por que o perfil só muda depois de sair e entrar?"**
Porque ele viaja dentro do token, que é emitido no login e vale 1 hora. É o
preço de não consultar o banco a cada requisição. A alternativa seria checar o
perfil no banco toda vez — mais atual, porém mais lento.

---

### Outras

**"Por que o login devolve 200 e não 201?"**
Porque não cria recurso nenhum, só verifica credenciais. O `@HttpCode(200)`
corrige o padrão do NestJS, que devolveria 201 em qualquer POST.

**"Por que a mensagem de erro do login é a mesma para e-mail e senha errados?"**
Para não revelar quais e-mails têm conta. Se as mensagens fossem diferentes,
daria para descobrir os cadastros por tentativa — o que se chama enumeração de
usuários.
