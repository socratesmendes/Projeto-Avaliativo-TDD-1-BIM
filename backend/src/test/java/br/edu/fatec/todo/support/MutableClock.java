package br.edu.fatec.todo.support;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;

/**
 * Relógio controlável pelos testes de integração: fixa um instante e deixa o teste
 * avançar o tempo explicitamente, em vez de usar Thread.sleep ou depender de "depois de".
 */
public class MutableClock extends Clock {

    private Instant instante;
    private final ZoneId zona;

    public MutableClock(Instant instanteInicial) {
        this(instanteInicial, ZoneId.of("UTC"));
    }

    public MutableClock(Instant instanteInicial, ZoneId zona) {
        this.instante = instanteInicial;
        this.zona = zona;
    }

    public void adiantar(Instant novoInstante) {
        this.instante = novoInstante;
    }

    @Override
    public ZoneId getZone() {
        return zona;
    }

    @Override
    public Clock withZone(ZoneId zone) {
        return new MutableClock(instante, zone);
    }

    @Override
    public Instant instant() {
        return instante;
    }
}
