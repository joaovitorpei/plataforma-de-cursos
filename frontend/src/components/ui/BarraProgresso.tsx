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
      <div className="d-flex justify-content-between small text-body-secondary mb-1">
        <span>{rotulo ?? 'Progresso'}</span>
        <span>
          {valor}/{total} · {porcentagem}%
        </span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={porcentagem}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar" style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  );
}
