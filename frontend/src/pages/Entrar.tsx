import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { Alerta, Botao, CampoTexto } from '../components/ui';
import { mensagemDeErro } from '../utils/erro';

export function Entrar() {
  const { entrar, autenticado, carregando } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Quem já está logado não vê o login.
  if (!carregando && autenticado) return <Navigate to="/" replace />;

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
      const destino = (local.state as { de?: string } | null)?.de ?? '/';
      navegar(destino, { replace: true });
    } catch (excecao) {
      setErro(mensagemDeErro(excecao));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="acesso">
      <aside className="acesso-vitrine">
        <p className="marca" style={{ color: '#fff', fontSize: '1.4rem' }}>
          Edu<span style={{ color: '#7fc4bb' }}>Cursos</span>
        </p>
        <h2>Ensinar e aprender no mesmo lugar</h2>
        <p>
          Catálogo de cursos, trilhas de aprendizado, matrículas, certificados e
          assinaturas — tudo conectado ao banco de dados da plataforma.
        </p>
        <ul className="acesso-lista">
          <li>
            <span className="acesso-marcador">—</span>
            Cursos organizados em módulos e aulas
          </li>
          <li>
            <span className="acesso-marcador">—</span>
            Progresso e avaliações por aluno
          </li>
          <li>
            <span className="acesso-marcador">—</span>
            Certificados com código de verificação
          </li>
        </ul>
      </aside>

      <main className="acesso-formulario">
        <div className="acesso-caixa">
          <h1 style={{ fontSize: 'var(--t-xl)' }}>Entrar</h1>
          <p
            className="texto-secundario"
            style={{ marginBottom: 'var(--e-5)' }}
          >
            Acesse com a conta cadastrada na plataforma.
          </p>

          <form onSubmit={aoEnviar} noValidate>
            {erro ? (
              <div style={{ marginBottom: 'var(--e-4)' }}>
                <Alerta tipo="erro">{erro}</Alerta>
              </div>
            ) : null}

            <CampoTexto
              rotulo="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              required
            />

            <CampoTexto
              rotulo="Senha"
              name="senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              required
            />

            <Botao
              type="submit"
              tamanho="grande"
              className="largura-total"
              disabled={enviando}
            >
              {enviando ? 'Entrando…' : 'Entrar'}
            </Botao>
          </form>

          <p
            className="texto-secundario texto-centro"
            style={{ marginTop: 'var(--e-5)' }}
          >
            Ainda não tem conta? <Link to="/cadastrar">Cadastre-se</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
