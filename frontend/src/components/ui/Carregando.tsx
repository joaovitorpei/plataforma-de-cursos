export function Carregando({ mensagem = 'Carregando…' }: { mensagem?: string }) {
  return (
    <div className="carregando" role="status">
      <div className="girando" aria-hidden="true" />
      <span>{mensagem}</span>
    </div>
  );
}
