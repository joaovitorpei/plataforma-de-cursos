import { useEffect, useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

export interface ItemMenu {
  para: string;
  texto: string;
}

/** Menu da navbar. Fecha no Esc, no clique fora e ao navegar. */
export function MenuSuspenso({ titulo, itens }: { titulo: string; itens: ItemMenu[] }) {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
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
    <div className="menu" ref={caixa}>
      <button
        type="button"
        className="nav-link"
        aria-expanded={aberto}
        aria-controls={identificador}
        onClick={() => setAberto((valor) => !valor)}
      >
        {titulo} <span aria-hidden="true">▾</span>
      </button>

      {aberto ? (
        <div className="menu-painel" id={identificador}>
          {itens.map((item) => (
            <NavLink
              key={item.para}
              to={item.para}
              className={({ isActive }) => `menu-item${isActive ? ' ativo' : ''}`}
              onClick={() => setAberto(false)}
            >
              {item.texto}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}
