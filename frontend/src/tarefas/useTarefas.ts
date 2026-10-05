import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { atualizar, criar, excluir, listar } from '../api/tarefas';
import type { AtualizarTarefa, CriarTarefa } from '../api/types';

const CHAVE_TAREFAS = ['tarefas'];

export function useTarefas() {
  return useQuery({ queryKey: CHAVE_TAREFAS, queryFn: listar });
}

export function useCriarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dados: CriarTarefa) => criar(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_TAREFAS }),
  });
}

export function useAtualizarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: AtualizarTarefa }) => atualizar(id, dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_TAREFAS }),
  });
}

export function useExcluirTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluir(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE_TAREFAS }),
  });
}
