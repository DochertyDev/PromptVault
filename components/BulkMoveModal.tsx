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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-accent" />
            Move to Category
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-sm text-zinc-400 mb-4">
            Move {totalSelected} item{totalSelected !== 1 ? 's' : ''} to:
          </p>

          <button
            onClick={() => handleApply('')}
            className="w-full text-left px-4 py-3 rounded-lg bg-black-200 hover:bg-black-300 text-zinc-200 hover:text-white border border-black-300 hover:border-accent transition-all duration-200 font-medium"
          >
            Uncategorized
          </button>

          {categories.length > 0 && (
            <div className="space-y-2 pt-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleApply(category.id)}
                  className="w-full text-left px-4 py-3 rounded-lg bg-black-200 hover:bg-black-300 text-zinc-200 hover:text-white border border-black-300 hover:border-accent transition-all duration-200 font-medium"
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {categories.length === 0 && (
            <div className="p-4 bg-black-200 border border-black-300 rounded-lg text-zinc-400 text-sm">
              No categories available. Create a category first.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black-300 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg text-zinc-300 hover:text-white border border-black-300 hover:bg-black-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => handleApply('')}
            className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium transition-all shadow-lg shadow-accent/20"
          >
            Move
          </button>
        </div>
      </div>
    </div>
  );
}