import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Workflow } from '../types';

interface WorkflowEditorModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  onClose: () => void;
  onSave: (values: { id?: string; name: string; description: string }) => void;
}

const WorkflowEditorModal: React.FC<WorkflowEditorModalProps> = ({
  isOpen,
  workflow,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [workflow, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    onSave({
      id: workflow?.id,
      name: trimmedName,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-black-300 bg-black-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black-300 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {workflow ? 'Edit Workflow' : 'New Workflow'}
            </h2>
            <p className="text-sm text-zinc-400">
              Create an ordered bundle of existing prompts.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-black-200 hover:text-white"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Content Publishing Workflow"
              className="w-full rounded-lg border border-black-300 bg-black-200 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for what this workflow is for."
              rows={4}
              className="w-full rounded-lg border border-black-300 bg-black-200 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-black-300 bg-black-200 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {workflow ? 'Save Changes' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkflowEditorModal;