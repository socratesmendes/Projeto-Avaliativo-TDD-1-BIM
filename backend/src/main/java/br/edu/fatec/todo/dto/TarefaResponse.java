package br.edu.fatec.todo.dto;

import br.edu.fatec.todo.model.StatusTarefa;
import br.edu.fatec.todo.model.Tarefa;

import java.time.Instant;

public record TarefaResponse(
        Long id,
        String nome,
        String descricao,
        StatusTarefa status,
        String observacoes,
        Instant dataCriacao,
        Instant dataAtualizacao
) {

    public static TarefaResponse from(Tarefa tarefa) {
        return new TarefaResponse(
                tarefa.getId(),
                tarefa.getNome(),
                tarefa.getDescricao(),
                tarefa.getStatus(),
                tarefa.getObservacoes(),
                tarefa.getDataCriacao(),
                tarefa.getDataAtualizacao());
    }
}
