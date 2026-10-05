import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderComProvider, screen } from '../test/render';
import App from '../App';

describe('Criar tarefa', () => {
  it('nome + Enter cria a tarefa, limpa o campo, mantém o foco, e Enter duplo gera um único POST', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);

    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    const campoNome = screen.getByLabelText('Nova tarefa');
    await user.type(campoNome, 'Pagar conta de luz');
    await user.keyboard('{Enter}{Enter}');

    await screen.findByText('Pagar conta de luz');

    expect(campoNome).toHaveValue('');
    expect(campoNome).toHaveFocus();
    expect(screen.getAllByText('Pagar conta de luz')).toHaveLength(1);
  });

  it('400 com erro de nome mostra a mensagem junto ao campo e mantém o texto digitado', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);

    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    const campoNome = screen.getByLabelText('Nova tarefa');
    await user.type(campoNome, '   ');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    await screen.findByText('Informe o nome da tarefa.');
    expect(campoNome).toHaveValue('   ');
  });
});
