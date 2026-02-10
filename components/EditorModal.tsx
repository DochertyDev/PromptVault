import React, { useState, useEffect } from 'react';
import { Prompt, Category } from '../types';
import { X, Save } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  categories: Category[];
  initialPrompt: Prompt | null;
  initialCategoryId: string | null;
}

const EditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialPrompt,
  initialCategoryId
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setTitle(initialPrompt.title);
        setContent(initialPrompt.content);
        setCategoryId(initialPrompt.categoryId);
        setTags(initialPrompt.tags.join(', '));
        setIsTemplate(initialPrompt.isTemplate);
        setIsFavorite(initialPrompt.isFavorite);
      } else {
        setTitle('');
        setContent('');
        setCategoryId(initialCategoryId || (categories[0]?.id || ''));
        setTags('');
        setIsTemplate(false);
        setIsFavorite(false);
      }
    }
  }, [isOpen, initialPrompt, initialCategoryId, categories]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return;
    }
    onSave({
      id: initialPrompt?.id,
      title,
      content,
      categoryId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      isFavorite,
      isTemplate
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-black-300">
          <h2 className="text-xl font-bold text-white">
            {initialPrompt ? 'Edit Prompt' : 'New Prompt Template'}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors" title="Close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Coding Expert Persona"
                className="w-full bg-black-200 border border-black-300 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
              />
            </div>
            
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
          </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">Prompt Content</label>
              </div>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt text here..."
                className="w-full h-64 bg-black-200 border border-black-300 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Tags (comma separated)</label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="coding, python, debug"
                  className="w-full bg-black-200 border border-black-300 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                />
              </div>
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
                  💡 Use <code className="bg-black-300 px-1 py-0.5 rounded text-blue-300 font-mono">{`{variable}`}</code> syntax in your prompt content for placeholders
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-black-300 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-black-200 transition-colors font-medium"
          >
            Cancel
          </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium shadow-lg shadow-accent/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Save Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper component for the icon
const TagIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

export default EditorModal;