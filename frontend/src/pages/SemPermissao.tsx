import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { Botao, Cartao } from '../components/ui';

export function SemPermissao() {
  const { usuario } = useAuth();

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <Cartao className="text-center">
          <p className="display-6 mb-2" aria-hidden="true">
            <i className="bi bi-shield-lock" />
          </p>
          <h1 className="h3">Esta área é dos professores</h1>

          <p className="text-body-secondary">
            Sua conta <strong>{usuario?.nomeCompleto}</strong> é de aluno, e
            esta tela serve para manter o catálogo da plataforma — criar cursos,
            módulos, aulas e categorias.
          </p>

          <p className="text-body-secondary">
            Como aluno você pode explorar todo o catálogo, se matricular nos
            cursos e acompanhar o seu progresso.
          </p>

          <div className="hstack gap-2 justify-content-center mt-4">
            <Link to="/cursos">
              <Botao>Ver os cursos</Botao>
            </Link>
            <Link to="/">
              <Botao variante="secundario">Voltar ao início</Botao>
            </Link>
          </div>
        </Cartao>
      </div>
    </div>
  );
}
