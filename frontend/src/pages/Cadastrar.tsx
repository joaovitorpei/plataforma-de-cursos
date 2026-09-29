import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { Alerta, Botao, CampoTexto } from '../components/ui';
import { usuarioSchema } from '../models';
import { mensagemDeErro } from '../utils/erro';

export function Cadastrar() {
  const { cadastrar, autenticado, carregando } = useAuth();
  const navegar = useNavigate();

  const [valores, setValores] = useState({ nomeCompleto: '', email: '', senha: '' });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!carregando && autenticado) return <Navigate to="/" replace />;

  function alterar(campo: keyof typeof valores) {
    return (evento: React.ChangeEvent<HTMLInputElement>) => {
      setValores((atuais) => ({ ...atuais, [campo]: evento.target.value }));
      setErros((atuais) => ({ ...atuais, [campo]: '' }));
    };
  }

  async function aoEnviar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroGeral(null);

    const resultado = usuarioSchema.safeParse(valores);
    if (!resultado.success) {
      const encontrados: Record<string, string> = {};
      for (const problema of resultado.error.issues) {
        const campo = String(problema.path[0] ?? '');
        if (campo && !encontrados[campo]) encontrados[campo] = problema.message;
      }
      setErros(encontrados);
      return;
    }

    setEnviando(true);
    try {
      await cadastrar(valores.nomeCompleto, valores.email, valores.senha);
      navegar('/', { replace: true });
    } catch (excecao) {
      setErroGeral(mensagemDeErro(excecao));
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
        <h2>Comece agora</h2>
        <p>
          Crie sua conta para acessar o catálogo, acompanhar seu progresso e
          emitir certificados.
        </p>
      </aside>

      <main className="acesso-formulario">
        <div className="acesso-caixa">
          <h1 style={{ fontSize: 'var(--t-xl)' }}>Criar conta</h1>
          <p className="texto-secundario" style={{ marginBottom: 'var(--e-5)' }}>
            Leva menos de um minuto.
          </p>

          <form onSubmit={aoEnviar} noValidate>
            {erroGeral ? (
              <div style={{ marginBottom: 'var(--e-4)' }}>
                <Alerta tipo="erro">{erroGeral}</Alerta>
              </div>
            ) : null}

            <CampoTexto
              rotulo="Nome completo"
              name="nomeCompleto"
              autoComplete="name"
              placeholder="João Vitor Silva"
              value={valores.nomeCompleto}
              onChange={alterar('nomeCompleto')}
              erro={erros.nomeCompleto}
            />

            <CampoTexto
              rotulo="E-mail"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              value={valores.email}
              onChange={alterar('email')}
              erro={erros.email}
            />

            <CampoTexto
              rotulo="Senha"
              name="senha"
              type="password"
              autoComplete="new-password"
              placeholder="mínimo de 6 caracteres"
              value={valores.senha}
              onChange={alterar('senha')}
              erro={erros.senha}
              ajuda="A senha é guardada com hash bcrypt — nem o banco vê o texto."
            />

            <Botao type="submit" tamanho="grande" className="largura-total" disabled={enviando}>
              {enviando ? 'Criando…' : 'Criar conta'}
            </Botao>
          </form>

          <p className="texto-secundario texto-centro" style={{ marginTop: 'var(--e-5)' }}>
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
