import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoSelect,
  CampoTexto,
  Carregando,
  Cartao,
  ConfirmarExclusao,
  EstadoVazio,
  Selo,
  Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import {
  categoriaService,
  cursoService,
  trilhaCursoService,
  trilhaService,
} from '../services';
import type { ITrilhaCurso } from '../models';
import { mensagemDeErro } from '../utils/erro';

/**
 * Detalhe da trilha com a gestão dos cursos que a compõem. Trilhas_Cursos é a
 * segunda tabela de chave composta: cada vínculo é identificado pelo par
 * trilha + curso, e a rota da API leva os dois ids.
 */
export function TrilhaDetalhe() {
  const { id } = useParams();
  const idTrilha = Number(id);

  const carregar = useCallback(async () => {
    const [trilha, cursos, vinculos, categorias] = await Promise.all([
      trilhaService.obter(idTrilha),
      cursoService.listar(),
      trilhaCursoService.listar(),
      categoriaService.listar(),
    ]);
    return {
      trilha,
      cursos,
      categorias,
      vinculos: vinculos
        .filter((v) => v.idTrilha === idTrilha)
        .sort((a, b) => a.ordem - b.ordem),
    };
  }, [idTrilha]);

  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const [idCursoNovo, setIdCursoNovo] = useState('');
  const [ordemNova, setOrdemNova] = useState('1');
  const [erroVinculo, setErroVinculo] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const exclusao = useExclusao<ITrilhaCurso>(
    (vinculo) => trilhaCursoService.excluir(vinculo.idTrilha, vinculo.idCurso),
    recarregar,
  );

  async function adicionarCurso(evento: React.FormEvent) {
    evento.preventDefault();
    setErroVinculo(null);
    setSalvando(true);
    try {
      await trilhaCursoService.criar({
        idTrilha,
        idCurso: Number(idCursoNovo),
        ordem: Number(ordemNova),
      });
      setIdCursoNovo('');
      setOrdemNova('1');
      await recarregar();
    } catch (excecao) {
      setErroVinculo(mensagemDeErro(excecao));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!dados?.trilha) return <EstadoVazio titulo="Trilha não encontrada" />;

  const { trilha, cursos, vinculos, categorias } = dados;
  const categoria = categorias.find(
    (c) => c.idCategoria === trilha.idCategoria,
  );

  // Só oferece cursos que ainda não estão na trilha.
  const jaNaTrilha = new Set(vinculos.map((v) => v.idCurso));
  const disponiveis = cursos.filter((c) => !jaNaTrilha.has(c.idCurso));

  const colunas: Coluna<ITrilhaCurso>[] = [
    {
      cabecalho: 'Ordem',
      celula: (v) => <span className="mono">{v.ordem}</span>,
    },
    {
      cabecalho: 'Curso',
      celula: (v) => {
        const curso = cursos.find((c) => c.idCurso === v.idCurso);
        return curso ? (
          <Link to={`/cursos/${curso.idCurso}`}>{curso.titulo}</Link>
        ) : (
          <span className="texto-terciario">curso {v.idCurso}</span>
        );
      },
    },
    {
      cabecalho: 'Chave',
      celula: (v) => (
        <span className="mono texto-terciario">
          {v.idTrilha}/{v.idCurso}
        </span>
      ),
    },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (v) => (
        <Botao
          variante="texto"
          tamanho="pequeno"
          onClick={() => exclusao.pedirConfirmacao(v)}
        >
          Remover
        </Botao>
      ),
    },
  ];

  return (
    <div className="pilha-g">
      <CabecalhoPagina
        titulo={trilha.titulo}
        descricao={trilha.descricao ?? undefined}
        acao={
          <>
            <Link to="/trilhas">
              <Botao variante="secundario">Voltar</Botao>
            </Link>
            <Link to={`/trilhas/${trilha.idTrilha}/editar`}>
              <Botao>Editar</Botao>
            </Link>
          </>
        }
      />

      {categoria ? <Selo cor="marca">{categoria.nome}</Selo> : null}

      <section>
        <h2 style={{ marginBottom: 'var(--e-4)' }}>Cursos da trilha</h2>

        {vinculos.length > 0 ? (
          <Tabela
            colunas={colunas}
            dados={vinculos}
            chave={(v) => `${v.idTrilha}-${v.idCurso}`}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum curso nesta trilha"
            descricao="Adicione cursos abaixo para montar a sequência."
          />
        )}
      </section>

      <section>
        <Cartao>
          <h3 style={{ marginBottom: 'var(--e-4)' }}>Adicionar curso</h3>

          {erroVinculo ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{erroVinculo}</Alerta>
            </div>
          ) : null}

          {disponiveis.length === 0 ? (
            <p className="texto-secundario">
              Todos os cursos cadastrados já estão nesta trilha.
            </p>
          ) : (
            <form onSubmit={adicionarCurso} style={{ maxWidth: 520 }}>
              <div className="campos-lado-a-lado">
                <CampoSelect
                  rotulo="Curso"
                  name="idCurso"
                  value={idCursoNovo}
                  onChange={(evento) => setIdCursoNovo(evento.target.value)}
                  opcoes={disponiveis.map((c) => ({
                    valor: c.idCurso,
                    texto: c.titulo,
                  }))}
                  required
                />

                <CampoTexto
                  rotulo="Ordem"
                  name="ordem"
                  type="number"
                  min="1"
                  value={ordemNova}
                  onChange={(evento) => setOrdemNova(evento.target.value)}
                  required
                />
              </div>

              <Botao type="submit" disabled={salvando || !idCursoNovo}>
                {salvando ? 'Adicionando…' : 'Adicionar à trilha'}
              </Botao>
            </form>
          )}
        </Cartao>
      </section>

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao="Remover este curso da trilha?"
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
