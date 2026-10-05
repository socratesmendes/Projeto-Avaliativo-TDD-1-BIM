import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw/http';
import { server } from '../test/server';
import { renderComProvider, screen } from '../test/render';
import App from '../App';

describe('TarefasPage - falha ao carregar', () => {
  it('500 mostra a mensagem de erro, e "Tentar de novo" refaz o GET e mostra a lista', async () => {
    server.use(
      http.get('/api/tarefas', () =>
        HttpResponse.json(
          { type: 'about:blank', title: 'Erro interno', status: 500, detail: 'Erro inesperado.' },
          { status: 500 },
        ),
      ),
    );

    renderComProvider(<App />);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(
      'Não foi possível carregar as tarefas. Confira se a API está rodando e tente de novo.',
    );

    server.use(http.get('/api/tarefas', () => HttpResponse.json([])));

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');
  });

  it('falha de rede também mostra a mensagem de erro', async () => {
    server.use(http.get('/api/tarefas', () => HttpResponse.error()));

    renderComProvider(<App />);

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('Não foi possível carregar as tarefas.');
  });
});
