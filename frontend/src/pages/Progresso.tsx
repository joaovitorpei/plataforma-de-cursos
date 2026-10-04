import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Carregando,
  ConfirmarExclusao,
  EstadoVazio,
  Selo,
  Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import {
  aulaService,
  progressoService,
  listarUsuariosVisiveis,
} from '../services';
import type { IProgressoAula } from '../models';
import { data } from '../utils/formato';

async function carregar() {
  const [progresso, usuarios, aulas] = await Promise.all([
    progressoService.listar(),
    listarUsuariosVisiveis(),
    aulaService.listar(),
  ]);
  return { progresso, usuarios, aulas };
}

export function Progresso() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<IProgressoAula>(
    // Chave composta: a rota leva os dois ids.
    (registro) => progressoService.excluir(registro.idUsuario, registro.idAula),
    recarregar,
  );

  const colunas: Coluna<IProgressoAula>[] = [
    {
      cabecalho: 'Aluno',
      celula: (p) =>
        dados?.usuarios.find((u) => u.idUsuario === p.idUsuario)
          ?.nomeCompleto ?? (
          <span className="texto-terciario">usuário {p.idUsuario}</span>
        ),
    },
    {
      cabecalho: 'Aula',
      celula: (p) =>
        dados?.aulas.find((a) => a.idAula === p.idAula)?.titulo ?? (
          <span className="texto-terciario">aula {p.idAula}</span>
        ),
    },
    {
      cabecalho: 'Chave',
      celula: (p) => (
        <span className="mono texto-terciario">
          {p.idUsuario}/{p.idAula}
        </span>
      ),
    },
    {
      cabecalho: 'Situação',
      celula: (p) => (
        <Selo cor={p.status === 'Concluido' ? 'ok' : 'aviso'}>{p.status}</Selo>
      ),
    },
    { cabecalho: 'Conclusão', celula: (p) => data(p.dataConclusao) },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (p) => (
        <>
          <Link to={`/progresso/${p.idUsuario}/${p.idAula}/editar`}>
            <Botao variante="texto" tamanho="pequeno">
              Editar
            </Botao>
          </Link>
          <Botao
            variante="texto"
            tamanho="pequeno"
            onClick={() => exclusao.pedirConfirmacao(p)}
          >
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Progresso nas aulas"
        descricao="Tabela de chave composta: cada registro é identificado pelo par aluno + aula."
        acao={
          <Link to="/progresso/novo">
            <Botao>Registrar progresso</Botao>
          </Link>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : dados && dados.progresso.length > 0 ? (
        <Tabela
          colunas={colunas}
          dados={dados.progresso}
          chave={(p) => `${p.idUsuario}-${p.idAula}`}
        />
      ) : (
        <EstadoVazio
          titulo="Nenhum progresso registrado"
          descricao="Registre a conclusão de uma aula por um aluno."
          acao={
            <Link to="/progresso/novo">
              <Botao>Registrar progresso</Botao>
            </Link>
          }
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o progresso do aluno ${exclusao.alvo?.idUsuario} na aula ${exclusao.alvo?.idAula}?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
