import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Workflow, WorkflowRunState, WorkflowStepWithPrompt, TemplateFillValues } from '../types';

interface WorkflowRunnerModalProps {
  isOpen: boolean;
  workflow: Workflow | null;
  steps: WorkflowStepWithPrompt[];
  onClose: () => void;
}

const extractVariables = (content: string): string[] => {
  const matches = [...content.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1].trim());
  return [...new Set(matches.filter(Boolean))];
};

const renderTemplate = (content: string, values: TemplateFillValues): string => {
  return content.replace(/\{([^{}]+)\}/g, (_, key) => {
    const trimmedKey = String(key).trim();
    return values[trimmedKey] ?? `{${trimmedKey}}`;
  });
};

const WorkflowRunnerModal: React.FC<WorkflowRunnerModalProps> = ({
  isOpen,
  workflow,
  steps,
  onClose,
}) => {
  const [runState, setRunState] = useState<WorkflowRunState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && workflow) {
      setRunState({
        workflowId: workflow.id,
        currentStepIndex: 0,
        valuesByStepId: {},
      });
      setCopied(false);
    } else {
      setRunState(null);
      setCopied(false);
    }
  }, [isOpen, workflow]);

  // Reset copied state whenever the step changes
  useEffect(() => {
    setCopied(false);
  }, [runState?.currentStepIndex]);

  const currentStep = useMemo(() => {
    if (!runState) return null;
    return steps[runState.currentStepIndex] || null;
  }, [runState, steps]);

  const currentValues = useMemo(() => {
    if (!runState || !currentStep) return {};
    return runState.valuesByStepId[currentStep.step.id] || {};
  }, [runState, currentStep]);

  const variableNames = useMemo(() => {
    if (!currentStep) return [];
    if (!currentStep.prompt.isTemplate) return [];
    return extractVariables(currentStep.prompt.content);
  }, [currentStep]);

  const renderedContent = useMemo(() => {
    if (!currentStep) return '';
    if (!currentStep.prompt.isTemplate) return currentStep.prompt.content;
    return renderTemplate(currentStep.prompt.content, currentValues);
  }, [currentStep, currentValues]);

  if (!isOpen || !workflow || !runState) return null;

  const progress =
    steps.length > 0 ? ((runState.currentStepIndex + 1) / steps.length) * 100 : 0;

  const allVariablesFilled =
    !currentStep?.prompt.isTemplate ||
    variableNames.every((name) => (currentValues[name] || '').trim().length > 0);

  const updateValue = (name: string, value: string) => {
    if (!currentStep) return;
    setRunState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        valuesByStepId: {
          ...prev.valuesByStepId,
          [currentStep.step.id]: {
            ...(prev.valuesByStepId[currentStep.step.id] || {}),
            [name]: value,
          },
        },
      };
    });
  };

  const goPrevious = () => {
    setRunState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
      };
    });
  };

  const goNext = () => {
    if (!allVariablesFilled) return;
    setRunState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentStepIndex: Math.min(steps.length - 1, prev.currentStepIndex + 1),
      };
    });
  };

  const copyRenderedContent = () => {
    navigator.clipboard.writeText(renderedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex w-full max-w-2xl flex-col rounded-2xl border border-black-300 bg-black-100 shadow-2xl max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black-300 px-6 py-4 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">{workflow.name}</h2>
            <p className="text-sm text-zinc-400 mt-0.5">
              {steps.length === 0
                ? 'No steps available'
                : `Step ${runState.currentStepIndex + 1} of ${steps.length}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-zinc-400 transition hover:bg-black-200 hover:text-white flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        {steps.length > 0 && (
          <div className="h-1 w-full bg-black-300 flex-shrink-0">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {steps.length === 0 || !currentStep ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="text-lg font-medium text-white mb-2">No workflow steps to run</h3>
              <p className="text-sm text-zinc-400">
                Add prompts to this workflow before opening the runner.
              </p>
            </div>
          ) : (
            <>
              {/* Step title + type badge */}
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold text-white">
                    {currentStep.step.titleOverride?.trim() || currentStep.prompt.title}
                  </h3>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      currentStep.prompt.isTemplate
                        ? 'bg-accent-light text-accent'
                        : 'bg-black-300 text-zinc-400'
                    }`}
                  >
                    {currentStep.prompt.isTemplate ? 'Template step' : 'Prompt step'}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {currentStep.step.notes?.trim() && (
                <div className="rounded-xl border border-black-300 bg-black-200 px-4 py-3 text-sm text-zinc-400 italic">
                  {currentStep.step.notes}
                </div>
              )}

              {/* Template variables */}
              {currentStep.prompt.isTemplate ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Template Variables</h4>
                    <p className="text-xs text-zinc-500">
                      Fill all variables for this step before moving forward.
                    </p>
                  </div>

                  {variableNames.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      No variables were detected in this template.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {variableNames.map((name) => (
                        <div key={name}>
                          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                            {name}
                          </label>
                          <input
                            type="text"
                            value={currentValues[name] || ''}
                            onChange={(e) => updateValue(name, e.target.value)}
                            placeholder={`Enter ${name}`}
                            className="w-full rounded-lg border border-black-300 bg-black-200 px-4 py-3 text-sm text-zinc-100 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-black-300 bg-black-200 px-4 py-3">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">
                    Step Info
                  </p>
                  <p className="text-sm text-zinc-400">
                    This step uses a standard prompt and does not require template inputs.
                  </p>
                </div>
              )}

              {/* Rendered output */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">Rendered Output</h4>
                  <button
                    onClick={copyRenderedContent}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      copied
                        ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                        : 'bg-black-200 text-zinc-400 hover:text-accent hover:bg-accent-light border border-black-300'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="rounded-xl border border-black-300 bg-black-200 px-4 py-4 text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {renderedContent}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer navigation */}
        {steps.length > 0 && currentStep && (
          <div className="flex items-center justify-between border-t border-black-300 px-6 py-4 flex-shrink-0">
            <button
              onClick={goPrevious}
              disabled={runState.currentStepIndex === 0}
              className="flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              onClick={goNext}
              disabled={
                runState.currentStepIndex === steps.length - 1 || !allVariablesFilled
              }
              className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowRunnerModal;