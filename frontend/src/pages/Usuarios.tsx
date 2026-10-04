import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Carregando,
  ConfirmarExclusao,
  EstadoVazio,
  Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { usuarioService } from '../services';
import type { IUsuario } from '../models';
import { data, iniciais } from '../utils/formato';
import { useAuth } from '../auth/useAuth';

export function Usuarios() {
  const { usuario: logado } = useAuth();
  const { dados, erro, carregando, recarregar } = useCarregamento(
    useCallback(() => usuarioService.listar(), []),
  );

  const exclusao = useExclusao<IUsuario>(
    (usuario) => usuarioService.excluir(usuario.idUsuario),
    recarregar,
  );

  const colunas: Coluna<IUsuario>[] = [
    {
      cabecalho: 'Usuário',
      celula: (u) => (
        <div className="linha">
          <span className="avatar" aria-hidden="true">
            {iniciais(u.nomeCompleto)}
          </span>
          <div>
            <strong>{u.nomeCompleto}</strong>
            <br />
            <span className="texto-terciario">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      cabecalho: '#',
      celula: (u) => <span className="mono">{u.idUsuario}</span>,
    },
    { cabecalho: 'Cadastro', celula: (u) => data(u.dataCadastro) },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (u) => (
        <>
          <Link to={`/usuarios/${u.idUsuario}/editar`}>
            <Botao variante="texto" tamanho="pequeno">
              Editar
            </Botao>
          </Link>
          <Botao
            variante="texto"
            tamanho="pequeno"
            disabled={u.idUsuario === logado?.idUsuario}
            title={
              u.idUsuario === logado?.idUsuario
                ? 'Você não pode excluir a si mesmo'
                : undefined
            }
            onClick={() => exclusao.pedirConfirmacao(u)}
          >
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Alunos e instrutores. A senha fica guardada com hash e nunca volta da API."
        acao={
          <Link to="/usuarios/novo">
            <Botao>Novo usuário</Botao>
          </Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.length > 0 ? (
        <Tabela colunas={colunas} dados={dados} chave={(u) => u.idUsuario} />
      ) : (
        <EstadoVazio titulo="Nenhum usuário cadastrado" />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o usuário "${exclusao.alvo?.nomeCompleto}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
