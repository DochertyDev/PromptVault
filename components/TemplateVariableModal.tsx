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

  const allFilled = varNames.every((v) => variables[v]?.trim());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black-200 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-black-300">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Copy className="w-5 h-5 text-accent" />
            Fill Template Variables
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {varNames.length === 0 ? (
            <div className="flex items-start gap-3 p-3 bg-black-300 rounded text-yellow-500 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>No variables found. Copying template directly...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-400 mb-4">
                Enter values for the {varNames.length} variable
                {varNames.length !== 1 ? 's' : ''} in this template:
              </p>

              {varNames.map((varName) => (
                <div key={varName}>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {varName}
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${varName}...`}
                    value={variables[varName] || ''}
                    onChange={(e) => handleUpdate(varName, e.target.value)}
                    className="w-full px-3 py-2 bg-black-300 border border-black-400 rounded text-white placeholder-gray-500 focus:outline-none focus:border-accent transition"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-black-300">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded hover:border-gray-500 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={varNames.length > 0 && !allFilled}
            className="flex-1 px-4 py-2 bg-accent text-white rounded font-medium hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Copy className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Template
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
