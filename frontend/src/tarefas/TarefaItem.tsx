import { useEffect, useRef, useState } from 'react';
import type { Tarefa } from '../api/types';
import { TarefaEditor } from './TarefaEditor';
import { useAtualizarTarefa, useExcluirTarefa } from './useTarefas';
import styles from './TarefaItem.module.css';

const formatadorData = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

interface TarefaItemProps {
  tarefa: Tarefa;
}

export function TarefaItem({ tarefa }: TarefaItemProps) {
  const [editando, setEditando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const marcadorRef = useRef<HTMLInputElement>(null);
  const editarBotaoRef = useRef<HTMLButtonElement>(null);
  const manterBotaoRef = useRef<HTMLButtonElement>(null);
  const atualizarMutation = useAtualizarTarefa();
  const excluirMutation = useExcluirTarefa();

  useEffect(() => {
    if (marcadorRef.current) {
      marcadorRef.current.indeterminate = tarefa.status === 'EM_ANDAMENTO';
    }
  }, [tarefa.status]);

  useEffect(() => {
    if (confirmandoExclusao) {
      manterBotaoRef.current?.focus();
    }
  }, [confirmandoExclusao]);

  function fecharEdicaoEDevolverFoco() {
    setEditando(false);
    editarBotaoRef.current?.focus();
  }

  function alternarConclusao() {
    const novoStatus = tarefa.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
    atualizarMutation.mutate({
      id: tarefa.id,
      dados: {
        nome: tarefa.nome,
        descricao: tarefa.descricao,
        status: novoStatus,
        observacoes: tarefa.observacoes,
      },
    });
  }

  if (editando) {
    return (
      <li className={styles.item}>
        <TarefaEditor tarefa={tarefa} onCancelar={fecharEdicaoEDevolverFoco} onSalvo={fecharEdicaoEDevolverFoco} />
      </li>
    );
  }

  if (confirmandoExclusao) {
    return (
      <li className={styles.item}>
        <p className={styles.confirmacao}>Excluir esta tarefa?</p>
        <div className={styles.confirmacaoBotoes}>
          <button
            type="button"
            className={styles.botaoExcluir}
            disabled={excluirMutation.isPending}
            onClick={() => excluirMutation.mutate(tarefa.id)}
          >
            Excluir
          </button>
          <button
            ref={manterBotaoRef}
            type="button"
            className={styles.botaoManter}
            disabled={excluirMutation.isPending}
            onClick={() => setConfirmandoExclusao(false)}
          >
            Manter
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      <span className={styles.marcadorWrapper}>
        <input
          ref={marcadorRef}
          type="checkbox"
          className={styles.marcadorInput}
          id={`marcador-${tarefa.id}`}
          checked={tarefa.status === 'CONCLUIDA'}
          onChange={alternarConclusao}
          disabled={atualizarMutation.isPending}
          aria-describedby={`status-${tarefa.id}`}
        />
        <span className={styles.marcadorVisual} aria-hidden="true" />
      </span>
      <label htmlFor={`marcador-${tarefa.id}`} className={styles.nome} data-status={tarefa.status}>
        {tarefa.nome}
      </label>
      <span id={`status-${tarefa.id}`} className="visualmente-oculto">
        {tarefa.status === 'PENDENTE' && 'Pendente'}
        {tarefa.status === 'EM_ANDAMENTO' && 'Em andamento'}
        {tarefa.status === 'CONCLUIDA' && 'Concluída'}
      </span>
      <span className={styles.data}>{formatadorData.format(new Date(tarefa.dataCriacao))}</span>
      <div className={styles.acoes}>
        <button ref={editarBotaoRef} type="button" className={styles.acao} onClick={() => setEditando(true)}>
          Editar
        </button>
        <button type="button" className={styles.acao} onClick={() => setConfirmandoExclusao(true)}>
          Excluir
        </button>
      </div>
    </li>
  );
}
