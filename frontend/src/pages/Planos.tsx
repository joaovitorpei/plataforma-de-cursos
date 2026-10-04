import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Carregando,
  Cartao,
  ConfirmarExclusao,
  EstadoVazio,
} from '../components/ui';
import { planoService } from '../services';
import type { IPlano } from '../models';
import { moeda } from '../utils/formato';

export function Planos() {
  const { dados, erro, carregando, recarregar } = useCarregamento(
    useCallback(() => planoService.listar(), []),
  );

  const exclusao = useExclusao<IPlano>(
    (plano) => planoService.excluir(plano.idPlano),
    recarregar,
  );

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Planos"
        descricao="Assinaturas de acesso à plataforma."
        acao={
          <Link to="/planos/novo">
            <Botao>Novo plano</Botao>
          </Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {dados.map((plano) => (
            <div className="col" key={plano.idPlano}>
              <Cartao className="h-100">
                <p className="cartao-titulo">{plano.nome}</p>
                <p className="titulo fs-2 fw-semibold mb-0">
                  {moeda(plano.preco)}
                </p>
                <p className="texto-terciario">
                  por {plano.duracaoMeses}{' '}
                  {plano.duracaoMeses === 1 ? 'mês' : 'meses'}
                </p>
                <p className="texto-secundario texto-pequeno mt-3">
                  {plano.descricao || 'Sem descrição.'}
                </p>
                <div className="linha mt-3">
                  <Link to={`/planos/${plano.idPlano}/editar`}>
                    <Botao variante="secundario" tamanho="pequeno">
                      Editar
                    </Botao>
                  </Link>
                  <Botao
                    variante="texto"
                    tamanho="pequeno"
                    onClick={() => exclusao.pedirConfirmacao(plano)}
                  >
                    Excluir
                  </Botao>
                </div>
              </Cartao>
            </div>
          ))}
        </div>
      ) : (
        <EstadoVazio
          titulo="Nenhum plano cadastrado"
          acao={
            <Link to="/planos/novo">
              <Botao>Novo plano</Botao>
            </Link>
          }
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o plano "${exclusao.alvo?.nome}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
