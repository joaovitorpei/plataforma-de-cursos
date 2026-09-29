import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface Base {
  rotulo: string;
  erro?: string;
  ajuda?: string;
  /** Classes de grade do Bootstrap, ex.: "col-md-6". */
  className?: string;
}

/** <input> com rótulo, erro e validação visual do Bootstrap. */
export function CampoTexto({
  rotulo,
  erro,
  ajuda,
  className = '',
  id,
  ...resto
}: Base & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>) {
  const identificador = id ?? resto.name;
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label" htmlFor={identificador}>
        {rotulo}
      </label>
      <input
        id={identificador}
        className={`form-control${erro ? ' is-invalid' : ''}`}
        {...resto}
      />
      {erro ? <div className="invalid-feedback">{erro}</div> : null}
      {!erro && ajuda ? <div className="form-text">{ajuda}</div> : null}
    </div>
  );
}

interface Opcao {
  valor: string | number;
  texto: string;
}

/** <select> alimentado por uma lista de opções. */
export function CampoSelect({
  rotulo,
  erro,
  ajuda,
  opcoes,
  vazio = 'Selecione…',
  className = '',
  id,
  ...resto
}: Base &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    opcoes: Opcao[];
    vazio?: string;
  }) {
  const identificador = id ?? resto.name;
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label" htmlFor={identificador}>
        {rotulo}
      </label>
      <select
        id={identificador}
        className={`form-select${erro ? ' is-invalid' : ''}`}
        {...resto}
      >
        <option value="">{vazio}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.texto}
          </option>
        ))}
      </select>
      {erro ? <div className="invalid-feedback">{erro}</div> : null}
      {!erro && ajuda ? <div className="form-text">{ajuda}</div> : null}
    </div>
  );
}

/** <textarea> para descrições e comentários. */
export function CampoArea({
  rotulo,
  erro,
  ajuda,
  className = '',
  id,
  ...resto
}: Base & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>) {
  const identificador = id ?? resto.name;
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label" htmlFor={identificador}>
        {rotulo}
      </label>
      <textarea
        id={identificador}
        className={`form-control${erro ? ' is-invalid' : ''}`}
        {...resto}
      />
      {erro ? <div className="invalid-feedback">{erro}</div> : null}
      {!erro && ajuda ? <div className="form-text">{ajuda}</div> : null}
    </div>
  );
}
