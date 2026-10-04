import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { Alerta, Botao, CampoTexto } from '../components/ui';
import { usuarioSchema } from '../models';
import type { Perfil } from '../models';
import { mensagemDeErro } from '../utils/erro';

/** As duas portas de entrada da plataforma. */
const TIPOS: {
  valor: Perfil;
  titulo: string;
  descricao: string;
  icone: string;
}[] = [
  {
    valor: 'USER',
    titulo: 'Sou aluno',
    descricao:
      'Quero estudar: ver o catálogo, me matricular e acompanhar meu progresso.',
    icone: 'bi-mortarboard',
  },
  {
    valor: 'ADMIN',
    titulo: 'Sou professor',
    descricao:
      'Quero ensinar: criar cursos, módulos e aulas, e gerenciar a plataforma.',
    icone: 'bi-easel',
  },
];

export function Cadastrar() {
  const { cadastrar, autenticado, carregando } = useAuth();
  const navegar = useNavigate();

  const [perfil, setPerfil] = useState<Perfil>('USER');
  const [valores, setValores] = useState({
    nomeCompleto: '',
    email: '',
    senha: '',
  });
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

    const resultado = usuarioSchema.safeParse({ ...valores, perfil });
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
      await cadastrar(
        valores.nomeCompleto,
        valores.email,
        valores.senha,
        perfil,
      );
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
          Uma conta para quem estuda e outra para quem ensina. Escolha a sua ao
          lado — dá para ter as duas, com e-mails diferentes.
        </p>
      </aside>

      <main className="acesso-formulario">
        <div className="acesso-caixa">
          <h1 className="h3">Criar conta</h1>
          <p className="text-body-secondary mb-4">Leva menos de um minuto.</p>

          <form onSubmit={aoEnviar} noValidate>
            {erroGeral ? (
              <div className="mb-3">
                <Alerta tipo="erro">{erroGeral}</Alerta>
              </div>
            ) : null}

            {/* Escolha do tipo de conta: é ela que define o que a pessoa poderá fazer */}
            <fieldset className="mb-3">
              <legend className="form-label">Tipo de conta</legend>

              <div className="vstack gap-2">
                {TIPOS.map((tipo) => (
                  <label
                    key={tipo.valor}
                    className={`card p-3 mb-0 ${
                      perfil === tipo.valor
                        ? 'border-primary bg-primary-subtle'
                        : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <input
                        type="radio"
                        name="perfil"
                        className="form-check-input mt-1 flex-shrink-0"
                        checked={perfil === tipo.valor}
                        onChange={() => setPerfil(tipo.valor)}
                      />
                      <div>
                        <span className="fw-semibold d-block">
                          <i
                            className={`bi ${tipo.icone} me-1`}
                            aria-hidden="true"
                          />
                          {tipo.titulo}
                        </span>
                        <span className="small text-body-secondary">
                          {tipo.descricao}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

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

            <Botao
              type="submit"
              tamanho="grande"
              className="w-100"
              disabled={enviando}
            >
              {enviando ? 'Criando…' : 'Criar conta'}
            </Botao>
          </form>

          <p className="text-body-secondary text-center mt-4">
            Já tem conta? <Link to="/entrar">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
