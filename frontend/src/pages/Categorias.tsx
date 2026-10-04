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
import { categoriaService } from '../services';
import type { ICategoria } from '../models';

export function Categorias() {
  const { dados, erro, carregando, recarregar } = useCarregamento(
    useCallback(() => categoriaService.listar(), []),
  );

  const exclusao = useExclusao<ICategoria>(
    (categoria) => categoriaService.excluir(categoria.idCategoria),
    recarregar,
  );

  const colunas: Coluna<ICategoria>[] = [
    {
      cabecalho: '#',
      celula: (c) => <span className="mono">{c.idCategoria}</span>,
    },
    { cabecalho: 'Nome', celula: (c) => <strong>{c.nome}</strong> },
    {
      cabecalho: 'Descrição',
      celula: (c) => (
        <span className="texto-secundario">{c.descricao || '—'}</span>
      ),
    },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (c) => (
        <>
          <Link to={`/categorias/${c.idCategoria}/editar`}>
            <Botao variante="texto" tamanho="pequeno">
              Editar
            </Botao>
          </Link>
          <Botao
            variante="texto"
            tamanho="pequeno"
            onClick={() => exclusao.pedirConfirmacao(c)}
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
        titulo="Categorias"
        descricao="Agrupam os cursos e as trilhas da plataforma."
        acao={
          <Link to="/categorias/nova">
            <Botao>Nova categoria</Botao>
          </Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.length > 0 ? (
        <Tabela colunas={colunas} dados={dados} chave={(c) => c.idCategoria} />
      ) : (
        <EstadoVazio
          titulo="Nenhuma categoria cadastrada"
          descricao="Crie a primeira categoria para começar a organizar os cursos."
          acao={
            <Link to="/categorias/nova">
              <Botao>Nova categoria</Botao>
            </Link>
          }
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a categoria "${exclusao.alvo?.nome}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
