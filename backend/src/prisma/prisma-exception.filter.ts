import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';
import {
  referenciaNaoExiste,
  rotuloDaColuna,
  rotuloDaTabela,
} from '../comum/rotulos';

/**
 * Traduz os erros conhecidos do Prisma em respostas HTTP legíveis, em português.
 * Sem isso qualquer violação de constraint vira um 500 genérico — e o nome cru
 * da constraint do PostgreSQL ("Modulos_ID_Curso_fkey") vazaria para a tela.
 */
/**
 * O `meta` do erro do Prisma não é tipado — o formato muda conforme o driver.
 * Em vez de espalhar `any` pelo arquivo, descrevemos aqui o pouco que usamos.
 */
interface MetaDoErro {
  target?: string | string[];
  field_name?: string;
  driverAdapterError?: {
    cause?: {
      table?: string;
      constraint?: {
        index?: string;
        fields?: string[];
        foreignKey?: string;
      };
    };
  };
}

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    switch (exception.code) {
      // Violação de UNIQUE: já existe um registro com esse valor.
      case 'P2002': {
        const campo = this.campoDuplicado(exception);
        return response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: 'Conflict',
          message: campo
            ? `Já existe um registro cadastrado com este ${campo}`
            : 'Já existe um registro com estes dados',
        });
      }

      // Registro não encontrado (update ou delete de um id inexistente).
      case 'P2025':
        return response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Not Found',
          message: 'Registro não encontrado',
        });

      // Chave estrangeira. O mesmo código cobre dois casos opostos, e só dá
      // para diferenciar pelo verbo HTTP:
      //   DELETE  -> existem registros dependendo deste
      //   POST/PATCH -> o registro apontado não existe
      case 'P2003': {
        const ehExclusao = request?.method === 'DELETE';
        const { dependentes, coluna } = this.origemDaChave(exception);

        return response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
          // "que dependem" evita ter de concordar o gênero do plural.
          message: ehExclusao
            ? dependentes
              ? `Não é possível excluir: existem ${dependentes} que dependem deste registro`
              : 'Não é possível excluir: existem outros registros que dependem deste'
            : referenciaNaoExiste(coluna),
        });
      }

      // O banco não respondeu: container parado, porta errada, rede caída.
      // Não é culpa de quem fez a requisição, por isso 503 e não 500.
      case 'P1001':
      case 'P1002':
        this.logger.error(`Banco inacessível (${exception.code})`);
        return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Service Unavailable',
          message:
            'Não foi possível conectar ao banco de dados. ' +
            'Verifique se ele está no ar (docker compose up -d).',
        });

      default:
        // Códigos não tratados continuam como 500, mas ficam registrados no log.
        this.logger.error(
          `Erro Prisma não tratado: ${exception.code}`,
          exception.stack,
        );
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
          message: 'Erro ao acessar o banco de dados',
        });
    }
  }

  /**
   * O campo duplicado chega em dois formatos: `meta.target` no Prisma sem
   * driver adapter, e o erro cru do PostgreSQL quando o adapter está em uso.
   * Devolve já com o nome em português ("e-mail", não "Email").
   */
  private campoDuplicado(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const meta = (exception.meta ?? {}) as MetaDoErro;

    if (Array.isArray(meta.target)) {
      return meta.target.map((coluna) => rotuloDaColuna(coluna)).join(' e ');
    }
    if (typeof meta.target === 'string') return rotuloDaColuna(meta.target);

    const causa = meta.driverAdapterError?.cause;
    const tabela = causa?.table;
    const indice =
      causa?.constraint?.index ?? causa?.constraint?.fields?.join(', ');
    if (!indice) return '';

    // O Prisma nomeia o índice como "<Tabela>_<Campo>_key".
    let campo = indice;
    if (tabela && campo.startsWith(`${tabela}_`)) {
      campo = campo.slice(tabela.length + 1);
    }
    return rotuloDaColuna(campo.replace(/_key$/, ''));
  }

  /**
   * A constraint de chave estrangeira se chama "<Tabela>_<Coluna>_fkey".
   * A tabela diz quem depende ("módulos"); a coluna diz o que faltou ("curso").
   */
  private origemDaChave(exception: Prisma.PrismaClientKnownRequestError): {
    dependentes: string;
    coluna: string;
  } {
    const meta = (exception.meta ?? {}) as MetaDoErro;
    const constraint = meta.driverAdapterError?.cause?.constraint;

    const bruto =
      meta.field_name ?? constraint?.foreignKey ?? constraint?.index ?? '';

    if (!bruto) return { dependentes: '', coluna: '' };

    // A coluna da FK sempre começa com "ID_", e o nome da tabela pode ter
    // underscore ("Progresso_Aulas"). Por isso o primeiro grupo é guloso: ele
    // engole tudo até o último "_ID_algo_fkey".
    //   Progresso_Aulas_ID_Aula_fkey -> tabela "Progresso_Aulas", coluna "ID_Aula"
    const partes = /^(.+)_(ID_[A-Za-z]+)_fkey$/.exec(bruto);
    // Sem o formato esperado, devolvemos o que veio e a frase cai no genérico.
    if (!partes) return { dependentes: '', coluna: bruto };

    const [, tabela, coluna] = partes;
    return { dependentes: rotuloDaTabela(tabela), coluna };
  }
}
