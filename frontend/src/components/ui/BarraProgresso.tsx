export function BarraProgresso({
  valor,
  total,
  rotulo,
}: {
  valor: number;
  total: number;
  rotulo?: string;
}) {
  const porcentagem = total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div>
      <div className="linha-entre texto-pequeno texto-secundario" style={{ marginBottom: 4 }}>
        <span>{rotulo ?? 'Progresso'}</span>
        <span>
          {valor}/{total} · {porcentagem}%
        </span>
      </div>
      <div
        className="progresso-trilho"
        role="progressbar"
        aria-valuenow={porcentagem}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progresso-preenchimento" style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  );
}
