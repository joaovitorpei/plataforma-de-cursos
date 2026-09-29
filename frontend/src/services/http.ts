import { lerToken, limparToken } from './token';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/** Erro vindo da API, já com a mensagem pronta para mostrar na tela. */
export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

/** Avisa o app que o token venceu, para mandar o usuário de volta ao login. */
let aoPerderSessao: (() => void) | null = null;

export function registrarPerdaDeSessao(callback: () => void): void {
  aoPerderSessao = callback;
}

/**
 * O NestJS responde erro em dois formatos:
 *   { message: "texto", ... }            (exceções nossas)
 *   { message: ["erro 1", "erro 2"], ... } (ValidationPipe)
 */
function extrairMensagem(corpo: unknown, status: number): string {
  if (corpo && typeof corpo === 'object' && 'message' in corpo) {
    const { message } = corpo as { message: unknown };
    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }
  if (status === 0) return 'Não foi possível falar com o servidor. Ele está no ar?';
  return `Erro ${status} ao falar com o servidor.`;
}

export async function requisitar<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<T> {
  const cabecalhos: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((opcoes.headers as Record<string, string>) ?? {}),
  };

  // Toda rota protegida espera o token no formato "Bearer <token>".
  const token = lerToken();
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${API}${caminho}`, { ...opcoes, headers: cabecalhos });
  } catch {
    throw new ErroApi(0, extrairMensagem(null, 0));
  }

  if (resposta.status === 204) return {} as T;

  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;

  if (!resposta.ok) {
    // Token vencido ou ausente: derruba a sessão e volta para o login.
    if (resposta.status === 401) {
      limparToken();
      aoPerderSessao?.();
    }
    throw new ErroApi(resposta.status, extrairMensagem(corpo, resposta.status));
  }

  return corpo as T;
}
