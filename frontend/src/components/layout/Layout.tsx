import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';
import { Rodape } from './Rodape';

/** Casca das telas internas: navbar fixa, conteúdo e rodapé. */
export function Layout() {
  return (
    <div className="app">
      <Navbar />
      <main className="flex-grow-1 py-4">
        <div className="container">
          <Outlet />
        </div>
      </main>
      <Rodape />
    </div>
  );
}
