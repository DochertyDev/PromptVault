import { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Edit, Save } from 'lucide-react';
import { Prompt, Category } from '../types';
import { CustomSelect } from './CustomSelect';
import { TagBadge } from './TagBadge';

interface CombinedPromptModalProps {
  isOpen: boolean;
  prompt: Prompt | null;
  category?: Category;
  categories: Category[];
  onClose: () => void;
  onSave: (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  onTemplateRequest?: (prompt: Prompt) => void;
  onCopy: (content: string) => void;
  mode?: 'view' | 'edit';
}

export function CombinedPromptModal({
  isOpen,
  prompt,
  category,
  categories,
  onClose,
  onSave,
  onTemplateRequest,
  onCopy,
  mode = 'view',
}: CombinedPromptModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Edit form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (prompt) {
        setTitle(prompt.title);
        setContent(prompt.content);
        setCategoryId(prompt.categoryId);
        setTags(prompt.tags.join(', '));
        setIsTemplate(prompt.isTemplate);
        setIsFavorite(prompt.isFavorite);
        setIsEditing(mode === 'edit'); // Set editing mode based on prop
        setCopied(false);
      } else if (mode === 'edit') {
        // Creating a new prompt
        setTitle('');
        setContent('');
        setCategoryId('');
        setTags('');
        setIsTemplate(false);
        setIsFavorite(false);
        setIsEditing(true);
        setCopied(false);
      }
    }
  }, [isOpen, prompt, mode]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!prompt) return;
    if (prompt.isTemplate && onTemplateRequest) {
      onTemplateRequest(prompt);
    } else {
      onCopy(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    onSave({
      id: prompt?.id,
      title,
      content,
      categoryId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isFavorite,
      isTemplate
    });
    setIsEditing(false);
    onClose();
  };

  const renderContentWithHighlightedVariables = (text: string) => {
    const parts = text.split(/(\{[^}]+\})/g);
    return parts.map((part, index) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300 flex-shrink-0">
          <div className="flex-1 pr-4">
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Coding Expert Persona"
                  className="w-full bg-black-200 border border-black-300 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                />
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-2">{prompt?.title || 'New Prompt'}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {prompt?.isTemplate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-blue-950 text-blue-300 border border-blue-700">
                      Template
                    </span>
                  )}
                  {prompt && category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-black-200 text-zinc-300 border border-black-300">
                      {category.name}
                    </span>
                  )}
                  {prompt && (
                    <span className="text-xs text-zinc-500">
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              onClose();
            }}
            className="text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            // Edit Mode
            <form ref={formRef} onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Category</label>
                <CustomSelect
                  value={categoryId}
                  onChange={(value) => setCategoryId(value)}
                  options={[
                    { value: '', label: 'Select a category' },
                    ...categories.map(cat => ({
                      value: cat.id,
                      label: cat.name
                    }))
                  ]}
                  placeholder="Select a category"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-300">Prompt Content</label>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your prompt text here..."
                  className="w-full h-64 bg-black-200 border border-black-300 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="coding, python, debug"
                  className="w-full bg-black-200 border border-black-300 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 p-3 rounded bg-black-200 border border-black-300 hover:border-accent/50 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={isTemplate}
                    onChange={(e) => setIsTemplate(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-accent accent-accent cursor-pointer"
                  />
                  <span className="text-sm font-medium text-zinc-300">This is a template (with variable placeholders)</span>
                </label>
                {isTemplate && (
                  <p className="text-xs text-blue-300 px-3 py-2 bg-blue-950 rounded border border-blue-800">
                    Use <code className="bg-black-300 px-1 py-0.5 rounded text-blue-300 font-mono">{`{variable}`}</code> syntax in your prompt content for placeholders
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 p-3 rounded bg-black-200 border border-black-300 hover:border-accent/50 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 text-accent accent-accent cursor-pointer"
                />
                <span className="text-sm font-medium text-zinc-300">Add to favorites</span>
              </label>
            </form>
          ) : (
            // View Mode
            <>
              {prompt && (
                <>
                  <div className="bg-black-200/50 rounded-lg p-6 border border-black-300">
                    <div className="text-zinc-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {prompt.isTemplate
                        ? renderContentWithHighlightedVariables(prompt.content)
                        : prompt.content}
                    </div>
                  </div>

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

                  {prompt.isTemplate && (
                    <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-300 mb-2">Template Variables</h3>
                      <p className="text-xs text-blue-200/70">
                        This template contains variables highlighted in yellow. When copying with variables filled, enter their values in the modal that appears.
                      </p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black-300 flex justify-end gap-3 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-black-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (formRef.current) {
                    formRef.current.dispatchEvent(new Event('submit', { bubbles: true }));
                  }
                }}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium shadow-lg shadow-accent/20 flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                Save Prompt
              </button>
            </>
          ) : prompt ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
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
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}