import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoSelect,
  Carregando,
  Cartao,
  ConfirmarExclusao,
  EstadoVazio,
  Selo,
} from '../components/ui';
import { categoriaService, cursoService } from '../services';
import type { ICurso } from '../models';
import { data, resumir } from '../utils/formato';

async function carregar() {
  const [cursos, categorias] = await Promise.all([
    cursoService.listar(),
    categoriaService.listar(),
  ]);
  return { cursos, categorias };
}

export function Cursos() {
  const { ehEquipe } = useAuth();
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const exclusao = useExclusao<ICurso>(
    (curso) => cursoService.excluir(curso.idCurso),
    recarregar,
  );

  const nomeCategoria = useCallback(
    (idCategoria: number) =>
      dados?.categorias.find((c) => c.idCategoria === idCategoria)?.nome ?? '—',
    [dados],
  );

  /* A API não tem filtro por query string, então o filtro é feito aqui. */
  const cursosVisiveis = useMemo(() => {
    if (!dados) return [];
    if (!filtroCategoria) return dados.cursos;
    return dados.cursos.filter(
      (c) => String(c.idCategoria) === filtroCategoria,
    );
  }, [dados, filtroCategoria]);

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Cursos"
        descricao="O catálogo da plataforma."
        acao={
          ehEquipe ? (
            <Link to="/cursos/novo">
              <Botao>Novo curso</Botao>
            </Link>
          ) : undefined
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? <Carregando /> : null}

      {dados ? (
        <>
          {dados.categorias.length > 0 ? (
            <div style={{ maxWidth: 280 }}>
              <CampoSelect
                rotulo="Filtrar por categoria"
                name="filtro"
                vazio="Todas as categorias"
                value={filtroCategoria}
                onChange={(evento) => setFiltroCategoria(evento.target.value)}
                opcoes={dados.categorias.map((c) => ({
                  valor: c.idCategoria,
                  texto: c.nome,
                }))}
              />
            </div>
          ) : null}

          {cursosVisiveis.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
              {cursosVisiveis.map((curso) => (
                <div className="col" key={curso.idCurso}>
                  <Cartao interativo className="h-100">
                    <div className="linha mb-2">
                      <Selo cor="marca">
                        {nomeCategoria(curso.idCategoria)}
                      </Selo>
                      {curso.nivel ? <Selo>{curso.nivel}</Selo> : null}
                    </div>

                    <Link
                      to={`/cursos/${curso.idCurso}`}
                      className="text-decoration-none text-body"
                    >
                      <p className="cartao-titulo">{curso.titulo}</p>
                    </Link>

                    <p className="texto-secundario texto-pequeno">
                      {resumir(curso.descricao, 100) || 'Sem descrição.'}
                    </p>

                    <p className="texto-terciario mt-3 mb-0">
                      {curso.instrutor?.nomeCompleto ?? '—'} ·{' '}
                      {curso.totalAulas ?? 0} aulas · {curso.totalHoras ?? 0}h ·{' '}
                      {data(curso.dataPublicacao)}
                    </p>

                    <div className="linha mt-3">
                      <Link to={`/cursos/${curso.idCurso}`}>
                        <Botao variante="secundario" tamanho="pequeno">
                          Ver
                        </Botao>
                      </Link>
                      {ehEquipe ? (
                        <>
                          <Link to={`/cursos/${curso.idCurso}/editar`}>
                            <Botao variante="texto" tamanho="pequeno">
                              Editar
                            </Botao>
                          </Link>
                          <Botao
                            variante="texto"
                            tamanho="pequeno"
                            onClick={() => exclusao.pedirConfirmacao(curso)}
                          >
                            Excluir
                          </Botao>
                        </>
                      ) : null}
                    </div>
                  </Cartao>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVazio
              titulo={
                filtroCategoria
                  ? 'Nenhum curso nesta categoria'
                  : 'Nenhum curso cadastrado'
              }
              descricao={
                filtroCategoria
                  ? 'Tente outra categoria ou limpe o filtro.'
                  : 'Cadastre o primeiro curso do catálogo.'
              }
              acao={
                ehEquipe ? (
                  <Link to="/cursos/novo">
                    <Botao>Novo curso</Botao>
                  </Link>
                ) : undefined
              }
            />
          )}
        </>
      ) : null}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o curso "${exclusao.alvo?.titulo}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
