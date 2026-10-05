import { describe, expect, it } from 'vitest';
import type { Tarefa } from '../api/types';
import { agrupar } from './agrupar';

function tarefa(id: number, status: Tarefa['status']): Tarefa {
  return {
    id,
    nome: `Tarefa ${id}`,
    descricao: null,
    status,
    observacoes: null,
    dataCriacao: '2026-10-03T10:00:00.000000Z',
    dataAtualizacao: '2026-10-03T10:00:00.000000Z',
  };
}

describe('agrupar', () => {
  it('separa abertas e concluídas preservando a ordem da API', () => {
    const tarefas = [
      tarefa(3, 'CONCLUIDA'),
      tarefa(2, 'PENDENTE'),
      tarefa(1, 'EM_ANDAMENTO'),
      tarefa(4, 'CONCLUIDA'),
    ];

    const { abertas, concluidas } = agrupar(tarefas);

    expect(abertas.map((t) => t.id)).toEqual([2, 1]);
    expect(concluidas.map((t) => t.id)).toEqual([3, 4]);
  });
});
