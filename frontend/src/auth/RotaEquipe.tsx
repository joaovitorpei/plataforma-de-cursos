import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from './useAuth';
import { Carregando } from '../components/ui/Carregando';

/**
 * Telas de manutenção do catálogo — professor e dono entram.
 *
 * Isto é conveniência, não segurança: mesmo forçando a URL, a API responderia
 * 403. O que ganhamos é não mostrar uma tela que só daria erro.
 */
export function RotaEquipe() {
  const { ehEquipe, carregando } = useAuth();

  if (carregando) return <Carregando mensagem="Verificando sua sessão…" />;
  if (!ehEquipe) return <Navigate to="/sem-permissao" replace />;

  return <Outlet />;
}
