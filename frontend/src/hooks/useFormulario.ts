import { useCallback, useState } from 'react';
import type { ZodType } from 'zod';

import { mensagemDeErro } from '../utils/erro';

type Erros<T> = Partial<Record<keyof T, string>>;

/**
 * Formulário validado com zod. Junta três coisas que toda tela de cadastro
 * repete: o estado dos campos, os erros por campo e o envio para a API.
 */
export function useFormulario<Valores extends Record<string, unknown>, Saida>(
  iniciais: Valores,
  schema: ZodType<Saida>,
  enviar: (dados: Saida) => Promise<void>,
) {
  const [valores, setValores] = useState<Valores>(iniciais);
  const [erros, setErros] = useState<Erros<Valores>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const alterar = useCallback(
    (campo: keyof Valores) =>
      (
        evento: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => {
        const { value } = evento.target;
        setValores((atuais) => ({ ...atuais, [campo]: value }));
        setErros((atuais) => ({ ...atuais, [campo]: undefined }));
      },
    [],
  );

  const preencher = useCallback((novos: Valores) => setValores(novos), []);

  const submeter = useCallback(
    async (evento: React.FormEvent) => {
      evento.preventDefault();
      setErroGeral(null);

      const resultado = schema.safeParse(valores);

      if (!resultado.success) {
        const encontrados: Erros<Valores> = {};
        for (const problema of resultado.error.issues) {
          const campo = problema.path[0] as keyof Valores | undefined;
          if (campo && !encontrados[campo])
            encontrados[campo] = problema.message;
        }
        setErros(encontrados);
        return;
      }

      setEnviando(true);
      try {
        await enviar(resultado.data);
      } catch (excecao) {
        setErroGeral(mensagemDeErro(excecao));
      } finally {
        setEnviando(false);
      }
    },
    [schema, valores, enviar],
  );

  return {
    valores,
    erros,
    erroGeral,
    enviando,
    alterar,
    preencher,
    submeter,
    setErroGeral,
  };
}
