import {
  Copy,
  Trash2,
  FolderOpen,
  Tag,
  Download,
  X,
} from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onCopy: () => void;
  onDelete: () => void;
  onMove: () => void;
  onTags: () => void;
  onExport: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onCopy,
  onDelete,
  onMove,
  onTags,
  onExport,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black-200 border-t border-black-300 shadow-lg z-40">
      <div className="max-w-full px-6 py-4 flex items-center justify-between gap-4">
        {/* Left side: selection info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-white font-medium">
            <div className="w-5 h-5 rounded border-2 border-accent bg-accent flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span>
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-400 hover:text-gray-200 transition"
            title="Press Escape to deselect"
          >
            (Press Esc to clear)
          </button>
        </div>

        {/* Right side: action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
            title="Copy selected prompts to clipboard"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Copy</span>
          </button>

          <button
            onClick={onTags}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
            title="Manage tags for selected prompts"
          >
            <Tag className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Tags</span>
          </button>

          <button
            onClick={onMove}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
            title="Move selected prompts to a category"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Move</span>
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-black-300 hover:bg-black-400 text-gray-300 hover:text-white transition"
            title="Export selected prompts to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Export</span>
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded bg-red-950 hover:bg-red-900 text-red-300 hover:text-red-100 transition"
            title="Delete selected prompts"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Delete</span>
          </button>

          <button
            onClick={onClearSelection}
            className="inline-flex items-center px-2 py-2 rounded hover:bg-black-300 text-gray-400 hover:text-white transition"
            title="Clear selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
