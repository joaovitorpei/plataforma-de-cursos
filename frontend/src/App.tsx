import { ProvedorAuth } from './auth/ProvedorAuth';
import { Rotas } from './routes/Rotas';

export function App() {
  return (
    <ProvedorAuth>
      <Rotas />
    </ProvedorAuth>
  );
}
