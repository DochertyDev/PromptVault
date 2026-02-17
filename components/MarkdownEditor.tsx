import React, { useState, useRef } from 'react';
import { Eye, Edit2 } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import '../styles/markdown.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type EditorLayout = 'split' | 'edit' | 'preview';

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter your content here...',
}) => {
  const [layout, setLayout] = useState<EditorLayout>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Handle synchronized scrolling
  const handleEditScroll = () => {
    if (!textareaRef.current || !previewRef.current || layout !== 'split') return;

    isSyncingRef.current = true;
    const scrollPercentage =
      textareaRef.current.scrollTop /
      (textareaRef.current.scrollHeight - textareaRef.current.clientHeight);

    previewRef.current.scrollTop =
      scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  };

  const handlePreviewScroll = () => {
    if (!textareaRef.current || !previewRef.current || layout !== 'split') return;

    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    const scrollPercentage =
      previewRef.current.scrollHeight > previewRef.current.clientHeight
        ? previewRef.current.scrollTop /
          (previewRef.current.scrollHeight - previewRef.current.clientHeight)
        : 0;

    textareaRef.current.scrollTop =
      scrollPercentage * (textareaRef.current.scrollHeight - textareaRef.current.clientHeight);

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  };

  const layoutButtons = [
    { value: 'edit' as const, label: 'Edit', icon: Edit2 },
    { value: 'split' as const, label: 'Split', icon: null },
    { value: 'preview' as const, label: 'Preview', icon: Eye },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-300">Prompt Content</label>
        <div className="flex items-center gap-1 p-0.5 bg-black-200 border border-black-300 rounded-lg">
          {layoutButtons.map((btn) => (
            <button
              key={btn.value}
              type="button"
              onClick={() => setLayout(btn.value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded transition-all text-xs font-medium ${
                layout === btn.value
                  ? 'bg-accent/20 text-accent border border-accent/50'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
              title={btn.label}
            >
              {btn.icon && <btn.icon className="w-3.5 h-3.5" />}
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-black-200 border border-black-300 rounded-lg overflow-hidden">
        {layout === 'edit' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-64 bg-black-200 p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset transition-all resize-none leading-relaxed"
          />
        )}

        {layout === 'preview' && (
          <div className="w-full min-h-64 bg-black-200/50 p-4 overflow-y-auto">
            <MarkdownRenderer content={value} className="text-sm" />
          </div>
        )}

        {layout === 'split' && (
          <div className="flex h-96 divide-x divide-black-300">
            {/* Edit pane */}
            <div className="flex-1 flex flex-col min-w-0">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleEditScroll}
                placeholder={placeholder}
                className="flex-1 bg-black-200 p-4 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset transition-all resize-none leading-relaxed overflow-y-auto"
              />
            </div>

            {/* Preview pane */}
            <div
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="flex-1 overflow-y-auto bg-black-300/30 p-4"
            >
              <MarkdownRenderer content={value} className="text-sm" />
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-zinc-500 px-1">
        {layout === 'edit' && 'Edit mode: Markdown formatting is supported.'}
        {layout === 'preview' && 'Preview mode: See how your markdown will look.'}
        {layout === 'split' && 'Split mode: Edit on left, preview on right. Scrolling is synchronized.'}
      </p>
    </div>
  );
};
