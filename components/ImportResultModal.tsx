import React from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ImportResult } from '../utils/csvImport';

interface ImportResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ImportResult | null;
  promptsImported: number;
}

const ImportResultModal: React.FC<ImportResultModalProps> = ({
  isOpen,
  onClose,
  result,
  promptsImported
}) => {
  if (!isOpen || !result) return null;

  const hasErrors = result.errors.length > 0;
  const hasWarnings = result.warnings.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black-100 border border-black-300 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-black-300">
          <div className="flex items-center gap-3">
            {result.success && !hasWarnings ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : hasErrors ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            )}
            <h2 className="text-xl font-bold text-white">
              {hasErrors ? 'Import Failed' : 'Import Complete'}
            </h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Summary */}
          <div className={`p-4 rounded-lg border ${
            hasErrors 
              ? 'bg-red-500/10 border-red-500/20' 
              : 'bg-green-500/10 border-green-500/20'
          }`}>
            <p className={`text-sm font-medium ${hasErrors ? 'text-red-400' : 'text-green-400'}`}>
              {promptsImported} prompt{promptsImported !== 1 ? 's' : ''} imported successfully
            </p>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Errors ({result.errors.length})
              </h3>
              <ul className="space-y-1 text-sm text-red-300 bg-red-500/5 p-3 rounded border border-red-500/20">
                {result.errors.map((error, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-red-400 flex-shrink-0">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Warnings ({result.warnings.length})
              </h3>
              <ul className="space-y-1 text-sm text-yellow-300 bg-yellow-500/5 p-3 rounded border border-yellow-500/20">
                {result.warnings.map((warning, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-yellow-400 flex-shrink-0">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-black-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent hover:bg-accent-hover text-black rounded-lg font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportResultModal;
