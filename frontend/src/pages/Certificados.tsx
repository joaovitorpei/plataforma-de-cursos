import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { certificadoService, cursoService, usuarioService } from '../services';
import type { ICertificado } from '../models';
import { data } from '../utils/formato';

async function carregar() {
  const [certificados, usuarios, cursos] = await Promise.all([
    certificadoService.listar(),
    usuarioService.listar(),
    cursoService.listar(),
  ]);
  return { certificados, usuarios, cursos };
}

export function Certificados() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<ICertificado>(
    (certificado) => certificadoService.excluir(certificado.idCertificado),
    recarregar,
  );

  const colunas: Coluna<ICertificado>[] = [
    {
      cabecalho: 'Código',
      celula: (c) => (
        <Link to={`/certificados/${c.idCertificado}`} className="mono">
          {c.codigoVerificacao}
        </Link>
      ),
    },
    {
      cabecalho: 'Aluno',
      celula: (c) =>
        dados?.usuarios.find((u) => u.idUsuario === c.idUsuario)?.nomeCompleto ?? (
          <span className="texto-terciario">usuário {c.idUsuario}</span>
        ),
    },
    {
      cabecalho: 'Curso',
      celula: (c) =>
        dados?.cursos.find((curso) => curso.idCurso === c.idCurso)?.titulo ?? (
          <span className="texto-terciario">curso {c.idCurso}</span>
        ),
    },
    { cabecalho: 'Emissão', celula: (c) => data(c.dataEmissao) },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (c) => (
        <>
          <Link to={`/certificados/${c.idCertificado}`}>
            <Botao variante="texto" tamanho="pequeno">Ver</Botao>
          </Link>
          <Link to={`/certificados/${c.idCertificado}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(c)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Certificados"
        descricao="Emitidos na conclusão de um curso ou de uma trilha."
        acao={
          <Link to="/certificados/novo"><Botao>Emitir certificado</Botao></Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.certificados.length > 0 ? (
        <Tabela colunas={colunas} dados={dados.certificados} chave={(c) => c.idCertificado} />
      ) : (
        <EstadoVazio
          titulo="Nenhum certificado emitido"
          acao={<Link to="/certificados/novo"><Botao>Emitir certificado</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o certificado ${exclusao.alvo?.codigoVerificacao}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
