import type { ReactNode } from 'react';

export interface Coluna<T> {
  cabecalho: string;
  celula: (registro: T) => ReactNode;
  /** Alinha à direita — usado na coluna de ações. */
  acoes?: boolean;
}

/**
 * Tabela do Bootstrap. O `table-responsive` mantém a rolagem horizontal dentro
 * do contêiner, para a página nunca rolar de lado no celular.
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
    <div className="table-responsive">
      <table className="table table-hover align-middle bg-white border mb-0">
        <thead className="table-light">
          <tr>
            {colunas.map((coluna) => (
              <th
                key={coluna.cabecalho}
                scope="col"
                className={`small text-uppercase text-body-secondary${
                  coluna.acoes ? ' text-end' : ''
                }`}
              >
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
                  className={coluna.acoes ? 'text-end text-nowrap' : undefined}
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
