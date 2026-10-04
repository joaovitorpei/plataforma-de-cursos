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
import { NIVEIS, cursoSchema } from '../models';
import type { CursoEntrada, ICategoria, IUsuario } from '../models';
import {
  categoriaService,
  cursoService,
  listarUsuariosVisiveis,
} from '../services';
import { useFormulario } from '../hooks';
import { dataParaInput } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

const VAZIO = {
  titulo: '',
  descricao: '',
  idInstrutor: '',
  idCategoria: '',
  nivel: '',
  dataPublicacao: '',
  totalAulas: '',
  totalHoras: '',
};

export function CursoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: CursoEntrada) => {
      if (editando) await cursoService.atualizar(Number(id), dados);
      else await cursoService.criar(dados);
      navegar('/cursos');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(VAZIO, cursoSchema, enviar);
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaCategorias, listaUsuarios] = await Promise.all([
          categoriaService.listar(),
          listarUsuariosVisiveis(),
        ]);
        setCategorias(listaCategorias);
        setUsuarios(listaUsuarios);

        if (editando) {
          const curso = await cursoService.obter(Number(id));
          preencher({
            titulo: curso.titulo,
            descricao: curso.descricao ?? '',
            idInstrutor: String(curso.idInstrutor),
            idCategoria: String(curso.idCategoria),
            nivel: curso.nivel ?? '',
            dataPublicacao: dataParaInput(curso.dataPublicacao),
            totalAulas:
              curso.totalAulas === null ? '' : String(curso.totalAulas),
            totalHoras:
              curso.totalHoras === null ? '' : String(curso.totalHoras),
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
      <CabecalhoPagina titulo={editando ? 'Editar curso' : 'Novo curso'} />

      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 640 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoTexto
            rotulo="Título"
            name="titulo"
            placeholder="NestJS do zero"
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

          <div className="campos-lado-a-lado">
            <CampoSelect
              rotulo="Instrutor"
              name="idInstrutor"
              value={form.valores.idInstrutor}
              onChange={form.alterar('idInstrutor')}
              erro={form.erros.idInstrutor}
              opcoes={usuarios.map((u) => ({
                valor: u.idUsuario,
                texto: u.nomeCompleto,
              }))}
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
          </div>

          <div className="campos-lado-a-lado">
            <CampoSelect
              rotulo="Nível"
              name="nivel"
              value={form.valores.nivel}
              onChange={form.alterar('nivel')}
              erro={form.erros.nivel}
              opcoes={NIVEIS.map((n) => ({ valor: n, texto: n }))}
            />

            <CampoTexto
              rotulo="Data de publicação"
              name="dataPublicacao"
              type="date"
              value={form.valores.dataPublicacao}
              onChange={form.alterar('dataPublicacao')}
              erro={form.erros.dataPublicacao}
            />
          </div>

          <div className="campos-lado-a-lado">
            <CampoTexto
              rotulo="Total de aulas"
              name="totalAulas"
              type="number"
              min="0"
              value={form.valores.totalAulas}
              onChange={form.alterar('totalAulas')}
              erro={form.erros.totalAulas}
            />

            <CampoTexto
              rotulo="Carga horária (horas)"
              name="totalHoras"
              type="number"
              min="0"
              value={form.valores.totalHoras}
              onChange={form.alterar('totalHoras')}
              erro={form.erros.totalHoras}
            />
          </div>

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/cursos')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
