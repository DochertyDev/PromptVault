import { useState } from 'react';
import { X, Tag } from 'lucide-react';

interface BulkTagsModalProps {
  isOpen: boolean;
  allExistingTags: string[];
  selectedPromptTags: { [tagName: string]: number }; // tag name => count of prompts with tag
  totalSelected: number;
  onClose: () => void;
  onApply: (addTags: string[], removeTags: string[]) => void;
}

export function BulkTagsModal({
  isOpen,
  allExistingTags,
  selectedPromptTags,
  totalSelected,
  onClose,
  onApply,
}: BulkTagsModalProps) {
  const [addTagsInput, setAddTagsInput] = useState('');
  const [tagsToRemove, setTagsToRemove] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleAddTags = () => {
    const tags = addTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return tags;
  };

  const handleRemoveToggle = (tag: string) => {
    setTagsToRemove((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleApply = () => {
    const addTags = handleAddTags();
    const removeTags = Array.from(tagsToRemove);

    onApply(addTags, removeTags);
    setAddTagsInput('');
    setTagsToRemove(new Set());
    onClose();
  };

  const handleCancel = () => {
    setAddTagsInput('');
    setTagsToRemove(new Set());
    onClose();
  };

  const tagsToAddList = handleAddTags();
  const canApply = tagsToAddList.length > 0 || tagsToRemove.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            Manage Tags
          </h2>
          <button
            onClick={handleCancel}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-sm text-zinc-300">
            Updating tags for {totalSelected} item{totalSelected !== 1 ? 's' : ''}
          </p>

          {/* Add Tags Section */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              Add Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., urgent, important, review"
              value={addTagsInput}
              onChange={(e) => setAddTagsInput(e.target.value)}
              className="w-full bg-black-200 border border-black-300 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
            />
            {tagsToAddList.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tagsToAddList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-black border border-accent"
                  >
                    + {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Remove Tags Section */}
          {Object.keys(selectedPromptTags).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">
                Remove Tags (select to remove)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(selectedPromptTags)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([tag, count]) => (
                    <label
                      key={tag}
                      className="flex items-center gap-3 p-3 rounded-lg bg-black-200 border border-black-300 hover:border-accent/50 hover:bg-black-300 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={tagsToRemove.has(tag)}
                        onChange={() => handleRemoveToggle(tag)}
                        className="w-4 h-4 rounded border-gray-600 text-accent accent-accent cursor-pointer"
                      />
                      <span className="text-zinc-300 flex-1 font-medium">{tag}</span>
                      <span className="text-xs text-zinc-500 bg-black-100 px-2 py-1 rounded">
                        {count}/{totalSelected}
                      </span>
                    </label>
                  ))}
              </div>

              {tagsToRemove.size > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from(tagsToRemove).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-950 text-red-300 border border-red-800"
                    >
                      - {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {Object.keys(selectedPromptTags).length === 0 && tagsToAddList.length === 0 && (
            <div className="p-4 bg-black-200 border border-black-300 rounded-lg text-zinc-400 text-sm">
              No existing tags on selected prompts. You can only add new tags.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black-300 flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white border border-black-300 hover:bg-black-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent transition-all"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}