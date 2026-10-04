import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoArea,
  CampoSelect,
  CampoTexto,
  Carregando,
  Cartao,
} from '../components/ui';
import { trilhaSchema } from '../models';
import type { ICategoria, TrilhaEntrada } from '../models';
import { categoriaService, trilhaService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function TrilhaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: TrilhaEntrada) => {
      if (editando) await trilhaService.atualizar(Number(id), dados);
      else await trilhaService.criar(dados);
      navegar('/trilhas');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { titulo: '', descricao: '', idCategoria: '' },
    trilhaSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        setCategorias(await categoriaService.listar());
        if (editando) {
          const trilha = await trilhaService.obter(Number(id));
          preencher({
            titulo: trilha.titulo,
            descricao: trilha.descricao ?? '',
            idCategoria: String(trilha.idCategoria),
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

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar trilha' : 'Nova trilha'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 520 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoTexto
            rotulo="Título"
            name="titulo"
            placeholder="Desenvolvedor Back-end"
            value={form.valores.titulo}
            onChange={form.alterar('titulo')}
            erro={form.erros.titulo}
          />

          <CampoArea
            rotulo="Descrição"
            name="descricao"
            rows={3}
            value={form.valores.descricao}
            onChange={form.alterar('descricao')}
            erro={form.erros.descricao}
          />

          <CampoSelect
            rotulo="Categoria"
            name="idCategoria"
            value={form.valores.idCategoria}
            onChange={form.alterar('idCategoria')}
            erro={form.erros.idCategoria}
            opcoes={categorias.map((c) => ({
              valor: c.idCategoria,
              texto: c.nome,
            }))}
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/trilhas')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
