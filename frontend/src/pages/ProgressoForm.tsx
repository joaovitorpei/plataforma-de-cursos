import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoSelect,
  CampoTexto,
  Carregando,
  Cartao,
} from '../components/ui';
import { STATUS_PROGRESSO, progressoSchema } from '../models';
import type { IAula, IUsuario, ProgressoEntrada } from '../models';
import {
  aulaService,
  progressoService,
  listarUsuariosVisiveis,
} from '../services';
import { useFormulario } from '../hooks';
import { dataParaInput, hoje } from '../utils/formato';
import { mensagemDeErro } from '../utils/erro';

/**
 * Esta tabela tem chave primária composta (idUsuario + idAula). Na edição os
 * dois campos ficam travados: mudar a chave seria criar outro registro.
 */
export function ProgressoForm() {
  const { idUsuario, idAula } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(idUsuario && idAula);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [aulas, setAulas] = useState<IAula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: ProgressoEntrada) => {
      if (editando) {
        const { idUsuario: _u, idAula: _a, ...alteraveis } = dados;
        await progressoService.atualizar(
          Number(idUsuario),
          Number(idAula),
          alteraveis,
        );
      } else {
        await progressoService.criar(dados);
      }
      navegar('/progresso');
    },
    [editando, idUsuario, idAula, navegar],
  );

  const form = useFormulario(
    { idUsuario: '', idAula: '', dataConclusao: hoje(), status: 'Concluido' },
    progressoSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaUsuarios, listaAulas] = await Promise.all([
          listarUsuariosVisiveis(),
          aulaService.listar(),
        ]);
        setUsuarios(listaUsuarios);
        setAulas(listaAulas);

        if (editando) {
          const registro = await progressoService.obter(
            Number(idUsuario),
            Number(idAula),
          );
          preencher({
            idUsuario: String(registro.idUsuario),
            idAula: String(registro.idAula),
            dataConclusao: dataParaInput(registro.dataConclusao),
            status: registro.status,
          });
        }
      } catch (excecao) {
        setErroCarga(mensagemDeErro(excecao));
      } finally {
        setCarregando(false);
      }
    }
    void iniciar();
  }, [editando, idUsuario, idAula, preencher]);

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo={editando ? 'Editar progresso' : 'Registrar progresso'}
        descricao={
          editando
            ? 'O aluno e a aula formam a chave do registro e não podem ser trocados.'
            : undefined
        }
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
            disabled={editando}
            value={form.valores.idUsuario}
            onChange={form.alterar('idUsuario')}
            erro={form.erros.idUsuario}
            opcoes={usuarios.map((u) => ({
              valor: u.idUsuario,
              texto: u.nomeCompleto,
            }))}
          />

          <CampoSelect
            rotulo="Aula"
            name="idAula"
            disabled={editando}
            value={form.valores.idAula}
            onChange={form.alterar('idAula')}
            erro={form.erros.idAula}
            opcoes={aulas.map((a) => ({ valor: a.idAula, texto: a.titulo }))}
          />

          <div className="campos-lado-a-lado">
            <CampoTexto
              rotulo="Data de conclusão"
              name="dataConclusao"
              type="date"
              value={form.valores.dataConclusao}
              onChange={form.alterar('dataConclusao')}
              erro={form.erros.dataConclusao}
            />

            <CampoSelect
              rotulo="Situação"
              name="status"
              value={form.valores.status}
              onChange={form.alterar('status')}
              erro={form.erros.status}
              opcoes={STATUS_PROGRESSO.map((s) => ({ valor: s, texto: s }))}
            />
          </div>

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/progresso')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
