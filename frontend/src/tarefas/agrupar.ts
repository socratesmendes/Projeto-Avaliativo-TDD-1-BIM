import type { Tarefa } from '../api/types';

export interface TarefasAgrupadas {
  abertas: Tarefa[];
  concluidas: Tarefa[];
}

/** Separa abertas e concluídas preservando a ordem recebida (a ordenação é feita pela API). */
export function agrupar(tarefas: Tarefa[]): TarefasAgrupadas {
  const abertas: Tarefa[] = [];
  const concluidas: Tarefa[] = [];

  for (const tarefa of tarefas) {
    (tarefa.status === 'CONCLUIDA' ? concluidas : abertas).push(tarefa);
  }

  return { abertas, concluidas };
}
