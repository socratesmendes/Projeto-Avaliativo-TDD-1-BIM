package br.edu.fatec.todo.model;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class TarefaTest {

    private static final Instant AGORA = Instant.parse("2026-10-03T12:00:00.123456Z");
    private static final Instant DEPOIS = Instant.parse("2026-10-03T13:30:00.654321Z");

    @Test
    void novaSemStatusGeraPendenteEDatasIguaisAoInstanteInformado() {
        Tarefa tarefa = Tarefa.nova("Pagar conta de luz", "Vence dia 10", null, null, AGORA);

        assertThat(tarefa.getNome()).isEqualTo("Pagar conta de luz");
        assertThat(tarefa.getDescricao()).isEqualTo("Vence dia 10");
        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.PENDENTE);
        assertThat(tarefa.getObservacoes()).isNull();
        assertThat(tarefa.getDataCriacao()).isEqualTo(AGORA);
        assertThat(tarefa.getDataAtualizacao()).isEqualTo(AGORA);
    }

    @Test
    void atualizarTrocaCamposEditaveisEDataAtualizacaoEPreservaDataCriacao() {
        Tarefa tarefa = Tarefa.nova("Pagar conta de luz", "Vence dia 10", StatusTarefa.PENDENTE, null, AGORA);

        tarefa.atualizar("Pagar conta de luz", "Vence dia 10", StatusTarefa.CONCLUIDA, "Pago pelo app", DEPOIS);

        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.CONCLUIDA);
        assertThat(tarefa.getObservacoes()).isEqualTo("Pago pelo app");
        assertThat(tarefa.getDataAtualizacao()).isEqualTo(DEPOIS);
        assertThat(tarefa.getDataCriacao()).isEqualTo(AGORA);
    }

    @Test
    void atualizarComDescricaoEObservacoesNulasLimpaOsCampos() {
        Tarefa tarefa = Tarefa.nova("Pagar conta de luz", "Vence dia 10", StatusTarefa.PENDENTE, "Observação antiga", AGORA);

        tarefa.atualizar("Pagar conta de luz", null, StatusTarefa.EM_ANDAMENTO, null, DEPOIS);

        assertThat(tarefa.getDescricao()).isNull();
        assertThat(tarefa.getObservacoes()).isNull();
        assertThat(tarefa.getStatus()).isEqualTo(StatusTarefa.EM_ANDAMENTO);
    }
}
