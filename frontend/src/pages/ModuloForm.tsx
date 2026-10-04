import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  Alerta,
  Botao,
  CabecalhoPagina,
  CampoSelect,
  CampoTexto,
  Carregando,
  Cartao,
} from '../components/ui';
import { moduloSchema } from '../models';
import type { ICurso, IModulo, ModuloEntrada } from '../models';
import { cursoService, moduloService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function ModuloForm() {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [modulos, setModulos] = useState<IModulo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: ModuloEntrada) => {
      if (editando) await moduloService.atualizar(Number(id), dados);
      else await moduloService.criar(dados);
      navegar('/modulos');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idCurso: parametros.get('curso') ?? '', titulo: '', ordem: '1' },
    moduloSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaCursos, listaModulos] = await Promise.all([
          cursoService.listar(),
          moduloService.listar(),
        ]);
        setCursos(listaCursos);
        setModulos(listaModulos);

        if (editando) {
          const modulo = await moduloService.obter(Number(id));
          preencher({
            idCurso: String(modulo.idCurso),
            titulo: modulo.titulo,
            ordem: String(modulo.ordem),
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

  /**
   * Ao escolher o curso, sugere a próxima ordem livre. Sem isso todo módulo
   * novo nasceria com ordem 1 e a listagem do curso sairia embaralhada.
   */
  function aoEscolherCurso(evento: React.ChangeEvent<HTMLSelectElement>) {
    const idCurso = evento.target.value;
    const usadas = modulos
      .filter((m) => String(m.idCurso) === idCurso)
      .map((m) => m.ordem);
    const proxima = usadas.length ? Math.max(...usadas) + 1 : 1;

    preencher({ ...form.valores, idCurso, ordem: String(proxima) });
  }

  if (carregando) return <Carregando />;

  return (
    <div className="pilha">
      <CabecalhoPagina titulo={editando ? 'Editar módulo' : 'Novo módulo'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 520 }}>
          {form.erroGeral ? (
            <div style={{ marginBottom: 'var(--e-4)' }}>
              <Alerta tipo="erro">{form.erroGeral}</Alerta>
            </div>
          ) : null}

          <CampoSelect
            rotulo="Curso"
            name="idCurso"
            value={form.valores.idCurso}
            onChange={editando ? form.alterar('idCurso') : aoEscolherCurso}
            erro={form.erros.idCurso}
            opcoes={cursos.map((c) => ({ valor: c.idCurso, texto: c.titulo }))}
          />

          <CampoTexto
            rotulo="Título"
            name="titulo"
            placeholder="Introdução ao NestJS"
            value={form.valores.titulo}
            onChange={form.alterar('titulo')}
            erro={form.erros.titulo}
          />

          <CampoTexto
            rotulo="Ordem"
            name="ordem"
            type="number"
            min="1"
            value={form.valores.ordem}
            onChange={form.alterar('ordem')}
            erro={form.erros.ordem}
            ajuda="Posição do módulo dentro do curso — sugerida pela próxima livre."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/modulos')}>
              Cancelar
            </Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
