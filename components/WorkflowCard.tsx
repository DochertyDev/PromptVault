import React from 'react';
import { Pencil, Play, Trash2, ArrowRight } from 'lucide-react';
import { Workflow } from '../types';

interface WorkflowCardProps {
  workflow: Workflow;
  stepCount: number;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  stepCount,
  onOpen,
  onEdit,
  onDelete,
  onRun,
}) => {
  return (
    <div className="rounded-2xl border border-black-300 bg-black-100 p-5 shadow-lg transition hover:border-accent/40">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white">{workflow.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {stepCount} {stepCount === 1 ? 'step' : 'steps'}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white"
            title="Edit workflow"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            title="Delete workflow"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mb-5 min-h-[48px] text-sm leading-6 text-zinc-300">
        {workflow.description?.trim() || 'No description provided.'}
      </p>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-black-300 hover:text-white"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          onClick={onRun}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-black transition hover:bg-accent-hover"
        >
          <Play className="h-4 w-4" />
          Run
        </button>
      </div>
    </div>
  );
};

export default WorkflowCard;