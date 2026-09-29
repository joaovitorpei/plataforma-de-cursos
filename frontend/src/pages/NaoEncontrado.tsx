import { Link } from 'react-router-dom';

import { EstadoVazio } from '../components/ui';

export function NaoEncontrado() {
  return (
    <EstadoVazio
      titulo="Página não encontrada"
      descricao="O endereço digitado não existe nesta plataforma."
      acao={<Link to="/">Voltar ao início</Link>}
    />
  );
}
