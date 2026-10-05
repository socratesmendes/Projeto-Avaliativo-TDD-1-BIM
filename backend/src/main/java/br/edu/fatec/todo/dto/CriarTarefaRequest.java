package br.edu.fatec.todo.dto;

import br.edu.fatec.todo.model.StatusTarefa;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CriarTarefaRequest(
        @NotBlank(message = "Informe o nome da tarefa.")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres.")
        String nome,

        @Size(max = 2000, message = "A descrição pode ter no máximo 2000 caracteres.")
        String descricao,

        StatusTarefa status,

        @Size(max = 2000, message = "As observações podem ter no máximo 2000 caracteres.")
        String observacoes
) {
}
