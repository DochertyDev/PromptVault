import React, { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Prompt } from '../types';

interface AddPromptToWorkflowModalProps {
  isOpen: boolean;
  prompts: Prompt[];
  existingPromptIds: string[];
  onClose: () => void;
  onAdd: (promptIds: string[]) => void;
}

const AddPromptToWorkflowModal: React.FC<AddPromptToWorkflowModalProps> = ({
  isOpen,
  prompts,
  existingPromptIds,
  onClose,
  onAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const availablePrompts = useMemo(() => {
    const existingIdSet = new Set(existingPromptIds);
    return prompts
      .filter((prompt) => !existingIdSet.has(prompt.id))
      .filter((prompt) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;

        return (
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [prompts, existingPromptIds, searchQuery]);

  if (!isOpen) return null;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = () => {
    onAdd(Array.from(selectedIds));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-black-300 bg-black-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black-300 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Add Prompts to Workflow</h2>
            <p className="text-sm text-zinc-400">
              Select one or more existing prompts to append as workflow steps.
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

        <div className="border-b border-black-300 px-6 py-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts to add..."
              className="w-full rounded-lg border border-black-300 bg-black-200 pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {availablePrompts.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <h3 className="mb-2 text-lg font-semibold text-white">No prompts available</h3>
              <p className="max-w-md text-sm text-zinc-400">
                Either all prompts are already in this workflow or nothing matches your search.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availablePrompts.map((prompt) => {
                const isSelected = selectedIds.has(prompt.id);

                return (
                  <button
                    key={prompt.id}
                    onClick={() => toggleSelected(prompt.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-accent/50 bg-accent-light/20'
                        : 'border-black-300 bg-black-200 hover:border-accent/30'
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">{prompt.title}</h3>
                        <p className="mt-1 text-xs text-zinc-500">
                          {prompt.isTemplate ? 'Template' : 'Prompt'}
                        </p>
                      </div>

                      <div
                        className={`mt-0.5 h-5 w-5 rounded border ${
                          isSelected
                            ? 'border-accent bg-accent'
                            : 'border-black-300 bg-black-100'
                        }`}
                      />
                    </div>

                    <p className="line-clamp-2 text-sm leading-6 text-zinc-400">{prompt.content}</p>

                    {prompt.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {prompt.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-black-300 bg-black-100 px-2 py-1 text-xs text-zinc-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black-300 px-6 py-4">
          <p className="text-sm text-zinc-400">
            {selectedIds.size} {selectedIds.size === 1 ? 'prompt selected' : 'prompts selected'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-black-300 bg-black-200 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
            >
              Cancel
            </button>

            <button
              onClick={handleAdd}
              disabled={selectedIds.size === 0}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPromptToWorkflowModal;