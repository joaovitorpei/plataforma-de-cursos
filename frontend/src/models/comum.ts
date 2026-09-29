import { z } from 'zod';

/**
 * Campo opcional de formulário.
 *
 * Um <input> vazio devolve string vazia, não `undefined`. E `z.string().optional()`
 * aceita `""` como string válida — então o formulário acabava enviando
 * `{ dataConclusao: "" }` para a API.
 *
 * Do outro lado, o `@IsOptional()` do NestJS só pula a validação quando o valor
 * é `undefined` ou `null`. Texto vazio ele repassa para o `@IsDateString()`,
 * que recusa com 400. O mesmo vale para números: `Number("")` é 0, então um
 * campo em branco virava zero no banco em vez de ficar nulo.
 *
 * Esta função resolve os dois casos: campo em branco vira `undefined` e some
 * do corpo da requisição.
 */
export function opcional<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(
    (valor) => (valor === '' || valor === null ? undefined : valor),
    schema.optional(),
  );
}
