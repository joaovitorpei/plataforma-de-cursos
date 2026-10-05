import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoArea,
  CampoSelect,
  Carregando,
  Cartao,
} from '../components/ui';
import { avaliacaoSchema } from '../models';
import type { AvaliacaoEntrada, ICurso, IUsuario } from '../models';
import {
  avaliacaoService,
  cursoService,
  listarAlunos,
} from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

const NOTAS = [
  { valor: 5, texto: '★★★★★ — Excelente' },
  { valor: 4, texto: '★★★★☆ — Muito bom' },
  { valor: 3, texto: '★★★☆☆ — Bom' },
  { valor: 2, texto: '★★☆☆☆ — Regular' },
  { valor: 1, texto: '★☆☆☆☆ — Ruim' },
];

export function AvaliacaoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: AvaliacaoEntrada) => {
      if (editando) await avaliacaoService.atualizar(Number(id), dados);
      else await avaliacaoService.criar(dados);
      navegar('/avaliacoes');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idUsuario: '', idCurso: '', nota: '', comentario: '' },
    avaliacaoSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaUsuarios, listaCursos] = await Promise.all([
          listarAlunos(),
          cursoService.listar(),
        ]);
        setUsuarios(listaUsuarios);
        setCursos(listaCursos);

        if (editando) {
          const avaliacao = await avaliacaoService.obter(Number(id));
          preencher({
            idUsuario: String(avaliacao.idUsuario),
            idCurso: String(avaliacao.idCurso),
            nota: String(avaliacao.nota),
            comentario: avaliacao.comentario ?? '',
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
      <CabecalhoPagina
        titulo={editando ? 'Editar avaliação' : 'Nova avaliação'}
      />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 520 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoSelect
            rotulo="Aluno"
            name="idUsuario"
            value={form.valores.idUsuario}
            onChange={form.alterar('idUsuario')}
            erro={form.erros.idUsuario}
            opcoes={usuarios.map((u) => ({
              valor: u.idUsuario,
              texto: u.nomeCompleto,
            }))}
          />

          <CampoSelect
            rotulo="Curso"
            name="idCurso"
            value={form.valores.idCurso}
            onChange={form.alterar('idCurso')}
            erro={form.erros.idCurso}
            opcoes={cursos.map((c) => ({ valor: c.idCurso, texto: c.titulo }))}
          />

          <CampoSelect
            rotulo="Nota"
            name="nota"
            value={form.valores.nota}
            onChange={form.alterar('nota')}
            erro={form.erros.nota}
            opcoes={NOTAS.map((n) => ({ valor: n.valor, texto: n.texto }))}
          />

          <CampoArea
            rotulo="Comentário"
            name="comentario"
            rows={3}
            value={form.valores.comentario}
            onChange={form.alterar('comentario')}
            erro={form.erros.comentario}
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/avaliacoes')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
