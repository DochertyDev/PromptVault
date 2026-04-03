import React, { useEffect, useMemo, useState } from 'react';
import { Copy, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && workflow) {
      setRunState({
        workflowId: workflow.id,
        currentStepIndex: 0,
        valuesByStepId: {},
      });
    } else {
      setRunState(null);
    }
  }, [isOpen, workflow]);

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

  const progress = steps.length > 0 ? ((runState.currentStepIndex + 1) / steps.length) * 100 : 0;
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
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-black-300 bg-black-100 shadow-2xl">
        <div className="border-b border-black-300 px-6 py-4">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">{workflow.name}</h2>
              <p className="text-sm text-zinc-400">
                {steps.length === 0
                  ? 'No steps available'
                  : `Step ${runState.currentStepIndex + 1} of ${steps.length}`}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-black-200 hover:text-white"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-black-200">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {steps.length === 0 || !currentStep ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <Play className="mb-4 h-10 w-10 text-zinc-500" />
            <h3 className="mb-2 text-xl font-semibold text-white">No workflow steps to run</h3>
            <p className="text-sm text-zinc-400">
              Add prompts to this workflow before opening the runner.
            </p>
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[360px_1fr]">
            <div className="overflow-y-auto border-b border-black-300 p-6 lg:border-b-0 lg:border-r lg:border-black-300">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-white">
                  {currentStep.step.titleOverride?.trim() || currentStep.prompt.title}
                </h3>
                <p className="mt-1 text-sm text-zinc-400">
                  {currentStep.prompt.isTemplate ? 'Template step' : 'Prompt step'}
                </p>
              </div>

              {currentStep.step.notes?.trim() && (
                <div className="mb-5 rounded-xl border border-black-300 bg-black-200 p-4">
                  <p className="text-sm text-zinc-300">{currentStep.step.notes}</p>
                </div>
              )}

              {currentStep.prompt.isTemplate ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-white">Template Variables</h4>
                    <p className="text-sm text-zinc-400">
                      Fill all variables for this step before moving forward.
                    </p>
                  </div>

                  {variableNames.length === 0 ? (
                    <div className="rounded-xl border border-black-300 bg-black-200 p-4 text-sm text-zinc-400">
                      No variables were detected in this template.
                    </div>
                  ) : (
                    variableNames.map((name) => (
                      <div key={name}>
                        <label className="mb-2 block text-sm font-medium text-zinc-200">
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
                    ))
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-black-300 bg-black-200 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-white">Step Info</h4>
                  <p className="text-sm text-zinc-400">
                    This step uses a standard prompt and does not require template inputs.
                  </p>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-black-300 px-6 py-4">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                    Rendered Output
                  </h4>
                </div>

                <button
                  onClick={copyRenderedContent}
                  className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                <div className="whitespace-pre-wrap rounded-xl border border-black-300 bg-black-200 p-5 text-sm leading-7 text-zinc-200">
                  {renderedContent}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black-300 px-6 py-4">
                <button
                  onClick={goPrevious}
                  disabled={runState.currentStepIndex === 0}
                  className="inline-flex items-center gap-2 rounded-lg border border-black-300 bg-black-200 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-black-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={goNext}
                  disabled={
                    runState.currentStepIndex === steps.length - 1 || !allVariablesFilled
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowRunnerModal;