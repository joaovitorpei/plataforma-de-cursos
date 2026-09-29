import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Selo, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { aulaService, moduloService } from '../services';
import type { IAula } from '../models';
import { duracao } from '../utils/formato';

async function carregar() {
  const [aulas, modulos] = await Promise.all([
    aulaService.listar(),
    moduloService.listar(),
  ]);
  return { aulas, modulos };
}

export function Aulas() {
  const { dados, erro, carregando, recarregar } = useCarregamento(useCallback(carregar, []));

  const exclusao = useExclusao<IAula>(
    (aula) => aulaService.excluir(aula.idAula),
    recarregar,
  );

  const colunas: Coluna<IAula>[] = [
    { cabecalho: '#', celula: (a) => <span className="mono">{a.idAula}</span> },
    { cabecalho: 'Título', celula: (a) => <strong>{a.titulo}</strong> },
    {
      cabecalho: 'Módulo',
      celula: (a) => {
        const modulo = dados?.modulos.find((m) => m.idModulo === a.idModulo);
        return modulo?.titulo ?? <span className="texto-terciario">módulo {a.idModulo}</span>;
      },
    },
    { cabecalho: 'Tipo', celula: (a) => <Selo>{a.tipoConteudo}</Selo> },
    { cabecalho: 'Duração', celula: (a) => duracao(a.duracaoMinutos) },
    { cabecalho: 'Ordem', celula: (a) => a.ordem },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (a) => (
        <>
          <Link to={`/aulas/${a.idAula}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(a)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  const ordenadas = dados
    ? [...dados.aulas].sort((a, b) => a.idModulo - b.idModulo || a.ordem - b.ordem)
    : [];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Aulas"
        descricao="O conteúdo que o aluno assiste, dentro de cada módulo."
        acao={
          <>
            <Botao variante="secundario" onClick={() => void recarregar()} disabled={carregando}>
              ↻ Atualizar
            </Botao>
            <Link to="/aulas/nova"><Botao>Nova aula</Botao></Link>
          </>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : ordenadas.length > 0 ? (
        <Tabela colunas={colunas} dados={ordenadas} chave={(a) => a.idAula} />
      ) : (
        <EstadoVazio
          titulo="Nenhuma aula cadastrada"
          descricao="Crie um módulo antes de cadastrar aulas."
          acao={<Link to="/aulas/nova"><Botao>Nova aula</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a aula "${exclusao.alvo?.titulo}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
