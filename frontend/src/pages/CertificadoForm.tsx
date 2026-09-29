import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alerta, Botao, CabecalhoPagina, CampoSelect, CampoTexto, Carregando, Cartao,
} from '../components/ui';
import { certificadoSchema } from '../models';
import type { CertificadoEntrada, ICurso, ITrilha, IUsuario } from '../models';
import { certificadoService, cursoService, trilhaService, usuarioService } from '../services';
import { useFormulario } from '../hooks';
import { mensagemDeErro } from '../utils/erro';

/** Sugere um código no formato CERT-<ano>-<aleatório>. */
function sugerirCodigo(): string {
  const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CERT-${new Date().getFullYear()}-${aleatorio}`;
}

export function CertificadoForm() {
  const { id } = useParams();
  const navegar = useNavigate();
  const editando = Boolean(id);

  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [trilhas, setTrilhas] = useState<ITrilha[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState<string | null>(null);

  const enviar = useCallback(
    async (dados: CertificadoEntrada) => {
      // idTrilha é opcional: se não escolheram, não mandamos o campo.
      const corpo = dados.idTrilha ? dados : { ...dados, idTrilha: undefined };
      if (editando) await certificadoService.atualizar(Number(id), corpo);
      else await certificadoService.criar(corpo);
      navegar('/certificados');
    },
    [editando, id, navegar],
  );

  const form = useFormulario(
    { idUsuario: '', idCurso: '', idTrilha: '', codigoVerificacao: sugerirCodigo() },
    certificadoSchema,
    enviar,
  );
  const { preencher } = form;

  useEffect(() => {
    async function iniciar() {
      try {
        const [listaUsuarios, listaCursos, listaTrilhas] = await Promise.all([
          usuarioService.listar(),
          cursoService.listar(),
          trilhaService.listar(),
        ]);
        setUsuarios(listaUsuarios);
        setCursos(listaCursos);
        setTrilhas(listaTrilhas);

        if (editando) {
          const certificado = await certificadoService.obter(Number(id));
          preencher({
            idUsuario: String(certificado.idUsuario),
            idCurso: String(certificado.idCurso),
            idTrilha: certificado.idTrilha === null ? '' : String(certificado.idTrilha),
            codigoVerificacao: certificado.codigoVerificacao,
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
      <CabecalhoPagina titulo={editando ? 'Editar certificado' : 'Emitir certificado'} />
      {erroCarga ? <Alerta tipo="erro">{erroCarga}</Alerta> : null}

      <Cartao>
        <form onSubmit={form.submeter} noValidate style={{ maxWidth: 560 }}>
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

          <CampoSelect
            rotulo="Trilha (opcional)"
            name="idTrilha"
            vazio="Certificado apenas do curso"
            value={form.valores.idTrilha}
            onChange={form.alterar('idTrilha')}
            erro={form.erros.idTrilha}
            opcoes={trilhas.map((t) => ({ valor: t.idTrilha, texto: t.titulo }))}
            ajuda="Preencha quando o certificado for de uma trilha inteira."
          />

          <CampoTexto
            rotulo="Código de verificação"
            name="codigoVerificacao"
            value={form.valores.codigoVerificacao}
            onChange={form.alterar('codigoVerificacao')}
            erro={form.erros.codigoVerificacao}
            ajuda="Precisa ser único — é ele que valida o certificado."
          />

          <div className="linha">
            <Botao type="submit" disabled={form.enviando}>
              {form.enviando ? 'Salvando…' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => navegar('/certificados')}>Cancelar</Botao>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
