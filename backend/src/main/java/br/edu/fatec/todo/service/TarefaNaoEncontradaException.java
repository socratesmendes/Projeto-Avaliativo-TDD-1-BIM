package br.edu.fatec.todo.service;

public class TarefaNaoEncontradaException extends RuntimeException {

    public TarefaNaoEncontradaException(Long id) {
        super("Não existe tarefa com id " + id + ".");
    }
}
