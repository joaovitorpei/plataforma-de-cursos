import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Carregando,
  ConfirmarExclusao,
  EstadoVazio,
  Estrelas,
  Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import {
  avaliacaoService,
  cursoService,
  listarUsuariosVisiveis,
} from '../services';
import type { IAvaliacao } from '../models';
import { data, resumir } from '../utils/formato';

async function carregar() {
  const [avaliacoes, usuarios, cursos] = await Promise.all([
    avaliacaoService.listar(),
    listarUsuariosVisiveis(),
    cursoService.listar(),
  ]);
  return { avaliacoes, usuarios, cursos };
}

export function Avaliacoes() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<IAvaliacao>(
    (avaliacao) => avaliacaoService.excluir(avaliacao.idAvaliacao),
    recarregar,
  );

  const colunas: Coluna<IAvaliacao>[] = [
    { cabecalho: 'Nota', celula: (a) => <Estrelas nota={a.nota} /> },
    {
      cabecalho: 'Curso',
      celula: (a) => {
        const curso = dados?.cursos.find((c) => c.idCurso === a.idCurso);
        return curso ? (
          <Link to={`/cursos/${curso.idCurso}`}>{curso.titulo}</Link>
        ) : (
          <span className="texto-terciario">curso {a.idCurso}</span>
        );
      },
    },
    {
      cabecalho: 'Aluno',
      celula: (a) =>
        dados?.usuarios.find((u) => u.idUsuario === a.idUsuario)
          ?.nomeCompleto ?? (
          <span className="texto-terciario">usuário {a.idUsuario}</span>
        ),
    },
    {
      cabecalho: 'Comentário',
      celula: (a) => (
        <span className="texto-secundario">
          {resumir(a.comentario, 60) || '—'}
        </span>
      ),
    },
    { cabecalho: 'Data', celula: (a) => data(a.dataAvaliacao) },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (a) => (
        <>
          <Link to={`/avaliacoes/${a.idAvaliacao}/editar`}>
            <Botao variante="texto" tamanho="pequeno">
              Editar
            </Botao>
          </Link>
          <Botao
            variante="texto"
            tamanho="pequeno"
            onClick={() => exclusao.pedirConfirmacao(a)}
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
        titulo="Avaliações"
        descricao="Notas de 1 a 5 dadas pelos alunos aos cursos."
        acao={
          <Link to="/avaliacoes/nova">
            <Botao>Nova avaliação</Botao>
          </Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.avaliacoes.length > 0 ? (
        <Tabela
          colunas={colunas}
          dados={dados.avaliacoes}
          chave={(a) => a.idAvaliacao}
        />
      ) : (
        <EstadoVazio
          titulo="Nenhuma avaliação registrada"
          acao={
            <Link to="/avaliacoes/nova">
              <Botao>Nova avaliação</Botao>
            </Link>
          }
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a avaliação #${exclusao.alvo?.idAvaliacao}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
