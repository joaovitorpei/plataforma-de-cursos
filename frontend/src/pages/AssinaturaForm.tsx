import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta, Botao, CabecalhoPagina, CampoSelect, CampoTexto, Carregando, Cartao,
} from '../components/ui';
import { assinaturaSchema } from '../models';
import type { AssinaturaEntrada, IPlano, IUsuario } from '../models';
import { assinaturaService, planoService, usuarioService } from '../services';
import { useFormulario } from '../hooks';
import { dataParaInput, hoje, moeda } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

export function AssinaturaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [planos, setPlanos] = useState<IPlano[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: AssinaturaEntrada) => {
      if (editando) await assinaturaService.atualizar(Number(id), dados);
      else await assinaturaService.criar(dados);
      navegar('/assinaturas');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idUsuario: '', idPlano: '', dataInicio: hoje(), dataFim: '' },
    assinaturaSchema,
    enviar,
  );
  const { preencher, valores, alterar } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaUsuarios, listaPlanos] = await Promise.all([
          usuarioService.listar(),
          planoService.listar(),
        ]);
        setUsuarios(listaUsuarios);
        setPlanos(listaPlanos);

        if (editando) {
          const assinatura = await assinaturaService.obter(Number(id));
          preencher({
            idUsuario: String(assinatura.idUsuario),
            idPlano: String(assinatura.idPlano),
            dataInicio: dataParaInput(assinatura.dataInicio),
            dataFim: dataParaInput(assinatura.dataFim),
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

  /** Ao escolher o plano, já sugere a data de fim pela duração dele. */
  function aoEscolherPlano(evento: React.ChangeEvent<HTMLSelectElement>) {
    alterar('idPlano')(evento);

    const plano = planos.find((p) => String(p.idPlano) === evento.target.value);
    if (!plano || !valores.dataInicio) return;

    const fim = new Date(`${valores.dataInicio}T00:00:00`);
    fim.setMonth(fim.getMonth() + plano.duracaoMeses);
    preencher({
      ...valores,
      idPlano: evento.target.value,
      dataFim: fim.toISOString().slice(0, 10),
    });
  }

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar assinatura' : 'Nova assinatura'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 560 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoSelect
            rotulo="Assinante"
            name="idUsuario"
            value={form.valores.idUsuario}
            onChange={form.alterar('idUsuario')}
            erro={form.erros.idUsuario}
            opcoes={usuarios.map((u) => ({ valor: u.idUsuario, texto: u.nomeCompleto }))}
          />

          <CampoSelect
            rotulo="Plano"
            name="idPlano"
            value={form.valores.idPlano}
            onChange={aoEscolherPlano}
            erro={form.erros.idPlano}
            opcoes={planos.map((p) => ({
              valor: p.idPlano,
              texto: `${p.nome} — ${moeda(p.preco)} / ${p.duracaoMeses} meses`,
            }))}
            ajuda="A data de fim é sugerida pela duração do plano."
          />

          <div className="campos-lado-a-lado">
            <CampoTexto
              rotulo="Início"
              name="dataInicio"
              type="date"
              value={form.valores.dataInicio}
              onChange={form.alterar('dataInicio')}
              erro={form.erros.dataInicio}
            />

            <CampoTexto
              rotulo="Fim"
              name="dataFim"
              type="date"
              value={form.valores.dataFim}
              onChange={form.alterar('dataFim')}
              erro={form.erros.dataFim}
            />
          </div>

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/assinaturas')}>Cancelar</Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
