import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useCarregamento } from '../hooks';
import { Alerta, Botao, Carregando, EstadoVazio } from '../components/ui';
import { certificadoService, cursoService, trilhaService, usuarioService } from '../services';
import { data } from '../utils/formato';

export function CertificadoDetalhe() {
  const { id } = useParams();

  const carregar = useCallback(async () => {
    const certificado = await certificadoService.obter(Number(id));
    const [usuarios, cursos, trilhas] = await Promise.all([
      usuarioService.listar(),
      cursoService.listar(),
      trilhaService.listar(),
    ]);
    return { certificado, usuarios, cursos, trilhas };
  }, [id]);

  const { dados, erro, carregando } = useCarregamento(carregar);

  if (carregando) return <Carregando />;
  if (erro) return <Alerta tipo="erro">{erro}</Alerta>;
  if (!dados?.certificado) return <EstadoVazio titulo="Certificado não encontrado" />;

  const { certificado, usuarios, cursos, trilhas } = dados;
  const aluno = usuarios.find((u) => u.idUsuario === certificado.idUsuario);
  const curso = cursos.find((c) => c.idCurso === certificado.idCurso);
  const trilha = trilhas.find((t) => t.idTrilha === certificado.idTrilha);

  return (
    <div className="pilha-g">
      <div className="linha d-print-none">
        <Link to="/certificados"><Botao variante="secundario">Voltar</Botao></Link>
        <Botao onClick={() => window.print()}>Imprimir</Botao>
      </div>

      <div className="certificado">
        <p className="certificado-selo">EduCursos</p>
        <h1 className="certificado-titulo">Certificado de Conclusão</h1>

        <p className="certificado-texto">Certificamos que</p>
        <p className="certificado-nome">{aluno?.nomeCompleto ?? '—'}</p>

        <p className="certificado-texto">
          concluiu com aproveitamento o curso
          <br />
          <strong>{curso?.titulo ?? '—'}</strong>
          {trilha ? (
            <>
              <br />
              como parte da trilha <strong>{trilha.titulo}</strong>
            </>
          ) : null}
          {curso?.totalHoras ? (
            <>
              <br />
              com carga horária de {curso.totalHoras} horas
            </>
          ) : null}
        </p>

        <div className="certificado-rodape">
          <div>
            <p className="texto-terciario">Emitido em</p>
            <p>{data(certificado.dataEmissao)}</p>
          </div>
          <div>
            <p className="texto-terciario">Código de verificação</p>
            <p className="mono letra-espacada">{certificado.codigoVerificacao}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
