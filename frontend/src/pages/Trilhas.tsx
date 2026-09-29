import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, Cartao, ConfirmarExclusao, EstadoVazio, Selo,
} from '../components/ui';
import { categoriaService, trilhaCursoService, trilhaService } from '../services';
import type { ITrilha } from '../models';
import { resumir } from '../utils/formato';

async function carregar() {
  const [trilhas, categorias, vinculos] = await Promise.all([
    trilhaService.listar(),
    categoriaService.listar(),
    trilhaCursoService.listar(),
  ]);
  return { trilhas, categorias, vinculos };
}

export function Trilhas() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<ITrilha>(
    (trilha) => trilhaService.excluir(trilha.idTrilha),
    recarregar,
  );

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Trilhas"
        descricao="Sequências de cursos que levam a um objetivo."
        acao={
          <>
            <Botao variante="secundario" onClick={() => void recarregar()} disabled={carregando}>
              ↻ Atualizar
            </Botao>
            <Link to="/trilhas/nova"><Botao>Nova trilha</Botao></Link>
          </>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.trilhas.length > 0 ? (
        <div className="grade">
          {dados.trilhas.map((trilha) => {
            const categoria = dados.categorias.find(
              (c) => c.idCategoria === trilha.idCategoria,
            );
            const quantos = dados.vinculos.filter(
              (v) => v.idTrilha === trilha.idTrilha,
            ).length;

            return (
              <Cartao key={trilha.idTrilha} interativo>
                {categoria ? <Selo cor="marca">{categoria.nome}</Selo> : null}
                <Link to={`/trilhas/${trilha.idTrilha}`} style={{ color: 'inherit' }}>
                  <p className="cartao-titulo" style={{ marginTop: 'var(--e-2)' }}>
                    {trilha.titulo}
                  </p>
                </Link>
                <p className="texto-secundario texto-pequeno">
                  {resumir(trilha.descricao, 100) || 'Sem descrição.'}
                </p>
                <p className="texto-terciario" style={{ marginTop: 'var(--e-3)' }}>
                  {quantos} {quantos === 1 ? 'curso' : 'cursos'}
                </p>
                <div className="linha" style={{ marginTop: 'var(--e-4)' }}>
                  <Link to={`/trilhas/${trilha.idTrilha}`}>
                    <Botao variante="secundario" tamanho="pequeno">Ver</Botao>
                  </Link>
                  <Link to={`/trilhas/${trilha.idTrilha}/editar`}>
                    <Botao variante="texto" tamanho="pequeno">Editar</Botao>
                  </Link>
                  <Botao
                    variante="texto"
                    tamanho="pequeno"
                    onClick={() => exclusao.pedirConfirmacao(trilha)}
                  >
                    Excluir
                  </Botao>
                </div>
              </Cartao>
            );
          })}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhuma trilha cadastrada"
          acao={<Link to="/trilhas/nova"><Botao>Nova trilha</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a trilha "${exclusao.alvo?.titulo}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
