import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './server';
import { reiniciarTarefas } from './handlers';

// Qualquer chamada fora do contrato derruba o teste.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  // Sem `test.globals: true`, o RTL não registra a limpeza automática: precisa ser explícita.
  cleanup();
  server.resetHandlers();
  reiniciarTarefas();
});
afterAll(() => server.close());
