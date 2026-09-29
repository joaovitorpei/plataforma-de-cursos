/** Nota de 1 a 5 desenhada com estrelas, com texto para leitores de tela. */
export function Estrelas({ nota }: { nota: number }) {
  return (
    <span className="estrelas" title={`${nota} de 5`}>
      <span className="visually-hidden">{nota} de 5</span>
      {[1, 2, 3, 4, 5].map((posicao) => (
        <i
          key={posicao}
          aria-hidden="true"
          className={`bi ${posicao <= nota ? 'bi-star-fill' : 'bi-star vazia'}`}
        />
      ))}
    </span>
  );
}
