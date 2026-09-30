/**
 * Nomes dos campos e das tabelas em português, para as mensagens de erro.
 *
 * O banco usa `ID_Curso`, o código usa `idCurso` e o usuário lê "curso". Este
 * arquivo é o único lugar que faz essa ponte, e serve tanto para os erros de
 * validação quanto para os erros do Prisma.
 */

/** Campo do DTO -> como ele é chamado na tela. */
export const ROTULO_CAMPO: Record<string, string> = {
  // usuários
  nomeCompleto: 'nome completo',
  email: 'e-mail',
  senha: 'senha',
  dataCadastro: 'data de cadastro',

  // relacionamentos
  idUsuario: 'aluno',
  idInstrutor: 'instrutor',
  idCategoria: 'categoria',
  idCurso: 'curso',
  idModulo: 'módulo',
  idAula: 'aula',
  idTrilha: 'trilha',
  idPlano: 'plano',
  idAssinatura: 'assinatura',

  // conteúdo
  titulo: 'título',
  descricao: 'descrição',
  nome: 'nome',
  nivel: 'nível',
  ordem: 'ordem',
  tipoConteudo: 'tipo de conteúdo',
  urlConteudo: 'endereço do conteúdo',
  duracaoMinutos: 'duração em minutos',
  dataPublicacao: 'data de publicação',
  totalAulas: 'total de aulas',
  totalHoras: 'carga horária',

  // interação
  nota: 'nota',
  comentario: 'comentário',
  status: 'situação',
  dataConclusao: 'data de conclusão',
  dataAvaliacao: 'data da avaliação',
  dataMatricula: 'data da matrícula',

  // certificados e negócio
  codigoVerificacao: 'código de verificação',
  dataEmissao: 'data de emissão',
  preco: 'preço',
  duracaoMeses: 'duração em meses',
  dataInicio: 'data de início',
  dataFim: 'data de fim',
  valorPago: 'valor pago',
  metodoPagamento: 'método de pagamento',
  idTransacaoGateway: 'código da transação',
};

/**
 * Coluna do banco (`ID_Curso`) -> como ela é chamada na tela, com o gênero.
 * O gênero é necessário para a frase concordar: "o curso informado não existe"
 * mas "a categoria informada não existe".
 */
interface Rotulo {
  nome: string;
  genero: 'm' | 'f';
}

export const ROTULO_COLUNA: Record<string, Rotulo> = {
  ID_Usuario: { nome: 'aluno', genero: 'm' },
  ID_Instrutor: { nome: 'instrutor', genero: 'm' },
  ID_Categoria: { nome: 'categoria', genero: 'f' },
  ID_Curso: { nome: 'curso', genero: 'm' },
  ID_Modulo: { nome: 'módulo', genero: 'm' },
  ID_Aula: { nome: 'aula', genero: 'f' },
  ID_Trilha: { nome: 'trilha', genero: 'f' },
  ID_Plano: { nome: 'plano', genero: 'm' },
  ID_Assinatura: { nome: 'assinatura', genero: 'f' },
  Email: { nome: 'e-mail', genero: 'm' },
  Nome: { nome: 'nome', genero: 'm' },
  CodigoVerificacao: { nome: 'código de verificação', genero: 'm' },
};

/** Tabela do banco -> o que ela guarda, no plural, para falar de dependências. */
export const ROTULO_TABELA: Record<string, string> = {
  Usuarios: 'usuários',
  Categorias: 'categorias',
  Cursos: 'cursos',
  Modulos: 'módulos',
  Aulas: 'aulas',
  Matriculas: 'matrículas',
  Progresso_Aulas: 'registros de progresso',
  Avaliacoes: 'avaliações',
  Trilhas: 'trilhas',
  Trilhas_Cursos: 'cursos em trilhas',
  Certificados: 'certificados',
  Planos: 'planos',
  Assinaturas: 'assinaturas',
  Pagamentos: 'pagamentos',
};

export function rotuloDoCampo(campo: string): string {
  return ROTULO_CAMPO[campo] ?? campo;
}

/** Só o nome da coluna, sem artigo. Ex.: "e-mail". */
export function rotuloDaColuna(coluna: string): string {
  return ROTULO_COLUNA[coluna]?.nome ?? coluna;
}

export function rotuloDaTabela(tabela: string): string {
  return ROTULO_TABELA[tabela] ?? tabela;
}

/**
 * Frase completa e concordada para uma chave estrangeira que aponta para um
 * registro inexistente: "O curso informado não existe" / "A categoria
 * informada não existe".
 */
export function referenciaNaoExiste(coluna: string): string {
  const rotulo = ROTULO_COLUNA[coluna];
  if (!rotulo) return 'Um dos registros relacionados não existe';

  return rotulo.genero === 'f'
    ? `A ${rotulo.nome} informada não existe`
    : `O ${rotulo.nome} informado não existe`;
}
