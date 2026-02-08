import { useState } from 'react';
import { X, Copy, AlertCircle } from 'lucide-react';

interface TemplateVariableModalProps {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onSubmit: (filledContent: string) => void;
}

export function TemplateVariableModal({
  isOpen,
  content,
  onClose,
  onSubmit,
}: TemplateVariableModalProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Extract all {variableName} placeholders using regex
  const placeholderRegex = /\{([^}]+)\}/g;
  const extractedVars = new Set<string>();
  let match;

  while ((match = placeholderRegex.exec(content)) !== null) {
    extractedVars.add(match[1]);
  }

  const varNames = Array.from(extractedVars);

  const handleUpdate = (varName: string, value: string) => {
    setVariables((prev) => ({
      ...prev,
      [varName]: value,
    }));
  };

  const handleSubmit = () => {
    let filledContent = content;

    // Replace all {variable} with their values
    varNames.forEach((varName) => {
      const value = variables[varName] || '';
      filledContent = filledContent.replace(
        new RegExp(`\\{${varName}\\}`, 'g'),
        value
      );
    });

    // Copy to clipboard
    navigator.clipboard.writeText(filledContent).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    });

    onSubmit(filledContent);
  };

  const handleCopyAsIs = () => {
    // Copy template without replacing variables
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    });

    onSubmit(content);
  };

  const allFilled = varNames.every((v) => variables[v]?.trim());

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black-300">
          <h2 className="text-xl font-bold text-white">Fill Template Variables</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {varNames.length === 0 ? (
            <div className="flex items-start gap-3 p-4 bg-yellow-950/30 border border-yellow-800/30 rounded-lg text-yellow-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>No variables found. Copying template directly...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-zinc-300">
                Enter values for the {varNames.length} variable
                {varNames.length !== 1 ? 's' : ''} in this template:
              </p>

              {varNames.map((varName) => (
                <div key={varName} className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300">
                    {varName}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${varName}...`}
                    value={variables[varName] || ''}
                    onChange={(e) => handleUpdate(varName, e.target.value)}
                    className="w-full bg-black-200 border border-black-300 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black-300 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-black-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCopyAsIs}
            className="px-4 py-2 rounded-lg text-zinc-300 border border-black-300 hover:bg-black-200 transition-colors font-medium flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy as-is
          </button>
          <button
            onClick={handleSubmit}
            disabled={varNames.length > 0 && !allFilled}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {copied ? (
              <>
                <Copy className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy with Variables
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
