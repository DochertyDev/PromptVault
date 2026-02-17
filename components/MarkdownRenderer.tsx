import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Helper function to highlight template variables in text
const highlightVariables = (text: string) => {
  const parts = text.split(/(\{[^}]+\})/g);
  return parts.map((part, index) => {
    if (part.match(/^\{[^}]+\}$/)) {
      return (
        <span
          key={index}
          className="bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded border border-yellow-500/30 font-mono text-sm"
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ 
  content, 
  className = '' 
}) => {
  if (!content || !content.trim()) {
    return <div className={className}>No content</div>;
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Ensure links open in new tabs with security attributes
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline"
            />
          ),
          // Style code blocks
          code: ({ node, inline, children, className, ...props }) => {
            if (inline) {
              return (
                <code
                  {...props}
                  className="bg-black-300 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-sm"
                >
                  {typeof children === 'string'
                    ? highlightVariables(children as string)
                    : children}
                </code>
              );
            }
            // For code blocks, don't try to highlight variables - just render the code
            return (
              <code {...props} className={`${className || 'hljs'}`}>
                {children}
              </code>
            );
          },
          // Style pre blocks
          pre: ({ node, children, ...props }) => (
            <pre
              {...props}
              className="bg-black-300 border border-black-400 rounded-lg p-4 overflow-x-auto my-4 text-sm"
            >
              {children}
            </pre>
          ),
          // Style headers
          h1: ({ node, children, ...props }) => (
            <h1 {...props} className="text-3xl font-bold mt-6 mb-4 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 {...props} className="text-2xl font-bold mt-5 mb-3 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 {...props} className="text-xl font-bold mt-4 mb-3 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h3>
          ),
          h4: ({ node, children, ...props }) => (
            <h4 {...props} className="text-lg font-bold mt-3 mb-2 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h4>
          ),
          h5: ({ node, children, ...props }) => (
            <h5 {...props} className="text-base font-bold mt-3 mb-2 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h5>
          ),
          h6: ({ node, children, ...props }) => (
            <h6 {...props} className="text-sm font-bold mt-3 mb-2 text-white">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </h6>
          ),
          // Style paragraphs
          p: ({ node, children, ...props }) => (
            <p {...props} className="mb-4 leading-relaxed text-zinc-200">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </p>
          ),
          // Style lists
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside mb-4 text-zinc-200 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside mb-4 text-zinc-200 space-y-1" />
          ),
          li: ({ node, children, ...props }) => (
            <li {...props} className="ml-2">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </li>
          ),
          // Style blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-accent pl-4 py-2 my-4 italic text-zinc-300 bg-black-300/50 rounded-r"
            />
          ),
          // Style tables
          table: ({ node, ...props }) => (
            <table
              {...props}
              className="border-collapse border border-black-400 my-4 w-full text-sm"
            />
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-black-300 border-b border-black-400" />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} className="divide-y divide-black-400" />
          ),
          tr: ({ node, ...props }) => (
            <tr {...props} className="border-b border-black-400 hover:bg-black-300/50" />
          ),
          td: ({ node, children, ...props }) => (
            <td {...props} className="px-3 py-2 text-zinc-200">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </td>
          ),
          th: ({ node, children, ...props }) => (
            <th {...props} className="px-3 py-2 text-left font-semibold text-zinc-100">
              {typeof children === 'string'
                ? highlightVariables(children as string)
                : children}
            </th>
          ),
          // Style horizontal rules
          hr: ({ node, ...props }) => (
            <hr {...props} className="my-6 border-t border-black-400" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
