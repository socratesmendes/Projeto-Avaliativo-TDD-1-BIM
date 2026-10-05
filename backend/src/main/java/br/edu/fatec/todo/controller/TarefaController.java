package br.edu.fatec.todo.controller;

import br.edu.fatec.todo.dto.AtualizarTarefaRequest;
import br.edu.fatec.todo.dto.CriarTarefaRequest;
import br.edu.fatec.todo.dto.TarefaResponse;
import br.edu.fatec.todo.service.TarefaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/tarefas")
public class TarefaController {

    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @GetMapping
    public List<TarefaResponse> listar() {
        return tarefaService.listar();
    }

    @GetMapping("/{id}")
    public TarefaResponse buscar(@PathVariable Long id) {
        return tarefaService.buscar(id);
    }

    @PostMapping
    public ResponseEntity<TarefaResponse> criar(@Valid @RequestBody CriarTarefaRequest request) {
        TarefaResponse tarefa = tarefaService.criar(request);
        return ResponseEntity.created(URI.create("/api/tarefas/" + tarefa.id())).body(tarefa);
    }

    @PutMapping("/{id}")
    public TarefaResponse atualizar(@PathVariable Long id, @Valid @RequestBody AtualizarTarefaRequest request) {
        return tarefaService.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        tarefaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
