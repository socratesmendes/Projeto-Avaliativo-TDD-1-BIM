package br.edu.fatec.todo.repository;

import br.edu.fatec.todo.model.Tarefa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {

    List<Tarefa> findAllByOrderByDataCriacaoDescIdDesc();
}
