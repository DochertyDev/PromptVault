import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import { WorkflowImportResult } from '../utils/workflowImport';

interface WorkflowImportResultModalProps {
  isOpen: boolean;
  result: WorkflowImportResult | null;
  onClose: () => void;
}

const WorkflowImportResultModal: React.FC<WorkflowImportResultModalProps> = ({
  isOpen,
  result,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  const success = result.success && result.workflowsImported > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-black-300 bg-black-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-black-300 px-6 py-4">
          <div className="flex items-center gap-3">
            {success ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <h2 className="text-xl font-semibold text-white">
              {success ? 'Import Successful' : 'Import Failed'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          {result.workflowsImported > 0 && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300 space-y-1">
              <p>{result.workflowsImported} {result.workflowsImported === 1 ? 'workflow' : 'workflows'} imported</p>
              <p>{result.stepsImported} {result.stepsImported === 1 ? 'step' : 'steps'} imported</p>
              {result.promptsCreated > 0 && (
                <p>{result.promptsCreated} new {result.promptsCreated === 1 ? 'prompt' : 'prompts'} created from step data</p>
              )}
            </div>
          )}

          {result.errors.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-red-400">
                Errors ({result.errors.length})
              </p>
              <ul className="space-y-2">
                {result.errors.map((error, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold text-yellow-400">
                Warnings ({result.warnings.length})
              </p>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {result.warnings.map((warning, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-300"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-black-300 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowImportResultModal;