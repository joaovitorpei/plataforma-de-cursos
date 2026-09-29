/** Nota de 1 a 5 desenhada com estrelas, com texto alternativo para leitores. */
export function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="estrelas" title={`${nota} de 5`}>
      <span className="visually-hidden-only" style={{ position: 'absolute', left: '-9999px' }}>
        {nota} de 5
      </span>
      {[1, 2, 3, 4, 5].map((posicao) => (
        <span
          key={posicao}
          aria-hidden="true"
          className={posicao <= nota ? '' : 'estrelas-vazia'}
        >
          ★
        </span>
      ))}
    </span>
  );
}
