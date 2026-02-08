import React from 'react';
import { FolderOpen, Tag, FileText, ArrowRight } from 'lucide-react';
import { Prompt, Category } from '../types';
import { GroupedSearchResults } from '../utils/searchPrompts';

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
      <div className="fixed top-[180px] left-72 right-8 bg-black-100 border border-black-300 rounded-lg shadow-xl z-40 p-8 text-center">
        <FileText className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
        <p className="text-zinc-400">No results found for "{searchQuery}"</p>
        <p className="text-xs text-zinc-500 mt-1">Try different keywords or filters</p>
      </div>
    );
  }

  return (
    <div className="fixed top-[180px] left-72 right-8 bg-black-100 border border-black-300 rounded-lg shadow-xl z-40 max-h-[calc(100vh-220px)] overflow-y-auto">
      {/* Categories Section */}
      {results.categories.length > 0 && (
        <div className="border-b border-black-300">
          <div className="px-6 py-3 bg-black-200">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-zinc-300">
                Categories ({results.categories.length})
              </h3>
            </div>
          </div>
          <div className="divide-y divide-black-300">
            {results.categories.map(category => (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className="w-full px-6 py-3 text-left hover:bg-black-200 transition-colors flex items-center justify-between group"
              >
                <span className="text-zinc-200">{category.name}</span>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-accent transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Section */}
      {results.tags.length > 0 && (
        <div className="border-b border-black-300">
          <div className="px-6 py-3 bg-black-200">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-zinc-300">
                Tags ({results.tags.length})
              </h3>
            </div>
          </div>
          <div className="divide-y divide-black-300">
            {results.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="w-full px-6 py-3 text-left hover:bg-black-200 transition-colors flex items-center justify-between group"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
                  <span className="text-zinc-200">{tag}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-accent transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompts Section */}
      {results.prompts.length > 0 && (
        <div>
          <div className="px-6 py-3 bg-black-200">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-zinc-300">
                Prompts ({results.prompts.length})
              </h3>
            </div>
          </div>
          <div className="divide-y divide-black-300 max-h-64 overflow-y-auto">
            {results.prompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => onSelectPrompt?.(prompt)}
                className="w-full px-6 py-3 text-left hover:bg-black-200 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white group-hover:text-accent transition-colors truncate">
                      {prompt.title}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-1 mt-1">
                      {prompt.content}
                    </p>
                    {prompt.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {prompt.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-0.5 rounded text-[10px] bg-accent/10 text-accent border border-accent/20"
                          >
                            {tag}
                          </span>
                        ))}
                        {prompt.tags.length > 2 && (
                          <span className="text-[10px] text-zinc-500">
                            +{prompt.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
