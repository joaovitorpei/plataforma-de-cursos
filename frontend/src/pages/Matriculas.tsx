import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Selo, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { cursoService, matriculaService, usuarioService } from '../services';
import type { IMatricula } from '../models';
import { data } from '../utils/formato';

async function carregar() {
  const [matriculas, usuarios, cursos] = await Promise.all([
    matriculaService.listar(),
    usuarioService.listar(),
    cursoService.listar(),
  ]);
  return { matriculas, usuarios, cursos };
}

export function Matriculas() {
  const { dados, erro, carregando, recarregar } = useCarregamento(useCallback(carregar, []));

  const exclusao = useExclusao<IMatricula>(
    (matricula) => matriculaService.excluir(matricula.idMatricula),
    recarregar,
  );

  const colunas: Coluna<IMatricula>[] = [
    { cabecalho: '#', celula: (m) => <span className="mono">{m.idMatricula}</span> },
    {
      cabecalho: 'Aluno',
      celula: (m) =>
        dados?.usuarios.find((u) => u.idUsuario === m.idUsuario)?.nomeCompleto ?? (
          <span className="texto-terciario">usuário {m.idUsuario}</span>
        ),
    },
    {
      cabecalho: 'Curso',
      celula: (m) => {
        const curso = dados?.cursos.find((c) => c.idCurso === m.idCurso);
        return curso ? (
          <Link to={`/cursos/${curso.idCurso}`}>{curso.titulo}</Link>
        ) : (
          <span className="texto-terciario">curso {m.idCurso}</span>
        );
      },
    },
    { cabecalho: 'Matrícula', celula: (m) => data(m.dataMatricula) },
    {
      cabecalho: 'Situação',
      celula: (m) =>
        m.dataConclusao ? (
          <Selo cor="ok">Concluído em {data(m.dataConclusao)}</Selo>
        ) : (
          <Selo cor="aviso">Em andamento</Selo>
        ),
    },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (m) => (
        <>
          <Link to={`/matriculas/${m.idMatricula}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(m)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Matrículas"
        descricao="Quem está inscrito em qual curso. A data de matrícula é preenchida pelo banco."
        acao={
          <>
            <Botao variante="secundario" onClick={() => void recarregar()} disabled={carregando}>
              ↻ Atualizar
            </Botao>
            <Link to="/matriculas/nova"><Botao>Nova matrícula</Botao></Link>
          </>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.matriculas.length > 0 ? (
        <Tabela colunas={colunas} dados={dados.matriculas} chave={(m) => m.idMatricula} />
      ) : (
        <EstadoVazio
          titulo="Nenhuma matrícula registrada"
          acao={<Link to="/matriculas/nova"><Botao>Nova matrícula</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir a matrícula #${exclusao.alvo?.idMatricula}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
