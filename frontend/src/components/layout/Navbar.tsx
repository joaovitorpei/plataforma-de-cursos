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
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <NavLink to="/" className="navbar-brand marca" onClick={() => setAberta(false)}>
          Edu<span>Cursos</span>
        </NavLink>

        <button
          type="button"
          className="navbar-toggler"
          aria-expanded={aberta}
          aria-label="Abrir menu"
          onClick={() => setAberta((valor) => !valor)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${aberta ? ' show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                onClick={() => setAberta(false)}
              >
                Início
              </NavLink>
            </li>
            <MenuSuspenso titulo="Catálogo" itens={CATALOGO} />
            <MenuSuspenso titulo="Conteúdo" itens={CONTEUDO} />
            <MenuSuspenso titulo="Alunos" itens={ALUNOS} />
            <MenuSuspenso titulo="Financeiro" itens={FINANCEIRO} />
          </ul>

          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <span className="avatar" aria-hidden="true">
              {iniciais(usuario?.nomeCompleto)}
            </span>
            <span className="small lh-sm">
              <strong className="d-block">{usuario?.nomeCompleto ?? 'Visitante'}</strong>
              <span className="text-body-secondary">{usuario?.email}</span>
            </span>
            <Botao variante="secundario" tamanho="pequeno" onClick={aoSair}>
              Sair
            </Botao>
          </div>
        </div>
      </div>
    </nav>
  );
}
