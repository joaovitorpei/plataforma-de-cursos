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
import { TIPOS_CONTEUDO, aulaSchema } from '../models';
import type { AulaEntrada, IAula, IModulo } from '../models';
import { aulaService, moduloService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

const VAZIO = {
  idModulo: '',
  titulo: '',
  tipoConteudo: '',
  urlConteudo: '',
  duracaoMinutos: '',
  ordem: '1',
};

export function AulaForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [modulos, setModulos] = useState<IModulo[]>([]);
  const [aulas, setAulas] = useState<IAula[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: AulaEntrada) => {
      if (editando) await aulaService.atualizar(Number(id), dados);
      else await aulaService.criar(dados);
      navegar('/aulas');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(VAZIO, aulaSchema, enviar);
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaModulos, listaAulas] = await Promise.all([
          moduloService.listar(),
          aulaService.listar(),
        ]);
        setModulos(listaModulos);
        setAulas(listaAulas);

        if (editando) {
          const aula = await aulaService.obter(Number(id));
          preencher({
            idModulo: String(aula.idModulo),
            titulo: aula.titulo,
            tipoConteudo: aula.tipoConteudo,
            urlConteudo: aula.urlConteudo ?? '',
            duracaoMinutos:
              aula.duracaoMinutos === null ? '' : String(aula.duracaoMinutos),
            ordem: String(aula.ordem),
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

  /** Ao escolher o módulo, sugere a próxima ordem livre dentro dele. */
  function aoEscolherModulo(evento: React.ChangeEvent<HTMLSelectElement>) {
    const idModulo = evento.target.value;
    const usadas = aulas
      .filter((a) => String(a.idModulo) === idModulo)
      .map((a) => a.ordem);
    const proxima = usadas.length ? Math.max(...usadas) + 1 : 1;

    preencher({ ...form.valores, idModulo, ordem: String(proxima) });
  }

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar aula' : 'Nova aula'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 600 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoSelect
            rotulo="Módulo"
            name="idModulo"
            value={form.valores.idModulo}
            onChange={editando ? form.alterar('idModulo') : aoEscolherModulo}
            erro={form.erros.idModulo}
            opcoes={modulos.map((m) => ({
              valor: m.idModulo,
              texto: m.titulo,
            }))}
          />

          <CampoTexto
            rotulo="Título"
            name="titulo"
            placeholder="Criando o primeiro controller"
            value={form.valores.titulo}
            onChange={form.alterar('titulo')}
            erro={form.erros.titulo}
          />

          <div className="campos-lado-a-lado">
            <CampoSelect
              rotulo="Tipo de conteúdo"
              name="tipoConteudo"
              value={form.valores.tipoConteudo}
              onChange={form.alterar('tipoConteudo')}
              erro={form.erros.tipoConteudo}
              opcoes={TIPOS_CONTEUDO.map((t) => ({ valor: t, texto: t }))}
            />

            <CampoTexto
              rotulo="Duração (minutos)"
              name="duracaoMinutos"
              type="number"
              min="0"
              value={form.valores.duracaoMinutos}
              onChange={form.alterar('duracaoMinutos')}
              erro={form.erros.duracaoMinutos}
            />
          </div>

          <CampoTexto
            rotulo="URL do conteúdo"
            name="urlConteudo"
            placeholder="https://cdn.educursos.com/aulas/1.mp4"
            value={form.valores.urlConteudo}
            onChange={form.alterar('urlConteudo')}
            erro={form.erros.urlConteudo}
          />

          <CampoTexto
            rotulo="Ordem"
            name="ordem"
            type="number"
            min="1"
            value={form.valores.ordem}
            onChange={form.alterar('ordem')}
            erro={form.erros.ordem}
            ajuda="Posição da aula dentro do módulo — sugerida pela próxima livre."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/aulas')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
