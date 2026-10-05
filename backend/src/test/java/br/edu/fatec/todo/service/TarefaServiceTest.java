package br.edu.fatec.todo.service;

import br.edu.fatec.todo.dto.CriarTarefaRequest;
import br.edu.fatec.todo.dto.AtualizarTarefaRequest;
import br.edu.fatec.todo.model.StatusTarefa;
import br.edu.fatec.todo.model.Tarefa;
import br.edu.fatec.todo.repository.TarefaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TarefaServiceTest {

    @Mock
    private TarefaRepository tarefaRepository;

    @Test
    void atualizarDeIdInexistenteLancaExcecaoENaoGravaNada() {
        Clock relogio = Clock.fixed(Instant.parse("2026-10-03T12:00:00Z"), ZoneOffset.UTC);
        TarefaService service = new TarefaService(tarefaRepository, relogio);
        when(tarefaRepository.findById(99L)).thenReturn(Optional.empty());

        AtualizarTarefaRequest request = new AtualizarTarefaRequest("Nome", null, StatusTarefa.CONCLUIDA, null);

        assertThatThrownBy(() -> service.atualizar(99L, request))
                .isInstanceOf(TarefaNaoEncontradaException.class);

        verify(tarefaRepository, never()).save(any());
    }

    @Test
    void excluirDeIdInexistenteLancaExcecaoENaoChamaDeleteById() {
        Clock relogio = Clock.fixed(Instant.parse("2026-10-03T12:00:00Z"), ZoneOffset.UTC);
        TarefaService service = new TarefaService(tarefaRepository, relogio);
        when(tarefaRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.excluir(99L))
                .isInstanceOf(TarefaNaoEncontradaException.class);

        verify(tarefaRepository, never()).deleteById(any());
    }

    @Test
    void criarUsaOInstanteDoClockTruncadoEmMicrossegundos() {
        Instant instanteComNanossegundos = Instant.parse("2026-10-03T12:00:00.123456789Z");
        Instant instanteTruncado = Instant.parse("2026-10-03T12:00:00.123456Z");
        Clock relogio = Clock.fixed(instanteComNanossegundos, ZoneOffset.UTC);
        TarefaService service = new TarefaService(tarefaRepository, relogio);
        when(tarefaRepository.save(any(Tarefa.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        CriarTarefaRequest request = new CriarTarefaRequest("Pagar conta de luz", null, null, null);
        service.criar(request);

        ArgumentCaptor<Tarefa> captor = ArgumentCaptor.forClass(Tarefa.class);
        verify(tarefaRepository).save(captor.capture());
        assertThat(captor.getValue().getDataCriacao()).isEqualTo(instanteTruncado);
        assertThat(captor.getValue().getDataAtualizacao()).isEqualTo(instanteTruncado);
    }
}
