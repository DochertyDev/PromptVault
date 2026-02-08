import React from 'react';
import { FolderOpen, Tag, FileText, Search } from 'lucide-react';
import { Prompt, Category } from '../types';
import { GroupedSearchResults } from '../utils/searchPrompts';
import { TagBadge } from './TagBadge';

interface GroupedSearchResultsProps {
  results: GroupedSearchResults;
  searchQuery: string;
  categories: Category[];
  onSelectCategory: (id: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectPrompt?: (prompt: Prompt) => void;
}

export function GroupedSearchResultsComponent({
  results,
  searchQuery,
  categories,
  onSelectCategory,
  onSelectTag,
  onSelectPrompt
}: GroupedSearchResultsProps) {
  // If no results at all, show empty state
  if (results.categories.length === 0 && results.tags.length === 0 && results.prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-black-200 p-4 rounded-full mb-4">
          <Search className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
        <p className="text-zinc-400 max-w-sm">
          No matches for "{searchQuery}". Try different keywords or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Categories Section */}
      {results.categories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-white">
              Categories ({results.categories.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.categories.map(category => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="bg-black-200 border border-black-300 rounded-xl p-4 text-left hover:border-accent hover:bg-black-100 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <FolderOpen className="w-6 h-6 text-accent flex-shrink-0" />
                  <span className="text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </div>
                <h3 className="text-base font-medium text-white mt-3 group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {results.tags.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-white">
              Tags ({results.tags.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="bg-black-200 border border-black-300 rounded-xl p-4 text-left hover:border-accent hover:bg-accent/5 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-accent"></span>
                    <span className="text-sm text-zinc-400 group-hover:text-accent transition-colors">#</span>
                  </div>
                  <span className="text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">+</span>
                </div>
                <h3 className="text-base font-medium text-white mt-3 group-hover:text-accent transition-colors break-words">
                  {tag}
                </h3>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompts Section */}
      {results.prompts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold text-white">
              Prompts ({results.prompts.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {results.prompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => onSelectPrompt?.(prompt)}
                className="bg-black-200 border border-black-300 rounded-xl p-5 text-left hover:border-accent hover:shadow-lg hover:shadow-accent/10 transition-all duration-200 group flex flex-col h-full"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base font-semibold text-white group-hover:text-accent transition-colors flex-1 line-clamp-2">
                    {prompt.title}
                  </h3>
                  <span className="text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">+</span>
                </div>
                
                <p className="text-sm text-zinc-400 line-clamp-2 mb-3 flex-1">
                  {prompt.content}
                </p>

                {prompt.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-auto pt-3 border-t border-black-300">
                    {prompt.tags.slice(0, 2).map(tag => (
                      <TagBadge key={tag} label={tag} size="sm" />
                    ))}
                    {prompt.tags.length > 2 && (
                      <span className="text-[10px] text-zinc-500 py-1">
                        +{prompt.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}