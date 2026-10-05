import { http, HttpResponse } from 'msw/http';
import type { HttpHandler } from 'msw';
import type { AtualizarTarefa, CriarTarefa, StatusTarefa, Tarefa } from '../api/types';

const STATUS_VALIDOS: StatusTarefa[] = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'];

let tarefas: Tarefa[] = [];
let proximoId = 1;

export interface RequisicaoRegistrada {
  metodo: 'POST' | 'PUT' | 'DELETE';
  url: string;
  corpo?: CriarTarefa | AtualizarTarefa;
}

let requisicoes: RequisicaoRegistrada[] = [];

/** Requisições de escrita recebidas, na ordem em que chegaram — para os testes afirmarem o payload exato ou a ausência de chamada. */
export function requisicoesRegistradas(): RequisicaoRegistrada[] {
  return requisicoes;
}

/** Reinicia o armazenamento em memória. Chamado a cada teste (ver src/test/setup.ts). */
export function reiniciarTarefas(): void {
  tarefas = [];
  proximoId = 1;
  requisicoes = [];
}

function problemDetails(
  status: number,
  title: string,
  detail: string,
  erros?: Array<{ campo: string; mensagem: string }>,
) {
  return HttpResponse.json(
    { type: 'about:blank', title, status, detail, instance: '/api/tarefas', ...(erros ? { erros } : {}) },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

function validarNome(nome: string | undefined, erros: Array<{ campo: string; mensagem: string }>): void {
  if (!nome || !nome.trim()) {
    erros.push({ campo: 'nome', mensagem: 'Informe o nome da tarefa.' });
  } else if (nome.length > 120) {
    erros.push({ campo: 'nome', mensagem: 'O nome pode ter no máximo 120 caracteres.' });
  }
}

export const handlers: HttpHandler[] = [
  http.get('/api/tarefas', () => {
    const ordenadas = [...tarefas].sort(
      (a, b) => b.dataCriacao.localeCompare(a.dataCriacao) || b.id - a.id,
    );
    return HttpResponse.json(ordenadas);
  }),

  http.get('/api/tarefas/:id', ({ params }) => {
    const tarefa = tarefas.find((t) => t.id === Number(params.id));
    if (!tarefa) {
      return problemDetails(404, 'Tarefa não encontrada', `Não existe tarefa com id ${params.id}.`);
    }
    return HttpResponse.json(tarefa);
  }),

  http.post('/api/tarefas', async ({ request }) => {
    const corpo = (await request.json()) as CriarTarefa;
    requisicoes.push({ metodo: 'POST', url: '/api/tarefas', corpo });

    if (corpo.status && !STATUS_VALIDOS.includes(corpo.status)) {
      return problemDetails(
        400,
        'Dados inválidos',
        'O corpo da requisição é inválido. Status aceitos: PENDENTE, EM_ANDAMENTO ou CONCLUIDA.',
      );
    }

    const erros: Array<{ campo: string; mensagem: string }> = [];
    validarNome(corpo.nome, erros);
    if (erros.length > 0) {
      return problemDetails(400, 'Dados inválidos', 'Um ou mais campos são inválidos.', erros);
    }

    const agora = new Date().toISOString();
    const tarefa: Tarefa = {
      id: proximoId++,
      nome: corpo.nome,
      descricao: corpo.descricao ?? null,
      status: corpo.status ?? 'PENDENTE',
      observacoes: corpo.observacoes ?? null,
      dataCriacao: agora,
      dataAtualizacao: agora,
    };
    tarefas.push(tarefa);

    return HttpResponse.json(tarefa, {
      status: 201,
      headers: { Location: `/api/tarefas/${tarefa.id}` },
    });
  }),

  http.put('/api/tarefas/:id', async ({ request, params }) => {
    const tarefa = tarefas.find((t) => t.id === Number(params.id));
    if (!tarefa) {
      return problemDetails(404, 'Tarefa não encontrada', `Não existe tarefa com id ${params.id}.`);
    }

    const corpo = (await request.json()) as AtualizarTarefa;
    requisicoes.push({ metodo: 'PUT', url: `/api/tarefas/${params.id}`, corpo });

    if (corpo.status && !STATUS_VALIDOS.includes(corpo.status)) {
      return problemDetails(
        400,
        'Dados inválidos',
        'O corpo da requisição é inválido. Status aceitos: PENDENTE, EM_ANDAMENTO ou CONCLUIDA.',
      );
    }

    const erros: Array<{ campo: string; mensagem: string }> = [];
    validarNome(corpo.nome, erros);
    if (!corpo.status) {
      erros.push({ campo: 'status', mensagem: 'Informe o status.' });
    }
    if (erros.length > 0) {
      return problemDetails(400, 'Dados inválidos', 'Um ou mais campos são inválidos.', erros);
    }

    tarefa.nome = corpo.nome;
    tarefa.descricao = corpo.descricao ?? null;
    tarefa.status = corpo.status;
    tarefa.observacoes = corpo.observacoes ?? null;
    tarefa.dataAtualizacao = new Date().toISOString();

    return HttpResponse.json(tarefa);
  }),

  http.delete('/api/tarefas/:id', ({ params }) => {
    requisicoes.push({ metodo: 'DELETE', url: `/api/tarefas/${params.id}` });

    const indice = tarefas.findIndex((t) => t.id === Number(params.id));
    if (indice === -1) {
      return problemDetails(404, 'Tarefa não encontrada', `Não existe tarefa com id ${params.id}.`);
    }
    tarefas.splice(indice, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
