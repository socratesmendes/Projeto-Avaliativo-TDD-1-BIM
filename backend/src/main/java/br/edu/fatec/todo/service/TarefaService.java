package br.edu.fatec.todo.service;

import br.edu.fatec.todo.dto.AtualizarTarefaRequest;
import br.edu.fatec.todo.dto.CriarTarefaRequest;
import br.edu.fatec.todo.dto.TarefaResponse;
import br.edu.fatec.todo.model.Tarefa;
import br.edu.fatec.todo.repository.TarefaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class TarefaService {

    private final TarefaRepository tarefaRepository;
    private final Clock clock;

    public TarefaService(TarefaRepository tarefaRepository, Clock clock) {
        this.tarefaRepository = tarefaRepository;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<TarefaResponse> listar() {
        return tarefaRepository.findAllByOrderByDataCriacaoDescIdDesc().stream()
                .map(TarefaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TarefaResponse buscar(Long id) {
        return TarefaResponse.from(buscarEntidade(id));
    }

    @Transactional
    public TarefaResponse criar(CriarTarefaRequest request) {
        Tarefa tarefa = Tarefa.nova(
                request.nome(), request.descricao(), request.status(), request.observacoes(), agora());
        return TarefaResponse.from(tarefaRepository.save(tarefa));
    }

    @Transactional
    public TarefaResponse atualizar(Long id, AtualizarTarefaRequest request) {
        Tarefa tarefa = buscarEntidade(id);
        tarefa.atualizar(request.nome(), request.descricao(), request.status(), request.observacoes(), agora());
        return TarefaResponse.from(tarefa);
    }

    @Transactional
    public void excluir(Long id) {
        if (!tarefaRepository.existsById(id)) {
            throw new TarefaNaoEncontradaException(id);
        }
        tarefaRepository.deleteById(id);
    }

    private Tarefa buscarEntidade(Long id) {
        return tarefaRepository.findById(id).orElseThrow(() -> new TarefaNaoEncontradaException(id));
    }

    private Instant agora() {
        return Instant.now(clock).truncatedTo(ChronoUnit.MICROS);
    }
}
