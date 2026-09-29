import { ErroApi } from '../services/http';

/** Transforma qualquer exceção em uma frase que pode ir para a tela. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  if (erro instanceof Error) return erro.message;
  return 'Algo deu errado. Tente novamente.';
}
