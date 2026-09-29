import { requisitar } from './http';

/**
 * CRUD genérico para os recursos com chave primária simples.
 *
 * Diferente de uma API tipo JSON Server, aqui cada tabela tem o próprio nome de
 * PK (idCurso, idUsuario, idPlano...) e o id é NÚMERO, não texto. Por isso a
 * classe recebe o nome da chave: é ele que diz como ler o id de um registro.
 * A atualização usa PATCH, que é o verbo exposto pelo NestJS.
 */
export class CrudService<T, Entrada> {
  protected readonly recurso: string;
  protected readonly chave: keyof T;

  constructor(recurso: string, chave: keyof T) {
    this.recurso = recurso;
    this.chave = chave;
  }

  listar(): Promise<T[]> {
    return requisitar<T[]>(`/${this.recurso}`);
  }

  obter(id: number): Promise<T> {
    return requisitar<T>(`/${this.recurso}/${id}`);
  }

  criar(dados: Entrada): Promise<T> {
    return requisitar<T>(`/${this.recurso}`, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  atualizar(id: number, dados: Partial<Entrada>): Promise<T> {
    return requisitar<T>(`/${this.recurso}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  }

  async excluir(id: number): Promise<void> {
    await requisitar<void>(`/${this.recurso}/${id}`, { method: 'DELETE' });
  }

  /** Lê o id de um registro sem precisar saber o nome da coluna. */
  id(registro: T): number {
    return registro[this.chave] as number;
  }
}

/**
 * CRUD para os dois recursos de chave composta (Progresso_Aulas e
 * Trilhas_Cursos). Não existe um id único: a rota leva as duas partes da chave,
 * como em /progresso-aulas/:idUsuario/:idAula.
 */
export class CrudCompostoService<T, Entrada> {
  protected readonly recurso: string;
  protected readonly chaveA: keyof T;
  protected readonly chaveB: keyof T;

  constructor(recurso: string, chaveA: keyof T, chaveB: keyof T) {
    this.recurso = recurso;
    this.chaveA = chaveA;
    this.chaveB = chaveB;
  }

  listar(): Promise<T[]> {
    return requisitar<T[]>(`/${this.recurso}`);
  }

  obter(a: number, b: number): Promise<T> {
    return requisitar<T>(`/${this.recurso}/${a}/${b}`);
  }

  criar(dados: Entrada): Promise<T> {
    return requisitar<T>(`/${this.recurso}`, {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  }

  atualizar(a: number, b: number, dados: Partial<Entrada>): Promise<T> {
    return requisitar<T>(`/${this.recurso}/${a}/${b}`, {
      method: 'PATCH',
      body: JSON.stringify(dados),
    });
  }

  async excluir(a: number, b: number): Promise<void> {
    await requisitar<void>(`/${this.recurso}/${a}/${b}`, { method: 'DELETE' });
  }

  /** As duas partes da chave de um registro, na ordem da rota. */
  chaves(registro: T): [number, number] {
    return [registro[this.chaveA] as number, registro[this.chaveB] as number];
  }
}
