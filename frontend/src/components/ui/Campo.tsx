import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface Base {
  rotulo: string;
  erro?: string;
  ajuda?: string;
}

/** <input> com rótulo, mensagem de erro e marcação de acessibilidade. */
export function CampoTexto({
  rotulo,
  erro,
  ajuda,
  id,
  ...resto
}: Base & InputHTMLAttributes<HTMLInputElement>) {
  const identificador = id ?? resto.name;
  return (
    <label className="campo" htmlFor={identificador}>
      <span className="campo-rotulo">{rotulo}</span>
      <input
        id={identificador}
        className="campo-controle"
        aria-invalid={erro ? 'true' : undefined}
        {...resto}
      />
      {erro ? <span className="campo-erro">{erro}</span> : null}
      {!erro && ajuda ? <span className="campo-ajuda">{ajuda}</span> : null}
    </label>
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
  id,
  ...resto
}: Base &
  SelectHTMLAttributes<HTMLSelectElement> & {
    opcoes: Opcao[];
    vazio?: string;
  }) {
  const identificador = id ?? resto.name;
  return (
    <label className="campo" htmlFor={identificador}>
      <span className="campo-rotulo">{rotulo}</span>
      <select
        id={identificador}
        className="campo-controle"
        aria-invalid={erro ? 'true' : undefined}
        {...resto}
      >
        <option value="">{vazio}</option>
        {opcoes.map((opcao) => (
          <option key={opcao.valor} value={opcao.valor}>
            {opcao.texto}
          </option>
        ))}
      </select>
      {erro ? <span className="campo-erro">{erro}</span> : null}
      {!erro && ajuda ? <span className="campo-ajuda">{ajuda}</span> : null}
    </label>
  );
}

/** <textarea> para descrições e comentários. */
export function CampoArea({
  rotulo,
  erro,
  ajuda,
  id,
  ...resto
}: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const identificador = id ?? resto.name;
  return (
    <label className="campo" htmlFor={identificador}>
      <span className="campo-rotulo">{rotulo}</span>
      <textarea
        id={identificador}
        className="campo-controle"
        aria-invalid={erro ? 'true' : undefined}
        {...resto}
      />
      {erro ? <span className="campo-erro">{erro}</span> : null}
      {!erro && ajuda ? <span className="campo-ajuda">{ajuda}</span> : null}
    </label>
  );
}
