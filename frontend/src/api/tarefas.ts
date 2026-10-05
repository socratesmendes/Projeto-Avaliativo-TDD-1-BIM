import { request } from './http';
import type { AtualizarTarefa, CriarTarefa, Tarefa } from './types';

export function listar(): Promise<Tarefa[]> {
  return request<Tarefa[]>('/tarefas');
}

export function buscar(id: number): Promise<Tarefa> {
  return request<Tarefa>(`/tarefas/${id}`);
}

export function criar(dados: CriarTarefa): Promise<Tarefa> {
  return request<Tarefa>('/tarefas', { method: 'POST', body: dados });
}

export function atualizar(id: number, dados: AtualizarTarefa): Promise<Tarefa> {
  return request<Tarefa>(`/tarefas/${id}`, { method: 'PUT', body: dados });
}

export function excluir(id: number): Promise<void> {
  return request<void>(`/tarefas/${id}`, { method: 'DELETE' });
}
