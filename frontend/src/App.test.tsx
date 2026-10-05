import { describe, expect, it } from 'vitest';
import { renderComProvider, screen } from './test/render';
import App from './App';

describe('App', () => {
  it('renderiza o título Tarefas', async () => {
    renderComProvider(<App />);

    expect(screen.getByRole('heading', { name: 'Tarefas' })).toBeInTheDocument();
    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');
  });
});
