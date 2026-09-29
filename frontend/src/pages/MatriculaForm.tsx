import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta, Botao, CabecalhoPagina, CampoSelect, CampoTexto, Carregando, Cartao,
} from '../components/ui';
import { matriculaSchema } from '../models';
import type { ICurso, IUsuario, MatriculaEntrada } from '../models';
import { cursoService, matriculaService, usuarioService } from '../services';
import { useFormulario } from '../hooks';
import { dataParaInput } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

export function MatriculaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: MatriculaEntrada) => {
      if (editando) await matriculaService.atualizar(Number(id), dados);
      else await matriculaService.criar(dados);
      navegar('/matriculas');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idUsuario: '', idCurso: '', dataConclusao: '' },
    matriculaSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaUsuarios, listaCursos] = await Promise.all([
          usuarioService.listar(),
          cursoService.listar(),
        ]);
        setUsuarios(listaUsuarios);
        setCursos(listaCursos);

        if (editando) {
          const matricula = await matriculaService.obter(Number(id));
          preencher({
            idUsuario: String(matricula.idUsuario),
            idCurso: String(matricula.idCurso),
            dataConclusao: dataParaInput(matricula.dataConclusao),
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
      <CabecalhoPagina titulo={editando ? 'Editar matrícula' : 'Nova matrícula'} />
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
            opcoes={usuarios.map((u) => ({ valor: u.idUsuario, texto: u.nomeCompleto }))}
          />

          <CampoSelect
            rotulo="Curso"
            name="idCurso"
            value={form.valores.idCurso}
            onChange={form.alterar('idCurso')}
            erro={form.erros.idCurso}
            opcoes={cursos.map((c) => ({ valor: c.idCurso, texto: c.titulo }))}
          />

          <CampoTexto
            rotulo="Data de conclusão"
            name="dataConclusao"
            type="date"
            value={form.valores.dataConclusao}
            onChange={form.alterar('dataConclusao')}
            erro={form.erros.dataConclusao}
            ajuda="Deixe em branco enquanto o aluno não concluir o curso."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/matriculas')}>Cancelar</Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
