import React, { useState } from 'react';
import { Category } from '../types';
import { LayoutGrid, Plus, FolderOpen, Trash2, Edit2, Tag, HelpCircle } from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onEditCategory: (id: string, name: string) => void;
  tagCounts: Record<string, number>;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  tagCounts,
  selectedTag,
  onSelectTag
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (editName.trim()) {
      onEditCategory(id, editName.trim());
      setEditingId(null);
    }
  };

  const startEdit = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setEditingId(category.id);
    setEditName(category.name);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this category? Prompts within it will be moved to Uncategorized.')) {
      onDeleteCategory(id);
    }
  };

  const sortedTags = Object.keys(tagCounts).sort();

  return (
    <aside className="w-64 h-screen bg-black-100 border-r border-black-300 flex flex-col fixed left-0 top-0 overflow-hidden z-20">
      <div className="p-6 border-b border-black-300">
        <h1 className="text-xl font-bold text-accent flex items-center gap-2">
          <LayoutGrid className="w-6 h-6" />
          PromptVault
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Organize your AI genius</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Library</p>
          <div className="space-y-1">
            <button
              onClick={() => onSelectCategory(null)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedCategoryId === null
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              All Prompts
            </button>
            <button
              onClick={() => onSelectCategory('uncategorized')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedCategoryId === 'uncategorized'
                  ? 'bg-accent-light text-accent font-medium'
                  : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Uncategorized
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-2">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Categories</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-zinc-500 hover:text-accent transition-colors"
              title="Add Category"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {isAdding && (
            <form onSubmit={handleAddSubmit} className="mb-2 px-2 flex gap-2">
              <input
                autoFocus
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Name..."
                className="flex-1 bg-black-200 text-white text-sm px-3 py-2 rounded border border-accent/50 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-accent hover:bg-accent-hover text-black text-sm font-medium rounded transition-colors flex-shrink-0"
                title="Add category"
              >
                Add
              </button>
            </form>
          )}

          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                {editingId === category.id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, category.id)} className="px-2 flex gap-2 w-full">
                     <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Enter category name"
                        className="flex-1 bg-black-200 text-white text-sm px-3 py-2 rounded border border-accent/50 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-accent hover:bg-accent-hover text-black text-sm font-medium rounded transition-colors flex-shrink-0"
                        title="Save category"
                      >
                        Save
                      </button>
                  </form>
                ) : (
                  <button
                    onClick={() => onSelectCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                      selectedCategoryId === category.id
                        ? 'bg-accent-light text-accent font-medium'
                        : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FolderOpen className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{category.name}</span>
                    </div>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        onClick={(e) => startEdit(e, category)}
                        className="p-1 hover:text-blue-400"
                      >
                         <Edit2 className="w-3 h-3" />
                      </div>
                      <div
                        onClick={(e) => handleDelete(e, category.id)}
                        className="p-1 hover:text-red-400"
                      >
                         <Trash2 className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {categories.length === 0 && !isAdding && (
            <div className="text-center py-4 px-2">
              <p className="text-zinc-600 text-xs italic">No categories yet.</p>
            </div>
          )}
        </div>

        {sortedTags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Tags</p>
            <div className="space-y-1">
              {sortedTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    selectedTag === tag
                      ? 'bg-accent-light text-accent font-medium'
                      : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Tag className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{tag}</span>
                  </div>
                  <span className="text-xs bg-black-200 text-zinc-500 px-2 py-1 rounded">
                    {tagCounts[tag]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-black-300">
         <div className="text-xs text-zinc-600 text-center">
            v1.1.0 • Local Storage
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;