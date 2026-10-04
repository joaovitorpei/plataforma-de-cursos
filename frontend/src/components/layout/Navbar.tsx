import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { MenuSuspenso } from './MenuSuspenso';
import type { ItemMenu } from './MenuSuspenso';
import { useAuth } from '../../auth/useAuth';
import { Botao } from '../ui/Botao';
import { Selo } from '../ui/Selo';
import { iniciais } from '../../utils/formato';

/**
 * O menu muda conforme o perfil. Esconder item não é segurança — quem barra
 * de verdade é a API — mas evita oferecer à pessoa uma tela em que ela só
 * levaria 403.
 */
interface Secao {
  titulo: string;
  itens: ItemMenu[];
}

const CATALOGO_ALUNO: Secao = {
  titulo: 'Catálogo',
  itens: [
    { para: '/cursos', texto: 'Cursos' },
    { para: '/trilhas', texto: 'Trilhas' },
  ],
};

const CATALOGO_ADMIN: Secao = {
  titulo: 'Catálogo',
  itens: [
    { para: '/cursos', texto: 'Cursos' },
    { para: '/trilhas', texto: 'Trilhas' },
    { para: '/categorias', texto: 'Categorias' },
  ],
};

const CONTEUDO_ADMIN: Secao = {
  titulo: 'Conteúdo',
  itens: [
    { para: '/modulos', texto: 'Módulos' },
    { para: '/aulas', texto: 'Aulas' },
  ],
};

const MEUS_ESTUDOS: Secao = {
  titulo: 'Meus estudos',
  itens: [
    { para: '/matriculas', texto: 'Minhas matrículas' },
    { para: '/progresso', texto: 'Meu progresso' },
    { para: '/avaliacoes', texto: 'Minhas avaliações' },
    { para: '/certificados', texto: 'Meus certificados' },
  ],
};

const ALUNOS_ADMIN: Secao = {
  titulo: 'Alunos',
  itens: [
    { para: '/usuarios', texto: 'Usuários' },
    { para: '/matriculas', texto: 'Matrículas' },
    { para: '/progresso', texto: 'Progresso' },
    { para: '/avaliacoes', texto: 'Avaliações' },
    { para: '/certificados', texto: 'Certificados' },
  ],
};

const FINANCEIRO_ALUNO: Secao = {
  titulo: 'Assinatura',
  itens: [
    { para: '/planos', texto: 'Planos' },
    { para: '/assinaturas', texto: 'Minhas assinaturas' },
    { para: '/pagamentos', texto: 'Meus pagamentos' },
  ],
};

const FINANCEIRO_ADMIN: Secao = {
  titulo: 'Financeiro',
  itens: [
    { para: '/planos', texto: 'Planos' },
    { para: '/assinaturas', texto: 'Assinaturas' },
    { para: '/pagamentos', texto: 'Pagamentos' },
  ],
};

export function Navbar() {
  const { usuario, ehAdmin, sair } = useAuth();
  const navegar = useNavigate();
  const [aberta, setAberta] = useState(false);

  const secoes: Secao[] = ehAdmin
    ? [CATALOGO_ADMIN, CONTEUDO_ADMIN, ALUNOS_ADMIN, FINANCEIRO_ADMIN]
    : [CATALOGO_ALUNO, MEUS_ESTUDOS, FINANCEIRO_ALUNO];

  function aoSair() {
    sair();
    navegar('/entrar', { replace: true });
  }

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <NavLink
          to="/"
          className="navbar-brand marca"
          onClick={() => setAberta(false)}
        >
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
                className={({ isActive }) =>
                  `nav-link${isActive ? ' active' : ''}`
                }
                onClick={() => setAberta(false)}
              >
                Início
              </NavLink>
            </li>
            {secoes.map((secao) => (
              <MenuSuspenso
                key={secao.titulo}
                titulo={secao.titulo}
                itens={secao.itens}
              />
            ))}
          </ul>

          <div className="d-flex align-items-center gap-2 border-start ps-3">
            <span className="avatar" aria-hidden="true">
              {iniciais(usuario?.nomeCompleto)}
            </span>
            <span className="small lh-sm">
              <strong className="d-block">
                {usuario?.nomeCompleto ?? 'Visitante'}
              </strong>
              <Selo cor={ehAdmin ? 'marca' : 'neutro'}>
                {ehAdmin ? 'Professor' : 'Aluno'}
              </Selo>
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
