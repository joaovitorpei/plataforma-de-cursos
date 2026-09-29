export function Carregando({ mensagem = 'Carregando…' }: { mensagem?: string }) {
  return (
    <div className="text-center text-body-secondary py-5" role="status">
      <div className="spinner-border text-primary mb-3" aria-hidden="true" />
      <p className="mb-0">{mensagem}</p>
    </div>
  );
}
