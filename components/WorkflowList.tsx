import React from 'react';
import { GitBranch, Plus } from 'lucide-react';
import { Workflow, WorkflowStep } from '../types';
import WorkflowCard from './WorkflowCard';

interface WorkflowListProps {
  workflows: Workflow[];
  workflowSteps: WorkflowStep[];
  onOpen: (workflowId: string) => void;
  onCreate: () => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflowId: string) => void;
  onRun: (workflow: Workflow) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  workflowSteps,
  onOpen,
  onCreate,
  onEdit,
  onDelete,
  onRun,
}) => {
  const getStepCount = (workflowId: string) => {
    return workflowSteps.filter((step) => step.workflowId === workflowId).length;
  };

  if (workflows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black-300 bg-black-100 px-6 py-20 text-center">
        <div className="mb-4 rounded-full bg-black-200 p-4">
          <GitBranch className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">No workflows yet</h3>
        <p className="mb-6 max-w-md text-sm leading-6 text-zinc-400">
          Create your first workflow to group related prompts into a reusable sequence.
        </p>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          stepCount={getStepCount(workflow.id)}
          onOpen={() => onOpen(workflow.id)}
          onEdit={() => onEdit(workflow)}
          onDelete={() => onDelete(workflow.id)}
          onRun={() => onRun(workflow)}
        />
      ))}
    </div>
  );
};

export default WorkflowList;