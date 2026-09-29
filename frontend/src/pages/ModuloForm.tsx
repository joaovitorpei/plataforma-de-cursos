import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import {
  Alerta, Botao, CabecalhoPagina, CampoSelect, CampoTexto, Carregando, Cartao,
} from '../components/ui';
import { moduloSchema } from '../models';
import type { ICurso, ModuloEntrada } from '../models';
import { cursoService, moduloService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

export function ModuloForm() {
  const { id } = useParams();
  const [parametros] = useSearchParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [cursos, setCursos] = useState<ICurso[]>([]);
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
        setCursos(await cursoService.listar());
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
            onChange={form.alterar('idCurso')}
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
            ajuda="Posição do módulo dentro do curso."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/modulos')}>Cancelar</Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
