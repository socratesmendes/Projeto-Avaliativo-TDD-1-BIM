import { useRef, useState, type FormEvent } from 'react';
import { ApiError } from '../api/http';
import { useCriarTarefa } from './useTarefas';
import styles from './NovaTarefa.module.css';

export function NovaTarefa() {
  const nomeRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  const mutation = useCriarTarefa();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) {
      return;
    }
    setErroNome(null);
    setErroGeral(null);
    mutation.mutate(
      {
        nome,
        descricao: detalhesAbertos && descricao.trim() ? descricao : undefined,
        observacoes: detalhesAbertos && observacoes.trim() ? observacoes : undefined,
      },
      {
        onSuccess: () => {
          setNome('');
          setDescricao('');
          setObservacoes('');
          setDetalhesAbertos(false);
          nomeRef.current?.focus();
        },
        onError: (erro) => {
          if (erro instanceof ApiError && erro.campos?.nome) {
            setErroNome(erro.campos.nome);
          } else if (erro instanceof ApiError) {
            setErroGeral(erro.detail);
          }
        },
      },
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.linhaPrincipal}>
        <label htmlFor="nova-tarefa-nome" className="visualmente-oculto">
          Nova tarefa
        </label>
        <input
          ref={nomeRef}
          id="nova-tarefa-nome"
          type="text"
          placeholder="Nova tarefa"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          disabled={mutation.isPending}
          required
          maxLength={120}
          aria-describedby={erroNome ? 'nova-tarefa-nome-erro' : undefined}
        />
        <button type="submit" disabled={mutation.isPending}>
          Adicionar
        </button>
      </div>

      {erroNome && (
        <p id="nova-tarefa-nome-erro" className={styles.erroCampo}>
          {erroNome}
        </p>
      )}
      {erroGeral && (
        <p role="alert" className={styles.erroGeral}>
          {erroGeral}
        </p>
      )}

      {!detalhesAbertos && (
        <button type="button" className={styles.linkDetalhes} onClick={() => setDetalhesAbertos(true)}>
          Adicionar detalhes
        </button>
      )}

      {detalhesAbertos && (
        <div className={styles.detalhes}>
          <label htmlFor="nova-tarefa-descricao">Descrição</label>
          <textarea
            id="nova-tarefa-descricao"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            disabled={mutation.isPending}
            maxLength={2000}
          />
          <label htmlFor="nova-tarefa-observacoes">Observações</label>
          <textarea
            id="nova-tarefa-observacoes"
            value={observacoes}
            onChange={(event) => setObservacoes(event.target.value)}
            disabled={mutation.isPending}
            maxLength={2000}
          />
        </div>
      )}
    </form>
  );
}
