import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Selo, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { assinaturaService, planoService, usuarioService } from '../services';
import type { IAssinatura } from '../models';
import { data, moeda } from '../utils/formato';

async function carregar() {
  const [assinaturas, usuarios, planos] = await Promise.all([
    assinaturaService.listar(),
    usuarioService.listar(),
    planoService.listar(),
  ]);
  return { assinaturas, usuarios, planos };
}

/** Uma assinatura está vigente se hoje está entre o início e o fim. */
function vigente(assinatura: IAssinatura): boolean {
  const hoje = new Date().toISOString().slice(0, 10);
  return assinatura.dataInicio.slice(0, 10) <= hoje && hoje <= assinatura.dataFim.slice(0, 10);
}

export function Assinaturas() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<IAssinatura>(
    (assinatura) => assinaturaService.excluir(assinatura.idAssinatura),
    recarregar,
  );

  const colunas: Coluna<IAssinatura>[] = [
    { cabecalho: '#', celula: (a) => <span className="mono">{a.idAssinatura}</span> },
    {
      cabecalho: 'Assinante',
      celula: (a) =>
        dados?.usuarios.find((u) => u.idUsuario === a.idUsuario)?.nomeCompleto ?? (
          <span className="texto-terciario">usuário {a.idUsuario}</span>
        ),
    },
    {
      cabecalho: 'Plano',
      celula: (a) => {
        const plano = dados?.planos.find((p) => p.idPlano === a.idPlano);
        return plano ? (
          <>
            {plano.nome}{' '}
            <span className="texto-terciario">({moeda(plano.preco)})</span>
          </>
        ) : (
          <span className="texto-terciario">plano {a.idPlano}</span>
        );
      },
    },
    { cabecalho: 'Início', celula: (a) => data(a.dataInicio) },
    { cabecalho: 'Fim', celula: (a) => data(a.dataFim) },
    {
      cabecalho: 'Situação',
      celula: (a) =>
        vigente(a) ? <Selo cor="ok">Vigente</Selo> : <Selo cor="erro">Expirada</Selo>,
    },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (a) => (
        <>
          <Link to={`/assinaturas/${a.idAssinatura}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(a)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Assinaturas"
        descricao="Quem contratou qual plano e por quanto tempo."
        acao={
          <Link to="/assinaturas/nova"><Botao>Nova assinatura</Botao></Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.assinaturas.length > 0 ? (
        <Tabela colunas={colunas} dados={dados.assinaturas} chave={(a) => a.idAssinatura} />
      ) : (
        <EstadoVazio
          titulo="Nenhuma assinatura registrada"
          descricao="Cadastre um plano antes de criar assinaturas."
          acao={<Link to="/assinaturas/nova"><Botao>Nova assinatura</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a assinatura #${exclusao.alvo?.idAssinatura}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
