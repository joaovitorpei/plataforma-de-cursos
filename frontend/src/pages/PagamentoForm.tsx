import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta, Botao, CabecalhoPagina, CampoSelect, CampoTexto, Carregando, Cartao,
} from '../components/ui';
import { METODOS_PAGAMENTO, pagamentoSchema } from '../models';
import type { IAssinatura, IPlano, IUsuario, PagamentoEntrada } from '../models';
import { assinaturaService, pagamentoService, planoService, usuarioService } from '../services';
import { useFormulario } from '../hooks';
import { moeda } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

export function PagamentoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [assinaturas, setAssinaturas] = useState<IAssinatura[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: PagamentoEntrada) => {
      if (editando) await pagamentoService.atualizar(Number(id), dados);
      else await pagamentoService.criar(dados);
      navegar('/pagamentos');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idAssinatura: '', valorPago: '', metodoPagamento: '', idTransacaoGateway: '' },
    pagamentoSchema,
    enviar,
  );
  const { preencher, valores, alterar } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaAssinaturas, listaUsuarios, listaPlanos] = await Promise.all([
          assinaturaService.listar(),
          usuarioService.listar(),
          planoService.listar(),
        ]);
        setAssinaturas(listaAssinaturas);
        setUsuarios(listaUsuarios);
        setPlanos(listaPlanos);

        if (editando) {
          const pagamento = await pagamentoService.obter(Number(id));
          preencher({
            idAssinatura: String(pagamento.idAssinatura),
            valorPago: String(pagamento.valorPago),
            metodoPagamento: pagamento.metodoPagamento,
            idTransacaoGateway: pagamento.idTransacaoGateway,
          });
        }
      } catch (excecao) {
        setErroCarga(mensagemDeErro(excecao));
      } finally {
        setCarregando(false);
      }
    }
    void iniciar();
  }, [editando, id, preencher]);

  /** Ao escolher a assinatura, sugere o valor do plano correspondente. */
  function aoEscolherAssinatura(evento: React.ChangeEvent<HTMLSelectElement>) {
    alterar('idAssinatura')(evento);

    const assinatura = assinaturas.find(
      (a) => String(a.idAssinatura) === evento.target.value,
    );
    const plano = planos.find((p) => p.idPlano === assinatura?.idPlano);
    if (!plano) return;

    preencher({
      ...valores,
      idAssinatura: evento.target.value,
      valorPago: String(plano.preco),
    });
  }

  function descrever(assinatura: IAssinatura): string {
    const usuario = usuarios.find((u) => u.idUsuario === assinatura.idUsuario);
    const plano = planos.find((p) => p.idPlano === assinatura.idPlano);
    return `#${assinatura.idAssinatura} — ${usuario?.nomeCompleto ?? 'usuário'} · ${plano?.nome ?? 'plano'}`;
  }

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar pagamento' : 'Registrar pagamento'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 560 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoSelect
            rotulo="Assinatura"
            name="idAssinatura"
            value={form.valores.idAssinatura}
            onChange={aoEscolherAssinatura}
            erro={form.erros.idAssinatura}
            opcoes={assinaturas.map((a) => ({ valor: a.idAssinatura, texto: descrever(a) }))}
          />

          <div className="campos-lado-a-lado">
            <CampoTexto
              rotulo="Valor pago (R$)"
              name="valorPago"
              type="number"
              step="0.01"
              min="0"
              value={form.valores.valorPago}
              onChange={form.alterar('valorPago')}
              erro={form.erros.valorPago}
              ajuda={
                form.valores.valorPago
                  ? `Equivale a ${moeda(form.valores.valorPago)}`
                  : 'Até duas casas decimais.'
              }
            />

            <CampoSelect
              rotulo="Método"
              name="metodoPagamento"
              value={form.valores.metodoPagamento}
              onChange={form.alterar('metodoPagamento')}
              erro={form.erros.metodoPagamento}
              opcoes={METODOS_PAGAMENTO.map((m) => ({ valor: m, texto: m }))}
            />
          </div>

          <CampoTexto
            rotulo="Código da transação"
            name="idTransacaoGateway"
            placeholder="TX-2026-000123"
            value={form.valores.idTransacaoGateway}
            onChange={form.alterar('idTransacaoGateway')}
            erro={form.erros.idTransacaoGateway}
            ajuda="Identificador devolvido pelo gateway de pagamento."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/pagamentos')}>Cancelar</Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
