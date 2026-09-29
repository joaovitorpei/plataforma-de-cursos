import { useContext } from 'react';
import { ContextoAuth } from './contexto';

export function useAuth() {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <ProvedorAuth>');
  }
  return contexto;
}
