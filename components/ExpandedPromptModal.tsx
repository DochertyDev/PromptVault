import { useState } from 'react';
import { X, Copy, Check, Edit, ChevronUp } from 'lucide-react';
import { Prompt, Category } from '../types';

interface ExpandedPromptModalProps {
  isOpen: boolean;
  prompt: Prompt | null;
  category?: Category;
  onClose: () => void;
  onEdit: (prompt: Prompt) => void;
  onTemplateRequest?: (prompt: Prompt) => void;
  onCopy: (content: string) => void;
}

export function ExpandedPromptModal({
  isOpen,
  prompt,
  category,
  onClose,
  onEdit,
  onTemplateRequest,
  onCopy,
}: ExpandedPromptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !prompt) return null;

  // Extract and highlight template variables
  const renderContentWithHighlightedVariables = (content: string) => {
    const parts = content.split(/(\{[^}]+\})/g);
    return parts.map((part, index) => {
      // Check if this part is a variable placeholder
      if (part.match(/^\{[^}]+\}$/)) {
        return (
          <span key={index} className="bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded border border-yellow-500/30 font-mono text-sm">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleCopy = () => {
    if (prompt.isTemplate && onTemplateRequest) {
      // For templates, request variable filling
      onTemplateRequest(prompt);
    } else {
      // For regular prompts, copy directly
      onCopy(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEdit = () => {
    onEdit(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black-200 rounded-lg shadow-2xl max-h-[95vh] w-full max-w-4xl flex flex-col border border-black-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-white mb-2">{prompt.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {prompt.isTemplate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-medium bg-blue-950 text-blue-300 border border-blue-700">
                  Template
                </span>
              )}
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-medium bg-black-300 text-zinc-300">
                  {category.name}
                </span>
              )}
              <span className="text-xs text-zinc-500">
                {new Date(prompt.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition flex-shrink-0"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-black/40 rounded-lg p-6 border border-black-300 mb-6">
            <div className="text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {prompt.isTemplate
                ? renderContentWithHighlightedVariables(prompt.content)
                : prompt.content}
            </div>
          </div>

          {/* Tags section */}
          {prompt.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-light text-accent border border-accent/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template variables info for templates */}
          {prompt.isTemplate && (
            <div className="bg-blue-950/30 border border-blue-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Template Variables</h3>
              <p className="text-xs text-blue-200/70">
                This template contains variables highlighted in yellow. When copying with variables filled, enter their values in the modal that appears.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-black-300 flex-shrink-0 bg-black-300/30">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 border border-gray-600 rounded hover:border-gray-500 hover:text-white transition"
          >
            <ChevronUp className="w-4 h-4" />
            Collapse
          </button>
          <div className="flex-1" />
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-black-200 border border-black-400 text-zinc-300 rounded hover:bg-black-100 hover:text-white transition"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition-all duration-200 ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/20 border border-accent'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
