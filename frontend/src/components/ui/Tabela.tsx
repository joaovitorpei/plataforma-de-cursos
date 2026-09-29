import type { ReactNode } from 'react';

export interface Coluna<T> {
  cabecalho: string;
  celula: (registro: T) => ReactNode;
  /** Alinha à direita — usado na coluna de ações. */
  acoes?: boolean;
}

/**
 * Tabela genérica. A rolagem horizontal fica dentro do contêiner para o
 * corpo da página nunca rolar de lado no celular.
 */
export function Tabela<T>({
  colunas,
  dados,
  chave,
}: {
  colunas: Coluna<T>[];
  dados: T[];
  chave: (registro: T) => string | number;
}) {
  return (
    <div className="tabela-rolagem">
      <table className="tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.cabecalho} className={coluna.acoes ? 'tabela-acoes' : undefined}>
                {coluna.cabecalho}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((registro) => (
            <tr key={chave(registro)}>
              {colunas.map((coluna) => (
                <td
                  key={coluna.cabecalho}
                  className={coluna.acoes ? 'tabela-acoes' : undefined}
                >
                  {coluna.celula(registro)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
