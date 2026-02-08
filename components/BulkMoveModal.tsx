import { X, FolderOpen } from 'lucide-react';
import { Category } from '../types';

interface BulkMoveModalProps {
  isOpen: boolean;
  categories: Category[];
  totalSelected: number;
  onClose: () => void;
  onApply: (categoryId: string) => void;
}

export function BulkMoveModal({
  isOpen,
  categories,
  totalSelected,
  onClose,
  onApply,
}: BulkMoveModalProps) {
  if (!isOpen) return null;

  const handleApply = (categoryId: string) => {
    onApply(categoryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black-200 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black-300">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent" />
            Move to Category
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
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-400 mb-4">
            Move {totalSelected} item{totalSelected !== 1 ? 's' : ''} to:
          </p>

          <button
            onClick={() => handleApply('')}
            className="w-full text-left px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
          >
            Uncategorized
          </button>

          {categories.length > 0 && (
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleApply(category.id)}
                  className="w-full text-left px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {categories.length === 0 && (
            <div className="p-3 bg-black-300 rounded text-gray-400 text-sm">
              No categories available. Create a category first.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex p-4 border-t border-black-300">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded hover:border-gray-500 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
