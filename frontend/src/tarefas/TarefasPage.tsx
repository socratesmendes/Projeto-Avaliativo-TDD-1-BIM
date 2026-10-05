import { agrupar } from './agrupar';
import { NovaTarefa } from './NovaTarefa';
import { TarefaItem } from './TarefaItem';
import { useTarefas } from './useTarefas';
import styles from './TarefasPage.module.css';

const formatadorDoDia = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function contarTexto(abertas: number, concluidas: number): string {
  const abertasTexto = abertas === 1 ? '1 aberta' : `${abertas} abertas`;
  const concluidasTexto = concluidas === 1 ? '1 concluída' : `${concluidas} concluídas`;
  return `${abertasTexto}, ${concluidasTexto}`;
}

export function TarefasPage() {
  const { data, isPending, isError, refetch } = useTarefas();
  const grupos = data ? agrupar(data) : null;

  return (
    <main className={styles.pagina}>
      <header className={styles.cabecalho}>
        <h1>Tarefas</h1>
        <p className={styles.subcabecalho}>
          <span>{formatadorDoDia.format(new Date())}</span>
          {grupos && <span>{contarTexto(grupos.abertas.length, grupos.concluidas.length)}</span>}
        </p>
      </header>

      <NovaTarefa />

      {isPending && (
        <div className={styles.esqueleto} aria-hidden="true">
          <div />
          <div />
          <div />
        </div>
      )}

      {isError && (
        <div role="alert" className={styles.erro}>
          <p>Não foi possível carregar as tarefas. Confira se a API está rodando e tente de novo.</p>
          <button type="button" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {grupos && !isPending && !isError && (
        <>
          {grupos.abertas.length === 0 && grupos.concluidas.length === 0 ? (
            <p className={styles.vazio}>Nenhuma tarefa. Escreva a primeira no campo acima.</p>
          ) : (
            <>
              <ul className={styles.lista}>
                {grupos.abertas.map((tarefa) => (
                  <TarefaItem key={tarefa.id} tarefa={tarefa} />
                ))}
              </ul>

              {grupos.concluidas.length > 0 && (
                <details className={styles.concluidas}>
                  <summary>Concluídas ({grupos.concluidas.length})</summary>
                  <ul className={styles.lista}>
                    {grupos.concluidas.map((tarefa) => (
                      <TarefaItem key={tarefa.id} tarefa={tarefa} />
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
}
