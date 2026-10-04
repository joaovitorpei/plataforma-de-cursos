import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoArea,
  CampoTexto,
  Carregando,
  Cartao,
} from '../components/ui';
import { planoSchema } from '../models';
import type { PlanoEntrada } from '../models';
import { planoService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function PlanoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: PlanoEntrada) => {
      if (editando) await planoService.atualizar(Number(id), dados);
      else await planoService.criar(dados);
      navegar('/planos');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { nome: '', descricao: '', preco: '', duracaoMeses: '' },
    planoSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    if (!editando) return;
    planoService
      .obter(Number(id))
      .then((plano) =>
        preencher({
          nome: plano.nome,
          descricao: plano.descricao ?? '',
          // O preço vem como texto ("299.9"): o Prisma serializa Decimal assim.
          preco: String(plano.preco),
          duracaoMeses: String(plano.duracaoMeses),
        }),
      )
      .catch((excecao) => setErroCarga(mensagemDeErro(excecao)))
      .finally(() => setCarregando(false));
  }, [editando, id, preencher]);

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar plano' : 'Novo plano'} />

      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 520 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoTexto
            rotulo="Nome"
            name="nome"
            placeholder="Plano Anual"
            value={form.valores.nome}
            onChange={form.alterar('nome')}
            erro={form.erros.nome}
          />

          <CampoArea
            rotulo="Descrição"
            name="descricao"
            rows={2}
            value={form.valores.descricao}
            onChange={form.alterar('descricao')}
            erro={form.erros.descricao}
          />

          <div className="campos-lado-a-lado">
            <CampoTexto
              rotulo="Preço (R$)"
              name="preco"
              type="number"
              step="0.01"
              min="0"
              placeholder="299.90"
              value={form.valores.preco}
              onChange={form.alterar('preco')}
              erro={form.erros.preco}
              ajuda="Até duas casas decimais."
            />

            <CampoTexto
              rotulo="Duração (meses)"
              name="duracaoMeses"
              type="number"
              min="1"
              placeholder="12"
              value={form.valores.duracaoMeses}
              onChange={form.alterar('duracaoMeses')}
              erro={form.erros.duracaoMeses}
            />
          </div>

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/planos')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
