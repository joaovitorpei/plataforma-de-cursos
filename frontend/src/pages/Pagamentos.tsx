import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Selo, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { assinaturaService, pagamentoService, usuarioService } from '../services';
import type { IPagamento } from '../models';
import { data, moeda } from '../utils/formato';

async function carregar() {
  const [pagamentos, assinaturas, usuarios] = await Promise.all([
    pagamentoService.listar(),
    assinaturaService.listar(),
    usuarioService.listar(),
  ]);
  return { pagamentos, assinaturas, usuarios };
}

export function Pagamentos() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<IPagamento>(
    (pagamento) => pagamentoService.excluir(pagamento.idPagamento),
    recarregar,
  );

  const total = dados
    ? dados.pagamentos.reduce((soma, p) => soma + Number(p.valorPago), 0)
    : 0;

  const colunas: Coluna<IPagamento>[] = [
    {
      cabecalho: 'Transação',
      celula: (p) => <span className="mono">{p.idTransacaoGateway}</span>,
    },
    {
      cabecalho: 'Assinante',
      celula: (p) => {
        const assinatura = dados?.assinaturas.find(
          (a) => a.idAssinatura === p.idAssinatura,
        );
        const usuario = dados?.usuarios.find(
          (u) => u.idUsuario === assinatura?.idUsuario,
        );
        return usuario?.nomeCompleto ?? (
          <span className="texto-terciario">assinatura {p.idAssinatura}</span>
        );
      },
    },
    { cabecalho: 'Valor', celula: (p) => <strong>{moeda(p.valorPago)}</strong> },
    { cabecalho: 'Método', celula: (p) => <Selo>{p.metodoPagamento}</Selo> },
    { cabecalho: 'Data', celula: (p) => data(p.dataPagamento) },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (p) => (
        <>
          <Link to={`/pagamentos/${p.idPagamento}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(p)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Pagamentos"
        descricao="Os valores recebidos por cada assinatura."
        acao={
          <Link to="/pagamentos/novo"><Botao>Registrar pagamento</Botao></Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.pagamentos.length > 0 ? (
        <>
          <div className="indicador" style={{ maxWidth: 240 }}>
            <div className="indicador-valor">{moeda(total)}</div>
            <div className="indicador-rotulo">Total recebido</div>
          </div>
          <Tabela colunas={colunas} dados={dados.pagamentos} chave={(p) => p.idPagamento} />
        </>
      ) : (
        <EstadoVazio
          titulo="Nenhum pagamento registrado"
          descricao="Crie uma assinatura antes de registrar pagamentos."
          acao={<Link to="/pagamentos/novo"><Botao>Registrar pagamento</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o pagamento ${exclusao.alvo?.idTransacaoGateway}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
