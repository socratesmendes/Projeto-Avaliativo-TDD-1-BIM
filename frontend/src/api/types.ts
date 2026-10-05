export type StatusTarefa = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';

export interface Tarefa {
  id: number;
  nome: string;
  descricao: string | null;
  status: StatusTarefa;
  observacoes: string | null;
  dataCriacao: string; // ISO-8601 UTC; formatar só na exibição
  dataAtualizacao: string;
}

export interface CriarTarefa {
  nome: string;
  descricao?: string | null;
  status?: StatusTarefa;
  observacoes?: string | null;
}

export type AtualizarTarefa = Pick<Tarefa, 'nome' | 'descricao' | 'status' | 'observacoes'>;
