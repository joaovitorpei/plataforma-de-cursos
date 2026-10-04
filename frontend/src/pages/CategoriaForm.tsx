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
import { categoriaSchema } from '../models';
import type { CategoriaEntrada } from '../models';
import { categoriaService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function CategoriaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [carregando, setCarregando] = useState(editando);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: CategoriaEntrada) => {
      if (editando) await categoriaService.atualizar(Number(id), dados);
      else await categoriaService.criar(dados);
      navegar('/categorias');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { nome: '', descricao: '' },
    categoriaSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    if (!editando) return;
    categoriaService
      .obter(Number(id))
      .then((categoria) =>
        preencher({
          nome: categoria.nome,
          descricao: categoria.descricao ?? '',
        }),
      )
      .catch((excecao) => setErroCarga(mensagemDeErro(excecao)))
      .finally(() => setCarregando(false));
  }, [editando, id, preencher]);

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo={editando ? 'Editar categoria' : 'Nova categoria'}
        descricao="O nome é único: não existem duas categorias com o mesmo nome."
      />

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
            placeholder="Programação"
            value={form.valores.nome}
            onChange={form.alterar('nome')}
            erro={form.erros.nome}
          />

          <CampoArea
            rotulo="Descrição"
            name="descricao"
            rows={3}
            placeholder="Cursos de desenvolvimento de software e lógica de programação"
            value={form.valores.descricao}
            onChange={form.alterar('descricao')}
            erro={form.erros.descricao}
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/categorias')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
