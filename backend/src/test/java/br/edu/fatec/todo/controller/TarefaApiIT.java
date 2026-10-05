package br.edu.fatec.todo.controller;

import br.edu.fatec.todo.support.MutableClock;
import br.edu.fatec.todo.support.TestClockConfig;
import br.edu.fatec.todo.support.TestcontainersConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.hamcrest.Matchers.instanceOf;
import static org.hamcrest.Matchers.nullValue;
import static org.hamcrest.Matchers.oneOf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import({TestcontainersConfig.class, TestClockConfig.class})
class TarefaApiIT {

    private static final Instant INSTANTE_INICIAL = Instant.parse("2026-10-03T12:00:00.123456Z");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MutableClock relogio;

    @BeforeEach
    void limparTabelaERelogio() {
        jdbcTemplate.execute("TRUNCATE TABLE tarefa RESTART IDENTITY");
        relogio.adiantar(INSTANTE_INICIAL);
    }

    @Test
    void postValidoRetorna201ComLocationEOGetSeguinteDevolveOMesmoJson() throws Exception {
        String corpo = """
                {"nome": "Pagar conta de luz", "descricao": "Vence dia 10"}""";

        String resposta = mockMvc.perform(post("/api/tarefas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/tarefas/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nome").value("Pagar conta de luz"))
                .andExpect(jsonPath("$.descricao").value("Vence dia 10"))
                .andExpect(jsonPath("$.status").value("PENDENTE"))
                .andExpect(jsonPath("$.observacoes").value(nullValue()))
                .andExpect(jsonPath("$.dataCriacao").value("2026-10-03T12:00:00.123456Z"))
                .andExpect(jsonPath("$.dataAtualizacao").value("2026-10-03T12:00:00.123456Z"))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/tarefas/1"))
                .andExpect(status().isOk())
                .andExpect(content().json(resposta, true));
    }

    @Test
    void postComNomeAusenteRetorna400ComErroDeCampoNome() throws Exception {
        String corpo = """
                {"descricao": "sem nome"}""";

        mockMvc.perform(post("/api/tarefas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("nome"));
    }

    @Test
    void postComNomeSoComEspacosRetorna400ComErroDeCampoNome() throws Exception {
        String corpo = """
                {"nome": "   "}""";

        mockMvc.perform(post("/api/tarefas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("nome"));
    }

    @Test
    void postComNomeDe121CaracteresRetorna400ComErroDeCampoNome() throws Exception {
        String nomeMuitoLongo = "a".repeat(121);
        String corpo = "{\"nome\": \"" + nomeMuitoLongo + "\"}";

        mockMvc.perform(post("/api/tarefas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erros[0].campo").value("nome"));
    }

    @Test
    void postComStatusDesconhecidoRetorna400() throws Exception {
        String corpo = """
                {"nome": "Tarefa", "status": "FEITO"}""";

        mockMvc.perform(post("/api/tarefas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putExistenteRetorna200PreservaDataCriacaoEAtualizaDataAtualizacao() throws Exception {
        mockMvc.perform(post("/api/tarefas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome": "Pagar conta de luz", "descricao": "Vence dia 10"}"""));

        Instant instanteDaAtualizacao = Instant.parse("2026-10-03T13:30:00.654321Z");
        relogio.adiantar(instanteDaAtualizacao);

        String corpoAtualizacao = """
                {"nome": "Pagar conta de luz", "descricao": "Vence dia 10",
                 "status": "CONCLUIDA", "observacoes": "Pago pelo app"}""";

        mockMvc.perform(put("/api/tarefas/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoAtualizacao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"))
                .andExpect(jsonPath("$.observacoes").value("Pago pelo app"))
                .andExpect(jsonPath("$.dataCriacao").value("2026-10-03T12:00:00.123456Z"))
                .andExpect(jsonPath("$.dataAtualizacao").value("2026-10-03T13:30:00.654321Z"));
    }

    @Test
    void putDeIdInexistenteRetorna404EATabelaContinuaVazia() throws Exception {
        String corpo = """
                {"nome": "Tarefa", "status": "PENDENTE"}""";

        mockMvc.perform(put("/api/tarefas/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.title").value("Tarefa não encontrada"));

        Integer total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM tarefa", Integer.class);
        org.assertj.core.api.Assertions.assertThat(total).isZero();
    }

    @Test
    void deleteExistenteRetorna204EGetSeguinteRetorna404() throws Exception {
        mockMvc.perform(post("/api/tarefas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome": "Tarefa a excluir"}"""));

        mockMvc.perform(delete("/api/tarefas/1"))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tarefas/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteDeIdInexistenteRetorna404() throws Exception {
        mockMvc.perform(delete("/api/tarefas/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getDaListaDevolveOsSeteCamposComOsTiposDoContrato() throws Exception {
        mockMvc.perform(post("/api/tarefas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome": "Tarefa única"}"""));

        mockMvc.perform(get("/api/tarefas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(instanceOf(Number.class)))
                .andExpect(jsonPath("$[0].nome").value(instanceOf(String.class)))
                .andExpect(jsonPath("$[0].descricao").value(nullValue()))
                .andExpect(jsonPath("$[0].status").value(oneOf("PENDENTE", "EM_ANDAMENTO", "CONCLUIDA")))
                .andExpect(jsonPath("$[0].observacoes").value(nullValue()))
                .andExpect(jsonPath("$[0].dataCriacao").value(instanceOf(String.class)))
                .andExpect(jsonPath("$[0].dataAtualizacao").value(instanceOf(String.class)));
    }
}
