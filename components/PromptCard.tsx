import React, { useState } from 'react';
import { Prompt, Category, ViewMode } from '../types';
import { Copy, Check, Edit, Trash2, Tag, Calendar, Star, FileText, Maximize2 } from 'lucide-react';

interface PromptCardProps {
  prompt: Prompt;
  category?: Category;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
  onTagClick: (tag: string) => void;
  selectedTag?: string | null;
  viewMode?: ViewMode;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onTemplateRequest?: (prompt: Prompt) => void;
  onExpand?: (prompt: Prompt) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ 
  prompt, 
  category, 
  onEdit, 
  onDelete, 
  onCopy, 
  onToggleFavorite,
  onTagClick,
  selectedTag,
  viewMode = 'grid',
  isSelected = false,
  onSelect,
  onTemplateRequest,
  onExpand,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (prompt.isTemplate && onTemplateRequest) {
      // For templates, open the variable modal instead of direct copy
      onTemplateRequest(prompt);
    } else {
      onCopy(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e as any).ctrlKey || (e as any).metaKey) {
      e.preventDefault();
      if (onSelect) {
        onSelect(prompt.id);
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        onClick={handleCardClick}
        className={`group bg-black-200 backdrop-blur-sm border rounded-lg p-3 flex items-center gap-4 transition-all duration-200 hover:shadow-lg hover:shadow-accent/10 cursor-pointer ${
          isSelected
            ? 'border-accent bg-accent/5 shadow-accent/20'
            : 'border-black-300 hover:border-accent'
        }`}
      >
        <div className="flex items-center gap-3 flex-shrink-0">
          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(prompt.id);
              }}
              className={`w-5 h-5 rounded border-2 transition-all ${
                isSelected
                  ? 'border-accent bg-accent flex items-center justify-center'
                  : 'border-gray-600 hover:border-accent'
              }`}
              title="Hold Ctrl and click to select multiple"
            >
              {isSelected && <span className="text-white text-xs font-bold">✓</span>}
            </button>
          )}
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleFavorite(prompt.id); }}
             className={`transition-colors ${prompt.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`}
             title="Toggle favorite"
           >
              <Star className="w-5 h-5" fill={prompt.isFavorite ? "currentColor" : "none"} />
           </button>
        </div>

        <div className="flex-1 min-w-0">
           <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-semibold text-zinc-100 truncate">{prompt.title}</h3>
              {prompt.isTemplate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950 text-blue-300 border border-blue-700">
                  <FileText className="w-3 h-3" />
                  Template
                </span>
              )}
              {category && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-black-300 text-zinc-300">
                   {category.name}
                </span>
              )}
           </div>
           <p className="text-sm text-zinc-400 truncate font-mono opacity-60">{prompt.content}</p>
        </div>

        <div className="hidden md:flex items-center gap-2 flex-shrink-0">
             {prompt.tags.slice(0, 3).map(tag => (
            <button 
              key={tag} 
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                selectedTag === tag 
                ? 'bg-accent text-black border-accent' 
                : 'bg-accent-light text-accent border-accent/20 hover:bg-accent/20 hover:border-accent/50'
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 pl-4 border-l border-black-300/50">
           <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
            <button
              onClick={(e) => { e.stopPropagation(); onExpand?.(prompt); }}
              className="p-2 text-zinc-400 hover:text-accent hover:bg-accent-light rounded transition-colors"
              title="Expand"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(prompt); }}
              className="p-2 text-zinc-400 hover:text-accent hover:bg-accent-light rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
           <button
            onClick={handleCopy}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/20'
            }`}
            title="Copy Prompt"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-black-200 backdrop-blur-sm border rounded-xl p-5 flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 cursor-pointer ${
        isSelected
          ? 'border-accent bg-accent/5 shadow-accent/20'
          : 'border-black-300 hover:border-accent'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
           {onSelect && (
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 onSelect(prompt.id);
               }}
               className={`w-5 h-5 rounded border-2 transition-all flex-shrink-0 ${
                 isSelected
                   ? 'border-accent bg-accent flex items-center justify-center'
                   : 'border-gray-600 hover:border-accent'
               }`}
               title="Hold Ctrl and click to select multiple"
             >
               {isSelected && <span className="text-white text-xs font-bold">✓</span>}
             </button>
           )}
           <div className="flex flex-col">
             <h3 className="text-lg font-semibold text-zinc-100 line-clamp-1" title={prompt.title}>
                {prompt.title}
             </h3>
             {prompt.isTemplate && (
               <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded text-[10px] font-medium bg-blue-950 text-blue-300 border border-blue-700 mt-1">
                 <FileText className="w-3 h-3" />
                 Template
               </span>
             )}
           </div>
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleFavorite(prompt.id); }}
             className={`transition-colors flex-shrink-0 ${prompt.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600 hover:text-yellow-400'}`}
             title="Toggle favorite"
           >
              <Star className="w-4 h-4" fill={prompt.isFavorite ? "currentColor" : "none"} />
           </button>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onExpand?.(prompt); }}
            className="p-1.5 text-zinc-400 hover:text-accent hover:bg-accent-light rounded transition-colors"
            title="Expand"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(prompt); }}
            className="p-1.5 text-zinc-400 hover:text-accent hover:bg-accent-light rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex-grow bg-black/30 rounded-lg p-3 mb-4 group/code border border-transparent hover:border-black-300 transition-colors">
        <p className="text-zinc-300 font-mono text-sm whitespace-pre-wrap line-clamp-4 overflow-hidden text-ellipsis">
          {prompt.content}
        </p>
        <div className="absolute inset-0 bg-gradient-to-t from-black-200/90 to-transparent pointer-events-none rounded-lg" />
      </div>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-2 mb-4">
          {category && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black-300 text-zinc-300">
               {category.name}
            </span>
          )}
          {prompt.tags.slice(0, 3).map(tag => (
            <button 
              key={tag} 
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border transition-colors ${
                selectedTag === tag 
                ? 'bg-accent text-black border-accent shadow-sm shadow-accent/50' 
                : 'bg-accent-light text-accent border-accent/20 hover:bg-accent/20 hover:border-accent/50'
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </button>
          ))}
          {prompt.tags.length > 3 && (
             <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-zinc-500">
               +{prompt.tags.length - 3}
             </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-black-300/50">
          <div className="flex items-center text-xs text-zinc-500">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(prompt.createdAt).toLocaleDateString()}
          </div>
          
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              copied
                ? 'bg-green-500/20 text-green-400'
                : 'bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
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
};

export default PromptCard;