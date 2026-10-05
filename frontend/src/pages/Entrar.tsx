import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { Alerta, Botao, CampoTexto } from '../components/ui';
import { MarcaVitrine } from '../components/layout';
import { ROTULO_PERFIL } from '../models';
import type { Perfil } from '../models';
import { lerConteudo, lerToken } from '../services';
import { mensagemDeErro } from '../utils/erro';

/**
 * As três portas de entrada.
 *
 * A aba **não concede** nada: quem define o que a pessoa pode é o perfil
 * gravado na conta. Ela serve para orientar — e para avisar com clareza quando
 * alguém tenta entrar pela porta errada.
 */
const ABAS: { perfil: Perfil; icone: string; chamada: string }[] = [
  {
    perfil: 'USER',
    icone: 'bi-mortarboard',
    chamada: 'Acesse seus cursos e continue de onde parou.',
  },
  {
    perfil: 'INSTRUTOR',
    icone: 'bi-easel',
    chamada: 'Gerencie seus cursos, módulos e aulas, e acompanhe as turmas.',
  },
  {
    perfil: 'ADMIN',
    icone: 'bi-shield-lock',
    chamada: 'Acesso completo: catálogo, usuários e financeiro.',
  },
];

export function Entrar() {
  const { entrar, sair, autenticado, carregando } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();

  const [aba, setAba] = useState<Perfil>('USER');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!carregando && autenticado) return <Navigate to="/" replace />;

  const abaAtual = ABAS.find((a) => a.perfil === aba)!;

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      await entrar(email, senha);

      // O login deu certo, mas a conta é de outro tipo? Desfaz e explica.
      // A conferência é só de orientação — a API já teria barrado qualquer
      // ação fora do perfil, independentemente da aba escolhida.
      const token = lerToken();
      const real = token ? lerConteudo(token)?.perfil : undefined;

      if (real && real !== aba) {
        sair();
        setErro(
          `Esta conta é de ${ROTULO_PERFIL[real].toLowerCase()}. ` +
            `Use a aba "${ROTULO_PERFIL[real]}" para entrar.`,
        );
        setAba(real);
        return;
      }

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
        <MarcaVitrine />
        <h2>Ensinar e aprender no mesmo lugar</h2>
      </aside>

      <main className="acesso-formulario">
        <div className="acesso-caixa">
          <h1 className="h3">Entrar</h1>

          {/* Abas: orientam qual conta usar, não dão poder nenhum */}
          <ul className="nav nav-pills nav-fill mb-3" role="tablist">
            {ABAS.map((item) => (
              <li className="nav-item" key={item.perfil}>
                <button
                  type="button"
                  className={`nav-link${aba === item.perfil ? ' active' : ''}`}
                  aria-pressed={aba === item.perfil}
                  onClick={() => {
                    setAba(item.perfil);
                    setErro(null);
                  }}
                >
                  <i className={`bi ${item.icone} me-1`} aria-hidden="true" />
                  {ROTULO_PERFIL[item.perfil]}
                </button>
              </li>
            ))}
          </ul>

          <p className="text-body-secondary mb-4">{abaAtual.chamada}</p>

          <form onSubmit={aoEnviar} noValidate>
            {erro ? (
              <div className="mb-3">
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

            <Botao type="submit" tamanho="grande" className="w-100" disabled={enviando}>
              {enviando ? 'Entrando…' : `Entrar como ${ROTULO_PERFIL[aba].toLowerCase()}`}
            </Botao>
          </form>

          {aba === 'USER' ? (
            <p className="text-body-secondary text-center mt-4">
              Ainda não tem conta? <Link to="/cadastrar">Cadastre-se</Link>
            </p>
          ) : (
            <p className="text-body-secondary text-center mt-4 small">
              Contas de professor e de administrador são criadas pelo
              administrador da plataforma.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
