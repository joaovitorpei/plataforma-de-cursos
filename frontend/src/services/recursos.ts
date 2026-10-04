import { CrudService, CrudCompostoService } from './crud';
import type {
  IUsuario,
  UsuarioEntrada,
  ICategoria,
  CategoriaEntrada,
  ICurso,
  CursoEntrada,
  IModulo,
  ModuloEntrada,
  IAula,
  AulaEntrada,
  IMatricula,
  MatriculaEntrada,
  IProgressoAula,
  ProgressoEntrada,
  IAvaliacao,
  AvaliacaoEntrada,
  ITrilha,
  TrilhaEntrada,
  ITrilhaCurso,
  TrilhaCursoEntrada,
  ICertificado,
  CertificadoEntrada,
  IPlano,
  PlanoEntrada,
  IAssinatura,
  AssinaturaEntrada,
  IPagamento,
  PagamentoEntrada,
} from '../models';

/* ---------------- núcleo ---------------- */
export const usuarioService = new CrudService<IUsuario, UsuarioEntrada>(
  'usuarios',
  'idUsuario',
);
export const categoriaService = new CrudService<ICategoria, CategoriaEntrada>(
  'categorias',
  'idCategoria',
);

/* ---------------- conteúdo ---------------- */
export const cursoService = new CrudService<ICurso, CursoEntrada>(
  'cursos',
  'idCurso',
);
export const moduloService = new CrudService<IModulo, ModuloEntrada>(
  'modulos',
  'idModulo',
);
export const aulaService = new CrudService<IAula, AulaEntrada>(
  'aulas',
  'idAula',
);

/* ---------------- interação ---------------- */
export const matriculaService = new CrudService<IMatricula, MatriculaEntrada>(
  'matriculas',
  'idMatricula',
);
export const avaliacaoService = new CrudService<IAvaliacao, AvaliacaoEntrada>(
  'avaliacoes',
  'idAvaliacao',
);
/** Chave composta: /progresso-aulas/:idUsuario/:idAula */
export const progressoService = new CrudCompostoService<
  IProgressoAula,
  ProgressoEntrada
>('progresso-aulas', 'idUsuario', 'idAula');

/* ---------------- curadoria ---------------- */
export const trilhaService = new CrudService<ITrilha, TrilhaEntrada>(
  'trilhas',
  'idTrilha',
);
/** Chave composta: /trilhas-cursos/:idTrilha/:idCurso */
export const trilhaCursoService = new CrudCompostoService<
  ITrilhaCurso,
  TrilhaCursoEntrada
>('trilhas-cursos', 'idTrilha', 'idCurso');
export const certificadoService = new CrudService<
  ICertificado,
  CertificadoEntrada
>('certificados', 'idCertificado');

/* ---------------- negócio ---------------- */
export const planoService = new CrudService<IPlano, PlanoEntrada>(
  'planos',
  'idPlano',
);
export const assinaturaService = new CrudService<
  IAssinatura,
  AssinaturaEntrada
>('assinaturas', 'idAssinatura');
export const pagamentoService = new CrudService<IPagamento, PagamentoEntrada>(
  'pagamentos',
  'idPagamento',
);
