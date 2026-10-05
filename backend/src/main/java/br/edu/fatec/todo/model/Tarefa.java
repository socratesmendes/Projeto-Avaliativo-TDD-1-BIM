package br.edu.fatec.todo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "tarefa")
public class Tarefa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "descricao", length = 2000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StatusTarefa status;

    @Column(name = "observacoes", length = 2000)
    private String observacoes;

    @Column(name = "data_criacao", nullable = false)
    private Instant dataCriacao;

    @Column(name = "data_atualizacao", nullable = false)
    private Instant dataAtualizacao;

    protected Tarefa() {
        // exigência do JPA
    }

    private Tarefa(String nome, String descricao, StatusTarefa status, String observacoes, Instant agora) {
        this.nome = nome;
        this.descricao = descricao;
        this.status = status != null ? status : StatusTarefa.PENDENTE;
        this.observacoes = observacoes;
        this.dataCriacao = agora;
        this.dataAtualizacao = agora;
    }

    public static Tarefa nova(String nome, String descricao, StatusTarefa status, String observacoes, Instant agora) {
        return new Tarefa(nome, descricao, status, observacoes, agora);
    }

    public void atualizar(String nome, String descricao, StatusTarefa status, String observacoes, Instant agora) {
        this.nome = nome;
        this.descricao = descricao;
        this.status = status;
        this.observacoes = observacoes;
        this.dataAtualizacao = agora;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public StatusTarefa getStatus() {
        return status;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public Instant getDataCriacao() {
        return dataCriacao;
    }

    public Instant getDataAtualizacao() {
        return dataAtualizacao;
    }
}
