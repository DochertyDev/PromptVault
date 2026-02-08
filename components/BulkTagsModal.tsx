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
  const [removeTagsInput, setRemoveTagsInput] = useState('');
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

  const tagsToAddList = handleAddTags();
  const canApply = tagsToAddList.length > 0 || tagsToRemove.size > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black-200 rounded-lg shadow-xl max-w-xl w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black-300">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-accent" />
            Manage Tags
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          <p className="text-sm text-gray-400">
            Updating tags for {totalSelected} item{totalSelected !== 1 ? 's' : ''}
          </p>

          {/* Add Tags Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g., urgent, important, review"
              value={addTagsInput}
              onChange={(e) => setAddTagsInput(e.target.value)}
              className="w-full px-3 py-2 bg-black-300 border border-black-400 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition"
            />
            {tagsToAddList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tagsToAddList.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-accent text-white text-xs rounded"
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Remove Tags (select to remove)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(selectedPromptTags)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([tag, count]) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 p-2 rounded hover:bg-black-300 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={tagsToRemove.has(tag)}
                        onChange={() => handleRemoveToggle(tag)}
                        className="w-4 h-4 rounded border-gray-600 text-accent accent-accent cursor-pointer"
                      />
                      <span className="text-gray-300 flex-1">{tag}</span>
                      <span className="text-xs text-gray-500">
                        {count}/{totalSelected}
                      </span>
                    </label>
                  ))}
              </div>

              {tagsToRemove.size > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Array.from(tagsToRemove).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-red-950 text-red-300 text-xs rounded"
                    >
                      - {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {Object.keys(selectedPromptTags).length === 0 && tagsToAddList.length === 0 && (
            <div className="p-3 bg-black-300 rounded text-gray-400 text-sm">
              No existing tags on selected prompts. You can only add new tags.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-black-300">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded hover:border-gray-500 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="flex-1 px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
