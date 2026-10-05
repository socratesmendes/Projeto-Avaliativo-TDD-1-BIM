export class ApiError extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string;
  readonly campos?: Record<string, string>;

  constructor(status: number, title: string, detail: string, campos?: Record<string, string>) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.campos = campos;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

function ehJson(response: Response): boolean {
  const contentType = response.headers.get('content-type');
  return contentType !== null && contentType.includes('json');
}

export async function request<T>(caminho: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`/api${caminho}`, {
      method: options.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Falha de conexão', 'Não foi possível conectar à API. Confira se ela está rodando.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    if (ehJson(response)) {
      const corpo = await response.json();
      const campos: Record<string, string> | undefined = Array.isArray(corpo.erros)
        ? Object.fromEntries(
            corpo.erros.map((erro: { campo: string; mensagem: string }) => [erro.campo, erro.mensagem]),
          )
        : undefined;
      throw new ApiError(
        response.status,
        corpo.title ?? 'Erro',
        corpo.detail ?? 'Ocorreu um erro inesperado.',
        campos,
      );
    }
    throw new ApiError(response.status, 'Erro', 'Ocorreu um erro inesperado.');
  }

  if (ehJson(response)) {
    return (await response.json()) as T;
  }

  return undefined as T;
}
