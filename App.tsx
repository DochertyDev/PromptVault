import React, { useState, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import PromptCard from './components/PromptCard';
import EditorModal from './components/EditorModal';
import ImportResultModal from './components/ImportResultModal';
import useIndexedDB from './hooks/useIndexedDB';
import { Prompt, Category, SortOption } from './types';
import { Plus, Search, LayoutGrid, List as ListIcon, Star, Filter, XCircle, ArrowDownUp, Download, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { generateCSVWithTimestamp } from './utils/csvExport';
import { importPromptsFromCSV, handleCSVFileUpload, ImportResult } from './utils/csvImport';

// Initial Data
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Coding' },
  { id: '2', name: 'Writing' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'Productivity' }
];

const INITIAL_PROMPTS: Prompt[] = [
  {
    id: '101',
    title: 'React Component Generator',
    content: 'Create a functional React component using TypeScript and Tailwind CSS. The component should be responsive and accessible. Include interface definitions for props.',
    categoryId: '1',
    tags: ['react', 'typescript', 'frontend'],
    isFavorite: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '102',
    title: 'Blog Post Outline',
    content: 'Write a detailed outline for a blog post about [Topic]. Include a catchy title, introduction with a hook, 3 main section headers with bullet points, and a conclusion with a call to action.',
    categoryId: '2',
    tags: ['blog', 'content', 'seo'],
    isFavorite: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

const App: React.FC = () => {
  // State
  const [categories, setCategories] = useIndexedDB<Category[]>('pv_categories', INITIAL_CATEGORIES);
  const [prompts, setPrompts] = useIndexedDB<Prompt[]>('pv_prompts', INITIAL_PROMPTS);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const [importedPromptsCount, setImportedPromptsCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Derived State
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Calculate counts based on current category view
    const relevantPrompts = selectedCategoryId 
      ? prompts.filter(p => {
          if (selectedCategoryId === 'uncategorized') {
            return !p.categoryId || !categories.find(c => c.id === p.categoryId);
          }
          return p.categoryId === selectedCategoryId;
        })
      : prompts;
    
    relevantPrompts.forEach(p => {
      p.tags.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return counts;
  }, [prompts, selectedCategoryId, categories]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(prompt => {
      // Category Filter
      let matchesCategory = true;
      if (selectedCategoryId === 'uncategorized') {
        matchesCategory = !prompt.categoryId || !categories.find(c => c.id === prompt.categoryId);
      } else if (selectedCategoryId) {
        matchesCategory = prompt.categoryId === selectedCategoryId;
      }

      const matchesTag = selectedTag ? prompt.tags.includes(selectedTag) : true;
      const matchesSearch = 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFavorite = showFavoritesOnly ? prompt.isFavorite : true;
      
      return matchesCategory && matchesTag && matchesSearch && matchesFavorite;
    }).sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return b.createdAt - a.createdAt;
      }
    });
  }, [prompts, selectedCategoryId, selectedTag, searchQuery, showFavoritesOnly, sortOption, categories]);

  const getHeaderTitle = () => {
    if (selectedCategoryId === 'uncategorized') return 'Uncategorized';
    if (selectedCategoryId) return categories.find(c => c.id === selectedCategoryId)?.name || 'Unknown Category';
    return 'All Prompts';
  };

  // Handlers
  const handleAddCategory = (name: string) => {
    setCategories([...categories, { id: uuidv4(), name }]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    setPrompts(prompts.map(p => p.categoryId === id ? { ...p, categoryId: '' } : p));
    if (selectedCategoryId === id) setSelectedCategoryId(null);
  };

  const handleEditCategory = (id: string, name: string) => {
     setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (promptData.id && typeof promptData.id === 'string') {
      // Update existing - be explicit about what we're updating
      setPrompts(prompts.map(p => {
        if (p.id === promptData.id) {
          return {
            id: p.id,
            title: promptData.title,
            content: promptData.content,
            categoryId: promptData.categoryId,
            tags: promptData.tags,
            isFavorite: promptData.isFavorite,
            createdAt: p.createdAt,
            updatedAt: Date.now()
          };
        }
        return p;
      }));
    } else {
      // Create new
      const newPrompt: Prompt = {
        id: uuidv4(),
        title: promptData.title,
        content: promptData.content,
        categoryId: promptData.categoryId,
        tags: promptData.tags,
        isFavorite: promptData.isFavorite,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setPrompts([newPrompt, ...prompts]);
    }
  };

  const handleDeletePrompt = (id: string) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      setPrompts((currentPrompts) => currentPrompts.filter(p => p.id !== id));
    }
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setIsEditorOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
     setPrompts(prompts.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Toast logic could go here
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(current => current === tag ? null : tag);
  };

  const handleCategorySelect = (id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedTag(null); // Clear tag filter when switching categories
  };

  const handleExportCSV = () => {
    try {
      generateCSVWithTimestamp(prompts, categories);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export prompts. Please try again.');
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await handleCSVFileUpload(file);
      const { prompts: importedPrompts, categories: updatedCategories, result } = importPromptsFromCSV(csvContent, categories);
      
      // Update state
      setCategories(updatedCategories);
      setPrompts([...prompts, ...importedPrompts]);
      setImportResult(result);
      setImportedPromptsCount(importedPrompts.length);
      setShowImportResult(true);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportResult({
        success: false,
        promptsImported: 0,
        errors: [`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      });
      setImportedPromptsCount(0);
      setShowImportResult(true);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-zinc-100">
      <Sidebar 
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategorySelect}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onEditCategory={handleEditCategory}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onSelectTag={handleTagClick}
      />

      <main className="flex-1 ml-64 p-8 max-w-[1920px]">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{getHeaderTitle()}</h1>
              {selectedTag && (
                <div className="flex items-center gap-1 px-3 py-1 bg-accent-light text-accent rounded-full text-sm font-medium border border-accent/30">
                  <Filter className="w-3 h-3" />
                  <span>{selectedTag}</span>
                  <button 
                    onClick={() => setSelectedTag(null)}
                    className="ml-1 hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-zinc-400 text-sm">
              {filteredPrompts.length} {filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 bg-black-200 border border-black-300 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:ring-2 focus:ring-accent outline-none transition-all"
              />
            </div>

            <div className="relative">
              <ArrowDownUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none w-40 bg-black-200 border border-black-300 rounded-lg pl-10 pr-8 py-2 text-sm text-zinc-200 focus:ring-2 focus:ring-accent outline-none transition-all cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="az">A-Z</option>
                <option value="za">Z-A</option>
              </select>
            </div>
            
            <div className="flex items-center bg-black-200 border border-black-300 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'}`}
                >
                    <ListIcon className="w-4 h-4" />
                </button>
            </div>

             <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2 rounded-lg border transition-colors ${showFavoritesOnly ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' : 'bg-black-200 border-black-300 text-zinc-400 hover:text-white'}`}
                title="Show Favorites"
            >
                <Star className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-3 py-2 rounded-lg font-medium transition-colors border border-black-300"
                title="Export prompts as CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Export</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-3 py-2 rounded-lg font-medium transition-colors border border-black-300"
                title="Import prompts from CSV"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Import</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              
              <button
                onClick={() => {
                  setEditingPrompt(null);
                  setIsEditorOpen(true);
                }}
                className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-accent/20"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">New</span>
              </button>
            </div>
          </div>
        </header>

        {/* Prompt Grid */}
        {filteredPrompts.length > 0 ? (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
            {filteredPrompts.map(prompt => (
              <div key={prompt.id} className={viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''}>
                 <PromptCard
                    prompt={prompt}
                    category={categories.find(c => c.id === prompt.categoryId)}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onCopy={copyToClipboard}
                    onToggleFavorite={handleToggleFavorite}
                    onTagClick={handleTagClick}
                    selectedTag={selectedTag}
                    viewMode={viewMode}
                  />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-black-200 p-4 rounded-full mb-4">
               <Search className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No prompts found</h3>
            <p className="text-zinc-400 max-w-sm">
              We couldn't find any prompts matching your criteria. Try adjusting your search filters.
            </p>
          </div>
        )}
      </main>

      <EditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
        categories={categories}
        initialPrompt={editingPrompt}
        initialCategoryId={selectedCategoryId}
      />

      <ImportResultModal
        isOpen={showImportResult}
        onClose={() => setShowImportResult(false)}
        result={importResult}
        promptsImported={importedPromptsCount}
      />
    </div>
  );
};

export default App;
