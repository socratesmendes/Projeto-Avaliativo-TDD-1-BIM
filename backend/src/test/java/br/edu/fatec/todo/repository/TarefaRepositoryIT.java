package br.edu.fatec.todo.repository;

import br.edu.fatec.todo.model.Tarefa;
import br.edu.fatec.todo.support.TestcontainersConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace.NONE;

@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Import(TestcontainersConfig.class)
class TarefaRepositoryIT {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void listaOrdenadaPorDataCriacaoDescComDesempatePorIdDesc() {
        Instant maisAntiga = Instant.parse("2026-10-01T10:00:00.000000Z");
        Instant maisRecente = Instant.parse("2026-10-02T10:00:00.000000Z");

        Tarefa antiga = entityManager.persistFlushFind(Tarefa.nova("Antiga", null, null, null, maisAntiga));
        Tarefa recenteA = entityManager.persistFlushFind(Tarefa.nova("Recente A", null, null, null, maisRecente));
        Tarefa recenteB = entityManager.persistFlushFind(Tarefa.nova("Recente B", null, null, null, maisRecente));

        List<Tarefa> tarefas = tarefaRepository.findAllByOrderByDataCriacaoDescIdDesc();

        assertThat(tarefas).extracting(Tarefa::getId)
                .containsExactly(recenteB.getId(), recenteA.getId(), antiga.getId());
    }

    @Test
    void insertComStatusInvalidoViolaConstraintDeStatus() {
        assertThatThrownBy(() -> jdbcTemplate.execute(
                "INSERT INTO tarefa (nome, status) VALUES ('Teste', 'FEITO')"))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("ck_tarefa_status");
    }

    @Test
    void insertComNomeEmBrancoViolaConstraintDeNomePreenchido() {
        assertThatThrownBy(() -> jdbcTemplate.execute(
                "INSERT INTO tarefa (nome) VALUES ('   ')"))
                .isInstanceOf(DataAccessException.class)
                .hasMessageContaining("ck_tarefa_nome_preenchido");
    }
}
