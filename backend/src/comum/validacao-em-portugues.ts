import { BadRequestException } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

import { rotuloDoCampo } from './rotulos';

/**
 * Traduz as mensagens do class-validator para português.
 *
 * O class-validator não tem tradução embutida: `@IsEmail()` devolve sempre
 * "email must be an email". Em vez de escrever `{ message: '...' }` nos 89
 * decorators espalhados pelos DTOs, traduzimos aqui — pela **chave** da
 * restrição (`isEmail`, `max`, `isInt`...), que é a mesma em qualquer idioma.
 *
 * A vantagem é que decorator novo já nasce traduzido.
 */

/** Alguns limites (mínimo, máximo) só existem dentro do texto em inglês. */
function numeroDaMensagem(mensagem: string): string | null {
  const encontrado = /(-?\d+(?:\.\d+)?)/.exec(mensagem);
  return encontrado ? encontrado[1] : null;
}

type Tradutor = (rotulo: string, mensagemOriginal: string) => string;

const TRADUCOES: Record<string, Tradutor> = {
  isNotEmpty: (rotulo) => `${rotulo} é obrigatório`,
  isDefined: (rotulo) => `${rotulo} é obrigatório`,
  isString: (rotulo) => `${rotulo} deve ser um texto`,
  isEmail: () => 'digite um e-mail válido',
  isInt: (rotulo) => `${rotulo} deve ser um número inteiro`,
  isNumber: (rotulo) =>
    `${rotulo} deve ser um número com no máximo 2 casas decimais`,
  isPositive: (rotulo) => `${rotulo} deve ser maior que zero`,
  isBoolean: (rotulo) => `${rotulo} deve ser verdadeiro ou falso`,
  isDateString: (rotulo) => `${rotulo} deve estar no formato AAAA-MM-DD`,
  isUrl: (rotulo) => `${rotulo} deve ser um endereço válido`,
  isEnum: (rotulo) => `${rotulo} tem um valor que não é aceito`,

  min: (rotulo, original) => {
    const limite = numeroDaMensagem(original);
    return limite
      ? `${rotulo} não pode ser menor que ${limite}`
      : `${rotulo} está abaixo do mínimo`;
  },
  max: (rotulo, original) => {
    const limite = numeroDaMensagem(original);
    return limite
      ? `${rotulo} não pode ser maior que ${limite}`
      : `${rotulo} está acima do máximo`;
  },
  minLength: (rotulo, original) => {
    const limite = numeroDaMensagem(original);
    return limite
      ? `${rotulo} deve ter no mínimo ${limite} caracteres`
      : `${rotulo} está curto demais`;
  },
  maxLength: (rotulo, original) => {
    const limite = numeroDaMensagem(original);
    return limite
      ? `${rotulo} deve ter no máximo ${limite} caracteres`
      : `${rotulo} está longo demais`;
  },
};

/** Primeira letra maiúscula, para a frase não começar minúscula. */
function comMaiuscula(frase: string): string {
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

function traduzir(erro: ValidationError, caminho = ''): string[] {
  const campo = caminho ? `${caminho}.${erro.property}` : erro.property;
  const rotulo = rotuloDoCampo(erro.property);

  const mensagens = Object.entries(erro.constraints ?? {}).map(
    ([chave, original]) => {
      const tradutor = TRADUCOES[chave];
      // Restrição sem tradução conhecida: devolve o texto original, que ainda
      // é mais útil do que uma mensagem genérica.
      return comMaiuscula(tradutor ? tradutor(rotulo, original) : original);
    },
  );

  // DTOs aninhados (não temos hoje, mas o dia que tiver já funciona).
  const filhos = (erro.children ?? []).flatMap((filho) =>
    traduzir(filho, campo),
  );

  return [...mensagens, ...filhos];
}

/**
 * Entregue ao ValidationPipe no `main.ts`. Recebe os erros crus do
 * class-validator e devolve o 400 já em português.
 */
export function erroDeValidacaoEmPortugues(
  erros: ValidationError[],
): BadRequestException {
  const mensagens = erros.flatMap((erro) => traduzir(erro));

  return new BadRequestException({
    statusCode: 400,
    error: 'Bad Request',
    message: mensagens.length ? mensagens : ['Dados inválidos'],
  });
}
