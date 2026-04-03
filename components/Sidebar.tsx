import React, { useState } from 'react';
import { Category } from '../types';
import { LayoutGrid, Plus, FolderOpen, Trash2, Edit2, Tag, HelpCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
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
  onSelectTag,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
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

  // Close mobile sidebar after selecting a category/tag
  const handleSelectCategory = (id: string | null) => {
    onSelectCategory(id);
    onMobileClose();
  };

  const handleSelectTag = (tag: string | null) => {
    onSelectTag(tag);
    onMobileClose();
  };

  const sortedTags = Object.keys(tagCounts).sort();

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          h-screen bg-black-100 border-r border-black-300 flex flex-col fixed left-0 top-0 overflow-hidden z-40 transition-all duration-300
          // Desktop: collapse/expand behaviour unchanged
          md:${isCollapsed ? 'w-16' : 'w-64'} md:translate-x-0
          // Mobile: always full-width drawer, slides in/out
          w-72 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center border-b border-black-300 flex-shrink-0 h-[73px] px-4">
          {/* Desktop collapsed state */}
          {isCollapsed ? (
            <div className="hidden md:flex w-full justify-center">
              <button
                onClick={onToggleCollapse}
                title="Expand sidebar"
                className="w-full flex justify-center p-1.5 rounded-lg text-zinc-500 hover:text-accent hover:bg-black-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}

          {/* Expanded state — desktop and mobile */}
          {(!isCollapsed) && (
            <>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-accent flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 flex-shrink-0" />
                  PromptVault
                </h1>
                <p className="text-xs text-zinc-500 mt-1">Organize your AI genius</p>
              </div>
              {/* Desktop: collapse toggle */}
              <button
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="hidden md:flex p-1.5 rounded-lg text-zinc-500 hover:text-accent hover:bg-black-200 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {/* Mobile: close button */}
              <button
                onClick={onMobileClose}
                title="Close menu"
                className="md:hidden p-1.5 rounded-lg text-zinc-500 hover:text-accent hover:bg-black-200 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Scrollable body */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'md:p-2 p-4' : 'p-4'} space-y-6`}>

          {/* Library section */}
          <div>
            {(!isCollapsed) && (
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Library</p>
            )}
            <div className="space-y-1">
              <button
                onClick={() => handleSelectCategory(null)}
                title="All Prompts"
                className={`w-full flex items-center rounded-lg text-sm transition-all duration-200 ${
                  isCollapsed ? 'md:justify-center md:p-2 gap-3 px-3 py-2' : 'gap-3 px-3 py-2'
                } ${
                  selectedCategoryId === null
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
                }`}
              >
                <LayoutGrid className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed) && 'All Prompts'}
              </button>

              <button
                onClick={() => handleSelectCategory('uncategorized')}
                title="Uncategorized"
                className={`w-full flex items-center rounded-lg text-sm transition-all duration-200 ${
                  isCollapsed ? 'md:justify-center md:p-2 gap-3 px-3 py-2' : 'gap-3 px-3 py-2'
                } ${
                  selectedCategoryId === 'uncategorized'
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-zinc-400 hover:bg-black-200 hover:text-zinc-200'
                }`}
              >
                <HelpCircle className="w-4 h-4 flex-shrink-0" />
                {(!isCollapsed) && 'Uncategorized'}
              </button>
            </div>
          </div>

          {/* Categories section */}
          {(!isCollapsed) && (
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
                        onClick={() => { onSelectCategory(category.id); onMobileClose(); }}
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

                        {/* Desktop: hover-reveal edit/delete. Mobile: always visible */}
                        <div className="flex items-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
          )}

          {/* Tags section */}
          {(!isCollapsed) && sortedTags.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 px-2">Tags</p>
              <div className="space-y-1">
                {sortedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelectTag(selectedTag === tag ? null : tag)}
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

        {/* Footer */}
        {(!isCollapsed) && (
          <div className="border-t border-black-300 flex-shrink-0 px-4 py-3">
            <span className="text-xs text-zinc-600">v1.1.0 • Local Storage</span>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
