import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderComProvider, screen } from '../test/render';
import { requisicoesRegistradas } from '../test/handlers';
import App from '../App';

describe('Excluir', () => {
  it('"Excluir" e depois confirmar envia DELETE e remove o item', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);
    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    await user.type(screen.getByLabelText('Nova tarefa'), 'Tarefa a excluir');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await screen.findByText('Tarefa a excluir');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await screen.findByText('Excluir esta tarefa?');
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');
    expect(screen.queryByText('Tarefa a excluir')).not.toBeInTheDocument();
    expect(requisicoesRegistradas()).toContainEqual({ metodo: 'DELETE', url: '/api/tarefas/1' });
  });

  it('"Manter" não gera requisição e o item continua na lista', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);
    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    await user.type(screen.getByLabelText('Nova tarefa'), 'Tarefa a manter');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await screen.findByText('Tarefa a manter');

    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    await screen.findByText('Excluir esta tarefa?');
    await user.click(screen.getByRole('button', { name: 'Manter' }));

    expect(screen.getByText('Tarefa a manter')).toBeInTheDocument();
    expect(requisicoesRegistradas().some((r) => r.metodo === 'DELETE')).toBe(false);
  });
});
