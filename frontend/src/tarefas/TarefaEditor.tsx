import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import type { StatusTarefa, Tarefa } from '../api/types';
import { ApiError } from '../api/http';
import { useAtualizarTarefa } from './useTarefas';
import styles from './TarefaEditor.module.css';

const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const formatadorRelativo = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

function descreverAtualizacao(dataAtualizacaoIso: string): string {
  const diffMinutos = Math.round((new Date(dataAtualizacaoIso).getTime() - Date.now()) / 60_000);
  if (Math.abs(diffMinutos) < 60) {
    return formatadorRelativo.format(diffMinutos, 'minute');
  }
  const diffHoras = Math.round(diffMinutos / 60);
  if (Math.abs(diffHoras) < 24) {
    return formatadorRelativo.format(diffHoras, 'hour');
  }
  return formatadorRelativo.format(Math.round(diffHoras / 24), 'day');
}

const OPCOES_STATUS: Array<{ valor: StatusTarefa; rotulo: string }> = [
  { valor: 'PENDENTE', rotulo: 'Pendente' },
  { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
  { valor: 'CONCLUIDA', rotulo: 'Concluída' },
];

interface TarefaEditorProps {
  tarefa: Tarefa;
  onCancelar: () => void;
  onSalvo: () => void;
}

export function TarefaEditor({ tarefa, onCancelar, onSalvo }: TarefaEditorProps) {
  const [nome, setNome] = useState(tarefa.nome);
  const [descricao, setDescricao] = useState(tarefa.descricao ?? '');
  const [observacoes, setObservacoes] = useState(tarefa.observacoes ?? '');
  const [status, setStatus] = useState<StatusTarefa>(tarefa.status);
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const nomeRef = useRef<HTMLInputElement>(null);
  const mutation = useAtualizarTarefa();

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mutation.isPending) {
      return;
    }
    setErroNome(null);
    setErroGeral(null);
    mutation.mutate(
      {
        id: tarefa.id,
        dados: {
          nome,
          descricao: descricao.trim() ? descricao : null,
          status,
          observacoes: observacoes.trim() ? observacoes : null,
        },
      },
      {
        onSuccess: () => onSalvo(),
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

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Escape') {
      onCancelar();
    }
  }

  const idNome = `editor-nome-${tarefa.id}`;
  const idDescricao = `editor-descricao-${tarefa.id}`;
  const idObservacoes = `editor-observacoes-${tarefa.id}`;

  return (
    <form className={styles.editor} onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <div className={styles.campo}>
        <label htmlFor={idNome}>Nome</label>
        <input
          ref={nomeRef}
          id={idNome}
          type="text"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          required
          maxLength={120}
          disabled={mutation.isPending}
          aria-describedby={erroNome ? `${idNome}-erro` : undefined}
        />
        {erroNome && (
          <p id={`${idNome}-erro`} className={styles.erroCampo}>
            {erroNome}
          </p>
        )}
      </div>

      <div className={styles.campo}>
        <label htmlFor={idDescricao}>Descrição</label>
        <textarea
          id={idDescricao}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          maxLength={2000}
          disabled={mutation.isPending}
        />
      </div>

      <div className={styles.campo}>
        <label htmlFor={idObservacoes}>Observações</label>
        <textarea
          id={idObservacoes}
          value={observacoes}
          onChange={(event) => setObservacoes(event.target.value)}
          maxLength={2000}
          disabled={mutation.isPending}
        />
      </div>

      <fieldset className={styles.status}>
        <legend>Status</legend>
        {OPCOES_STATUS.map((opcao) => (
          <label key={opcao.valor} className={styles.statusOpcao}>
            <input
              type="radio"
              name={`status-${tarefa.id}`}
              value={opcao.valor}
              checked={status === opcao.valor}
              onChange={() => setStatus(opcao.valor)}
              disabled={mutation.isPending}
            />
            {opcao.rotulo}
          </label>
        ))}
      </fieldset>

      <p className={styles.datas}>
        Criada em {formatadorDataHora.format(new Date(tarefa.dataCriacao))}.{' '}
        {tarefa.dataAtualizacao === tarefa.dataCriacao
          ? 'Ainda não foi atualizada.'
          : `Atualizada ${descreverAtualizacao(tarefa.dataAtualizacao)}.`}
      </p>

      {erroGeral && (
        <p role="alert" className={styles.erroGeral}>
          {erroGeral}
        </p>
      )}

      <div className={styles.botoes}>
        <button type="submit" disabled={mutation.isPending}>
          Salvar alterações
        </button>
        <button type="button" onClick={onCancelar} disabled={mutation.isPending}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
