-- Schema do To-Do. Executar conectado ao banco "todo".
-- Fonte única: usado pelo Docker (init do Postgres), pelos testes (Testcontainers) e na execução manual.
CREATE TABLE IF NOT EXISTS tarefa (
    id               BIGINT GENERATED ALWAYS AS IDENTITY,
    nome             VARCHAR(120)  NOT NULL,
    descricao        VARCHAR(2000),
    status           VARCHAR(20)   NOT NULL DEFAULT 'PENDENTE',
    observacoes      VARCHAR(2000),
    data_criacao     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    data_atualizacao TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT pk_tarefa PRIMARY KEY (id),
    CONSTRAINT ck_tarefa_nome_preenchido CHECK (btrim(nome) <> ''),
    CONSTRAINT ck_tarefa_status CHECK (status IN ('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'))
);
