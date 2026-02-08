import { useState } from 'react';
import { X, Copy, Check, Edit } from 'lucide-react';
import { Prompt, Category } from '../types';
import { TagBadge } from './TagBadge';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300 flex-shrink-0">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-bold text-white mb-2">{prompt.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {prompt.isTemplate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-950 text-blue-300 border border-blue-700">
                  Template
                </span>
              )}
              {category && (
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-black-200 text-zinc-300 border border-black-300">
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
            className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-black-200/50 rounded-lg p-6 border border-black-300">
            <div className="text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {prompt.isTemplate
                ? renderContentWithHighlightedVariables(prompt.content)
                : prompt.content}
            </div>
          </div>

          {/* Tags section */}
          {prompt.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-300 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag) => (
                  <TagBadge key={tag} label={tag} size="lg" />
                ))}
              </div>
            </div>
          )}

          {/* Template variables info for templates */}
          {prompt.isTemplate && (
            <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-300 mb-2">Template Variables</h3>
              <p className="text-xs text-blue-200/70">
                This template contains variables highlighted in yellow. When copying with variables filled, enter their values in the modal that appears.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black-300 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleEdit}
            className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-black-200 transition-colors font-medium flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleCopy}
            className={`px-6 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2 ${
              copied
                ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-green-500/10'
                : 'bg-accent hover:bg-accent-hover text-black shadow-accent/20 border border-accent'
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