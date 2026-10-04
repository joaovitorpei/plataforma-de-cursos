import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoTexto,
  Carregando,
  Cartao,
} from '../components/ui';
import { usuarioEdicaoSchema, usuarioSchema } from '../models';
import type { UsuarioEntrada } from '../models';
import { usuarioService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function UsuarioForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: UsuarioEntrada) => {
      if (editando) {
        // Senha em branco na edição significa "manter a atual".
        const { senha, ...resto } = dados;
        await usuarioService.atualizar(Number(id), senha ? dados : resto);
      } else {
        await usuarioService.criar(dados);
      }
      navegar('/usuarios');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { nomeCompleto: '', email: '', senha: '' },
    editando ? usuarioEdicaoSchema : usuarioSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    if (!editando) return;
    usuarioService
      .obter(Number(id))
      .then((usuario) =>
        preencher({
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          senha: '',
        }),
      )
      .catch((excecao) => setErroCarga(mensagemDeErro(excecao)))
      .finally(() => setCarregando(false));
  }, [editando, id, preencher]);

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar usuário' : 'Novo usuário'} />

      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 520 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoTexto
            rotulo="Nome completo"
            name="nomeCompleto"
            value={form.valores.nomeCompleto}
            onChange={form.alterar('nomeCompleto')}
            erro={form.erros.nomeCompleto}
          />

          <CampoTexto
            rotulo="E-mail"
            name="email"
            type="email"
            value={form.valores.email}
            onChange={form.alterar('email')}
            erro={form.erros.email}
            ajuda="Precisa ser único na plataforma."
          />

          <CampoTexto
            rotulo={editando ? 'Nova senha' : 'Senha'}
            name="senha"
            type="password"
            autoComplete="new-password"
            value={form.valores.senha}
            onChange={form.alterar('senha')}
            erro={form.erros.senha}
            ajuda={
              editando
                ? 'Deixe em branco para manter a senha atual.'
                : 'Mínimo de 6 caracteres.'
            }
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/usuarios')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
