/** Guarda o access_token do JWT. Único lugar do app que fala com o localStorage. */

const CHAVE = 'educursos.token';

export function lerToken(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function gravarToken(token: string): void {
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    /* navegação privada ou storage bloqueado: segue sem persistir */
  }
}

export function limparToken(): void {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* idem */
  }
}

export interface ConteudoToken {
  sub: number;
  email: string;
  exp?: number;
}

/**
 * Lê o conteúdo do JWT sem validar a assinatura — quem valida é o backend.
 * Serve só para a tela saber quem está logado sem pedir nada à API.
 */
export function lerConteudo(token: string): ConteudoToken | null {
  try {
    const corpo = token.split('.')[1];
    if (!corpo) return null;
    const json = atob(corpo.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as ConteudoToken;
  } catch {
    return null;
  }
}

export function tokenExpirado(token: string): boolean {
  const conteudo = lerConteudo(token);
  if (!conteudo?.exp) return false;
  return conteudo.exp * 1000 <= Date.now();
}
