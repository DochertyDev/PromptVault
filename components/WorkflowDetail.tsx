import React from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Play,
  Plus,
  Trash2,
  Copy,
  Download,
} from 'lucide-react';
import { Workflow, WorkflowStepWithPrompt } from '../types';

interface WorkflowDetailProps {
  workflow: Workflow;
  steps: WorkflowStepWithPrompt[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRun: () => void;
  onExport: () => void;
  onAddPrompt: () => void;
  onRemoveStep: (stepId: string) => void;
  onMoveStep: (stepId: string, direction: -1 | 1) => void;
}

const WorkflowDetail: React.FC<WorkflowDetailProps> = ({
  workflow,
  steps,
  onBack,
  onEdit,
  onDelete,
  onRun,
  onExport,
  onAddPrompt,
  onRemoveStep,
  onMoveStep,
}) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-black-300 bg-black-100 p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddPrompt}
              className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
            >
              <Plus className="h-4 w-4" />
              Add Prompts
            </button>

            <button
              onClick={onExport}
              className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={onEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>

            <button
              onClick={onRun}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-black transition hover:bg-accent-hover"
            >
              <Play className="h-4 w-4" />
              Run
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-semibold text-white">{workflow.name}</h2>
        <p className="text-sm leading-6 text-zinc-400">
          {workflow.description?.trim() || 'No description provided.'}
        </p>
      </div>

      {steps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black-300 bg-black-100 px-6 py-16 text-center">
          <h3 className="mb-2 text-xl font-semibold text-white">This workflow has no steps yet</h3>
          <p className="mb-6 text-sm text-zinc-400">
            Add existing prompts to start building the workflow chain.
          </p>
          <button
            onClick={onAddPrompt}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Add Prompts
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map(({ step, prompt }, index) => (
            <div key={step.id} className="rounded-2xl border border-black-300 bg-black-100 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                      {index + 1}
                    </div>
                    <div className="flex min-w-0 items-center gap-2 flex-wrap">
                      <h3 className="truncate text-lg font-semibold text-white">
                        {step.titleOverride?.trim() || prompt.title}
                      </h3>
                      <span className="rounded-full border border-black-300 bg-black-200 px-2.5 py-1 text-xs font-medium text-zinc-400">
                        {prompt.isTemplate ? 'Template' : 'Prompt'}
                      </span>
                    </div>
                  </div>

                  {step.notes?.trim() && (
                    <p className="mb-3 text-sm text-zinc-400">{step.notes}</p>
                  )}

                  <p className="line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                    {prompt.content}
                  </p>

                  {prompt.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {prompt.tags.slice(0, 6).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-black-300 bg-black-200 px-2.5 py-1 text-xs text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end lg:self-start">
                  <button
                    onClick={() => navigator.clipboard.writeText(prompt.content)}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white"
                    title="Copy prompt content"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onMoveStep(step.id, -1)}
                    disabled={index === 0}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onMoveStep(step.id, 1)}
                    disabled={index === steps.length - 1}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => onRemoveStep(step.id)}
                    className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                    title="Remove from workflow"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowDetail;