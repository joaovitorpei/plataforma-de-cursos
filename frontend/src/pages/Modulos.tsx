import { Link } from 'react-router-dom';

import { useCarregamento, useExclusao } from '../hooks';
import {
  Alerta, Botao, CabecalhoPagina, Carregando, ConfirmarExclusao, EstadoVazio, Tabela,
} from '../components/ui';
import type { Coluna } from '../components/ui';
import { cursoService, moduloService } from '../services';
import type { IModulo } from '../models';

async function carregar() {
  const [modulos, cursos] = await Promise.all([
    moduloService.listar(),
    cursoService.listar(),
  ]);
  return { modulos, cursos };
}

export function Modulos() {
  const { dados, erro, carregando, recarregar } = useCarregamento(carregar);

  const exclusao = useExclusao<IModulo>(
    (modulo) => moduloService.excluir(modulo.idModulo),
    recarregar,
  );

  const colunas: Coluna<IModulo>[] = [
    { cabecalho: '#', celula: (m) => <span className="mono">{m.idModulo}</span> },
    { cabecalho: 'Título', celula: (m) => <strong>{m.titulo}</strong> },
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
    { cabecalho: 'Ordem', celula: (m) => m.ordem },
    {
      cabecalho: 'Ações',
      acoes: true,
      celula: (m) => (
        <>
          <Link to={`/modulos/${m.idModulo}/editar`}>
            <Botao variante="texto" tamanho="pequeno">Editar</Botao>
          </Link>
          <Botao variante="texto" tamanho="pequeno" onClick={() => exclusao.pedirConfirmacao(m)}>
            Excluir
          </Botao>
        </>
      ),
    },
  ];

  const ordenados = dados
    ? [...dados.modulos].sort((a, b) => a.idCurso - b.idCurso || a.ordem - b.ordem)
    : [];

  return (
    <div className="pilha">
      <CabecalhoPagina
        titulo="Módulos"
        descricao="Blocos que organizam as aulas dentro de um curso."
        acao={
          <>
            <Botao variante="secundario" onClick={() => void recarregar()} disabled={carregando}>
              ↻ Atualizar
            </Botao>
            <Link to="/modulos/novo"><Botao>Novo módulo</Botao></Link>
          </>
        }
      />

      {erro ? <Alerta tipo="erro">{erro}</Alerta> : null}
      {exclusao.erro ? <Alerta tipo="erro">{exclusao.erro}</Alerta> : null}

      {carregando && !dados ? (
        <Carregando />
      ) : ordenados.length > 0 ? (
        <Tabela colunas={colunas} dados={ordenados} chave={(m) => m.idModulo} />
      ) : (
        <EstadoVazio
          titulo="Nenhum módulo cadastrado"
          acao={<Link to="/modulos/novo"><Botao>Novo módulo</Botao></Link>}
        />
      )}

      <ConfirmarExclusao
        aberto={exclusao.alvo !== null}
        descricao={`Excluir o módulo "${exclusao.alvo?.titulo}"?`}
        ocupado={exclusao.excluindo}
        aoConfirmar={() => void exclusao.confirmar()}
        aoCancelar={exclusao.cancelar}
      />
    </div>
  );
}
