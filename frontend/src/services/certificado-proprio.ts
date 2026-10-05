import { requisitar } from './http';
import type { ICertificado } from '../models';

/** Quanto falta para o aluno poder emitir o certificado de um curso. */
export interface Elegibilidade {
  totalAulas: number;
  aulasConcluidas: number;
  concluiu: boolean;
  jaEmitido: boolean;
}

export function consultarElegibilidade(
  idCurso: number,
): Promise<Elegibilidade> {
  return requisitar<Elegibilidade>(`/certificados/elegibilidade/${idCurso}`);
}

/**
 * Emite o certificado do próprio aluno. A API confere se ele realmente
 * concluiu todas as aulas — se faltar uma, responde 403.
 */
export function emitirMeuCertificado(
  idUsuario: number,
  idCurso: number,
): Promise<ICertificado> {
  const ano = new Date().getFullYear();
  const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();

  return requisitar<ICertificado>('/certificados', {
    method: 'POST',
    body: JSON.stringify({
      idUsuario,
      idCurso,
      codigoVerificacao: `CERT-${ano}-${aleatorio}`,
    }),
  });
}
