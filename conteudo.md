# Como funciona o módulo de Usuários e a autenticação

Guia de estudo do `backend/src/usuarios/` e do `backend/src/auth/`.

Escolhi esses dois porque os outros 13 recursos (cursos, categorias, planos…)
seguem **exatamente o mesmo padrão** — quem entende `usuarios` entende todos.
A diferença é que só o usuário tem senha, hash e JWT.

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

Quando alguém faz `GET /usuarios/4` com um token, acontece isto, **nesta ordem**:

```
1. Chega a requisição          GET /usuarios/4
                               Authorization: Bearer eyJhbGci...
                                      │
2. GUARD                       JwtAuthGuard confere o token
   (auth/jwt-auth.guard.ts)    → inválido? para aqui com 401
                                      │  válido, segue
3. PIPE                        ValidationPipe valida o corpo
   (main.ts)                   → inválido? para aqui com 400
                                      │
4. CONTROLLER                  UsuariosController.findOne('4')
   (usuarios.controller.ts)    converte "4" (texto) para 4 (número)
                                      │
5. SERVICE                     UsuariosService.findOne(4)
   (usuarios.service.ts)       monta a consulta
                                      │
6. PRISMA                      SELECT ... FROM "Usuarios" WHERE "ID_Usuario" = 4
   (prisma.service.ts)
                                      │
7. Volta o JSON                { "idUsuario": 4, "nomeCompleto": "...", ... }
```

> **Detalhe que o professor pode cobrar:** o **guard roda antes do pipe**. Se o
> token estiver vencido, você recebe **401** e a validação do corpo nem chega a
> acontecer. Não dá para "testar a validação" sem estar autenticado numa rota
> protegida.

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

### O cadastro é a única rota pública

```ts
// Rota pública: sem ela ninguém conseguiria criar o primeiro usuário.
@Post()
create(@Body() createUsuarioDto: CreateUsuarioDto) { ... }
```

Esta é uma decisão de projeto, não um descuido. Se o `@UseGuards` estivesse na
**classe inteira**, o cadastro também exigiria token — e aí ninguém nunca
conseguiria se cadastrar, porque precisaria de um token que só se consegue
fazendo login, que só funciona se você já tiver conta. Um nó impossível.

Por isso o guard é aplicado **rota por rota**, e o `@Post()` fica de fora.

### As rotas protegidas

```ts
@ApiBearerAuth('token')
@UseGuards(JwtAuthGuard)
@Get()
findAll() { ... }
```

- **`@UseGuards(JwtAuthGuard)`** — exige o token de verdade
- **`@ApiBearerAuth('token')`** — avisa o **Swagger** que esta rota precisa de
  token, fazendo aparecer o cadeado 🔒 ao lado dela

> O `'token'` dentro do parêntese não é mágico: é um nome que precisa ser
> **idêntico** ao usado no `main.ts`, no `.addBearerAuth(..., 'token')`. É assim
> que o Swagger liga o botão *Authorize* a esta rota.

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
}
```

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

## 8. A pasta `auth/` — a autenticação

São seis arquivos. Dá para entender pensando em dois momentos: **entrar** e
**provar que já entrou**.

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

  const payload: JwtPayload = { sub: usuario.idUsuario, email: usuario.email };
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

### `jwt.strategy.ts` — a regra de leitura do token

```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: secret,
});

validate({ sub, email }: JwtPayload) {
  return { idUsuario: sub, email };
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

3. USO          GET /usuarios           (protegido)
                Authorization: Bearer <token>
                JwtAuthGuard confere → libera

4. UMA HORA DEPOIS
                mesma requisição → 401 → repetir o passo 2
```

---

## 10. Por que os outros 13 recursos são mais simples

Compare `cursos.service.ts` com `usuarios.service.ts`:

```ts
// cursos — não tem regra de negócio, só repassa
create(createCursoDto: CreateCursoDto) {
  return this.prisma.curso.create({ data: createCursoDto });
}

// usuarios — tem regra: a senha precisa virar hash
async create(createUsuarioDto: CreateUsuarioDto) {
  const senha = await this.gerarHash(createUsuarioDto.senha);
  return this.prisma.usuario.create({ data: { ...createUsuarioDto, senha } });
}
```

O recurso de usuários é o único que tem:

| Só em `usuarios` | Por quê |
|---|---|
| `bcrypt` no create e no update | é o único com senha |
| `findByEmail` | o login precisa buscar por e-mail |
| `omit` da senha no Prisma | é o único com campo que não pode vazar |
| `@UseGuards` nas rotas | é o único protegido |
| `exports` no module | é o único que outro módulo usa |

Os outros 13 são o CRUD puro: controller chama service, service chama Prisma.

---

## 11. Perguntas que o professor pode fazer

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
logar, e para logar é preciso ter conta. Por isso o guard é aplicado rota a
rota, e o `POST /usuarios` fica público.

**"O que acontece se o token vencer?"**
Qualquer rota protegida responde 401. No frontend isso é tratado: o token é
apagado e a tela volta para o login automaticamente.

**"Um aluno pode apagar um curso?"**
Pode, e é assim de propósito. A tabela `Usuarios` do modelo não tem campo de
papel — quem é instrutor é definido pelo relacionamento (`Cursos.ID_Instrutor`),
não por uma coluna. Então a API trata todo usuário autenticado igual. Se fosse
preciso diferenciar, daria para derivar do relacionamento sem mexer no banco.

**"Por que o login devolve 200 e não 201?"**
Porque não cria recurso nenhum, só verifica credenciais. O `@HttpCode(200)`
corrige o padrão do NestJS, que devolveria 201 em qualquer POST.

**"Por que a mensagem de erro do login é a mesma para e-mail e senha errados?"**
Para não revelar quais e-mails têm conta. Se as mensagens fossem diferentes,
daria para descobrir os cadastros por tentativa — o que se chama enumeração de
usuários.
