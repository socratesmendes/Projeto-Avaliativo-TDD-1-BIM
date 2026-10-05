import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw/http';
import { server } from '../test/server';
import { ApiError, request } from './http';

describe('request', () => {
  it('converte um 400 Problem Details em ApiError.campos', async () => {
    server.use(
      http.post('/api/tarefas', () =>
        HttpResponse.json(
          {
            type: 'about:blank',
            title: 'Dados inválidos',
            status: 400,
            detail: 'Um ou mais campos são inválidos.',
            instance: '/api/tarefas',
            erros: [{ campo: 'nome', mensagem: 'Informe o nome da tarefa.' }],
          },
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    );

    await expect(request('/tarefas', { method: 'POST', body: {} })).rejects.toSatisfy((erro: unknown) => {
      expect(erro).toBeInstanceOf(ApiError);
      expect((erro as ApiError).status).toBe(400);
      expect((erro as ApiError).campos).toEqual({ nome: 'Informe o nome da tarefa.' });
      return true;
    });
  });

  it('204 não tenta ler o corpo da resposta', async () => {
    server.use(http.delete('/api/tarefas/:id', () => new HttpResponse(null, { status: 204 })));

    const resultado = await request('/tarefas/1', { method: 'DELETE' });

    expect(resultado).toBeUndefined();
  });

  it('falha de rede vira ApiError com status 0', async () => {
    server.use(http.get('/api/tarefas', () => HttpResponse.error()));

    await expect(request('/tarefas')).rejects.toSatisfy((erro: unknown) => {
      expect(erro).toBeInstanceOf(ApiError);
      expect((erro as ApiError).status).toBe(0);
      return true;
    });
  });
});
