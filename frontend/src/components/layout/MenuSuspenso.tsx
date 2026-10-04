import { useEffect, useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

export interface ItemMenu {
  para: string;
  texto: string;
}

/**
 * Dropdown do Bootstrap controlado pelo React — sem carregar o JS do
 * Bootstrap. Fecha no Esc, no clique fora e ao navegar.
 */
export function MenuSuspenso({
  titulo,
  itens,
}: {
  titulo: string;
  itens: ItemMenu[];
}) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLLIElement>(null);
  const identificador = useId();

  useEffect(() => {
    if (!aberto) return;

    function aoClicarFora(evento: MouseEvent) {
      if (!caixa.current?.contains(evento.target as Node)) setAberto(false);
    }
    function aoTeclar(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [aberto]);

  return (
    <li className="nav-item dropdown" ref={caixa}>
      <button
        type="button"
        className="nav-link dropdown-toggle"
        id={identificador}
        aria-expanded={aberto}
        onClick={() => setAberto((valor) => !valor)}
      >
        {titulo}
      </button>

      <ul
        className={`dropdown-menu${aberto ? ' show' : ''}`}
        aria-labelledby={identificador}
      >
        {itens.map((item) => (
          <li key={item.para}>
            <NavLink
              to={item.para}
              className={({ isActive }) =>
                `dropdown-item${isActive ? ' active' : ''}`
              }
              onClick={() => setAberto(false)}
            >
              {item.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </li>
  );
}
