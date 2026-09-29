import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './useAuth';
import { Carregando } from '../components/ui/Carregando';

/**
 * Envolve as rotas que exigem login. Enquanto a sessão guardada está sendo
 * conferida mostra o carregando — sem isso a tela piscaria no login a cada F5.
 */
export function RotaProtegida() {
  const { autenticado, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <Carregando mensagem="Verificando sua sessão…" />;

  if (!autenticado) {
    // Guarda de onde veio para voltar ao destino depois do login.
    return <Navigate to="/entrar" replace state={{ de: local.pathname }} />;
  }

  return <Outlet />;
}
