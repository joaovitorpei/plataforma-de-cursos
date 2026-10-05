/** Funções de exibição: a API fala ISO e Decimal, a tela fala português. */

/** "2026-09-17T00:00:00.000Z" -> "17/09/2026" */
export function data(iso?: string | null): string {
  if (!iso) return '—';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : '—';
}

/** "2026-09-17T00:00:00.000Z" -> "2026-09-17" (formato do <input type="date">) */
export function dataParaInput(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

/** Hoje no formato do <input type="date">. */
export function hoje(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

/**
 * O Prisma serializa Decimal como texto ("299.9") para não perder centavos.
 * Aqui ele vira "R$ 299,90".
 */
export function moeda(valor?: string | number | null): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  const numero = typeof valor === 'string' ? Number(valor) : valor;
  if (Number.isNaN(numero)) return '—';
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/** Minutos -> "1h 30min" */
export function duracao(minutos?: number | null): string {
  if (!minutos) return '—';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto}min`;
  return resto ? `${horas}h ${resto}min` : `${horas}h`;
}

/** "João Vitor Silva" -> "JV" (para o avatar) */
export function iniciais(nome?: string | null): string {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

/** Corta um texto longo para caber no cartão. */
export function resumir(texto?: string | null, limite = 120): string {
  if (!texto) return '';
  return texto.length <= limite
    ? texto
    : `${texto.slice(0, limite).trimEnd()}…`;
}

/**
 * A data já passou (ou é hoje)?
 *
 * Usado pela situação da matrícula: uma data de conclusão marcada para o
 * futuro não significa curso terminado. Comparação por texto, ambos em
 * AAAA-MM-DD — assim não há surpresa de fuso horário.
 */
export function jaAconteceu(iso?: string | null): boolean {
  if (!iso) return false;
  return iso.slice(0, 10) <= new Date().toISOString().slice(0, 10);
}
