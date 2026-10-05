import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderComProvider, screen } from '../test/render';
import { requisicoesRegistradas } from '../test/handlers';
import App from '../App';

describe('Concluir pelo marcador', () => {
  it('clique envia PUT completo (preserva descrição/observações) com status CONCLUIDA, e o item vai para Concluídas', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);
    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    await user.type(screen.getByLabelText('Nova tarefa'), 'Revisar slides do seminário');
    await user.click(screen.getByRole('button', { name: 'Adicionar detalhes' }));
    await user.type(screen.getByLabelText('Descrição'), 'Faltam os gráficos do capítulo 3');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await screen.findByText('Revisar slides do seminário');

    const marcador = screen.getByRole('checkbox', { name: 'Revisar slides do seminário' });
    await user.click(marcador);

    await screen.findByText('Concluídas (1)');

    const ultimaRequisicao = requisicoesRegistradas().at(-1)!;
    expect(ultimaRequisicao.metodo).toBe('PUT');
    expect(ultimaRequisicao.corpo).toEqual({
      nome: 'Revisar slides do seminário',
      descricao: 'Faltam os gráficos do capítulo 3',
      status: 'CONCLUIDA',
      observacoes: null,
    });
  });
});

describe('Editar', () => {
  it('mudar para Em andamento e salvar envia PUT completo; o marcador fica indeterminado', async () => {
    const user = userEvent.setup();
    renderComProvider(<App />);
    await screen.findByText('Nenhuma tarefa. Escreva a primeira no campo acima.');

    await user.type(screen.getByLabelText('Nova tarefa'), 'Ligar para o dentista');
    await user.click(screen.getByRole('button', { name: 'Adicionar' }));
    await screen.findByText('Ligar para o dentista');

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByLabelText('Em andamento'));
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }));
    await screen.findByText('Ligar para o dentista');

    const ultimaRequisicao = requisicoesRegistradas().at(-1)!;
    expect(ultimaRequisicao.metodo).toBe('PUT');
    expect(ultimaRequisicao.corpo).toMatchObject({ nome: 'Ligar para o dentista', status: 'EM_ANDAMENTO' });

    const marcador = screen.getByRole('checkbox', { name: 'Ligar para o dentista' }) as HTMLInputElement;
    expect(marcador.indeterminate).toBe(true);
  });
});
