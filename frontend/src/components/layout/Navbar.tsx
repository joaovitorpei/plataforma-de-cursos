import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { MenuSuspenso } from './MenuSuspenso';
import { useAuth } from '../../auth/useAuth';
import { Botao } from '../ui/Botao';
import { iniciais } from '../../utils/formato';

const CATALOGO = [
  { para: '/cursos', texto: 'Cursos' },
  { para: '/trilhas', texto: 'Trilhas' },
  { para: '/categorias', texto: 'Categorias' },
];

const CONTEUDO = [
  { para: '/modulos', texto: 'Módulos' },
  { para: '/aulas', texto: 'Aulas' },
];

const ALUNOS = [
  { para: '/usuarios', texto: 'Usuários' },
  { para: '/matriculas', texto: 'Matrículas' },
  { para: '/progresso', texto: 'Progresso' },
  { para: '/avaliacoes', texto: 'Avaliações' },
  { para: '/certificados', texto: 'Certificados' },
];

const FINANCEIRO = [
  { para: '/planos', texto: 'Planos' },
  { para: '/assinaturas', texto: 'Assinaturas' },
  { para: '/pagamentos', texto: 'Pagamentos' },
];

export function Navbar() {
  const { usuario, sair } = useAuth();
  const navegar = useNavigate();
  const [aberta, setAberta] = useState(false);

  function aoSair() {
    sair();
    navegar('/entrar', { replace: true });
  }

  return (
    <nav className={`navbar${aberta ? ' aberta' : ''}`}>
      <div className="container navbar-interna">
        <NavLink to="/" className="marca" onClick={() => setAberta(false)}>
          Edu<span className="marca-destaque">Cursos</span>
        </NavLink>

        <button
          type="button"
          className="navbar-alternador"
          aria-expanded={aberta}
          aria-label="Abrir menu"
          onClick={() => setAberta((valor) => !valor)}
        >
          ☰
        </button>

        <div className="navegacao">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' ativo' : ''}`}
            onClick={() => setAberta(false)}
          >
            Início
          </NavLink>
          <MenuSuspenso titulo="Catálogo" itens={CATALOGO} />
          <MenuSuspenso titulo="Conteúdo" itens={CONTEUDO} />
          <MenuSuspenso titulo="Alunos" itens={ALUNOS} />
          <MenuSuspenso titulo="Financeiro" itens={FINANCEIRO} />
        </div>

        <div className="usuario-bloco">
          <span className="avatar" aria-hidden="true">
            {iniciais(usuario?.nomeCompleto)}
          </span>
          <span className="texto-pequeno">
            <strong>{usuario?.nomeCompleto ?? 'Visitante'}</strong>
            <br />
            <span className="texto-terciario">{usuario?.email}</span>
          </span>
          <Botao variante="secundario" tamanho="pequeno" onClick={aoSair}>
            Sair
          </Botao>
        </div>
      </div>
    </nav>
  );
}
