import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth';
import { Carregando } from '../components/ui/Carregando';

/**
 * Envolve as telas que só fazem sentido para professor — os formulários do
 * catálogo e a lista de usuários.
 *
 * Isto é conveniência, não segurança: mesmo que alguém force a URL, a API
 * responderia 403. O que ganhamos aqui é não mostrar uma tela que só daria
 * erro, e deixar claro por que o acesso foi negado.
 */
export function RotaAdmin() {
  const { ehAdmin, carregando } = useAuth();

  if (carregando) return <Carregando mensagem="Verificando sua sessão…" />;
  if (!ehAdmin) return <Navigate to="/sem-permissao" replace />;

  return <Outlet />;
}
