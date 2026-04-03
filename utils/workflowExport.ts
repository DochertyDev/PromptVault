import { Category, Prompt, Workflow, WorkflowStep } from '../types';

const getDateStamp = (): string => {
  return new Date().toISOString().split('T')[0];
};

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const escapeCsvField = (value: string | number | boolean): string => {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const buildCsvRows = (
  workflowsToExport: Workflow[],
  allWorkflowSteps: WorkflowStep[],
  prompts: Prompt[],
  categories: Category[]
): string => {
  const promptMap = new Map(prompts.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const headers = [
    'workflow_name',
    'workflow_description',
    'workflow_created_at',
    'workflow_updated_at',
    'step_order',
    'step_title_override',
    'step_notes',
    'prompt_title',
    'prompt_content',
    'prompt_tags',
    'prompt_category',
    'prompt_is_template',
    'prompt_is_favorite',
  ];

  const rows: string[] = [headers.join(',')];

  for (const workflow of workflowsToExport) {
    const steps = allWorkflowSteps
      .filter((step) => step.workflowId === workflow.id)
      .sort((a, b) => a.order - b.order);

    if (steps.length === 0) {
      // Export workflow with no steps as a single row so it survives round-trip
      rows.push(
        [
          escapeCsvField(workflow.name),
          escapeCsvField(workflow.description ?? ''),
          escapeCsvField(new Date(workflow.createdAt).toISOString()),
          escapeCsvField(new Date(workflow.updatedAt).toISOString()),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ].join(',')
      );
      continue;
    }

    for (const step of steps) {
      const prompt = promptMap.get(step.promptId);
      if (!prompt) continue;

      const categoryName = prompt.categoryId
        ? categoryMap.get(prompt.categoryId) || ''
        : '';

      rows.push(
        [
          escapeCsvField(workflow.name),
          escapeCsvField(workflow.description ?? ''),
          escapeCsvField(new Date(workflow.createdAt).toISOString()),
          escapeCsvField(new Date(workflow.updatedAt).toISOString()),
          escapeCsvField(step.order),
          escapeCsvField(step.titleOverride ?? ''),
          escapeCsvField(step.notes ?? ''),
          escapeCsvField(prompt.title),
          escapeCsvField(prompt.content),
          escapeCsvField(prompt.tags.join(';')),
          escapeCsvField(categoryName),
          escapeCsvField(prompt.isTemplate ? 'true' : 'false'),
          escapeCsvField(prompt.isFavorite ? 'true' : 'false'),
        ].join(',')
      );
    }
  }

  return rows.join('\n');
};

const downloadCsv = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const exportWorkflowAsCsv = (
  workflow: Workflow,
  allWorkflowSteps: WorkflowStep[],
  prompts: Prompt[],
  categories: Category[]
): void => {
  const csv = buildCsvRows([workflow], allWorkflowSteps, prompts, categories);
  const filename = `workflow-${slugify(workflow.name || 'workflow')}-${getDateStamp()}.csv`;
  downloadCsv(csv, filename);
};

export const exportAllWorkflowsAsCsv = (
  workflows: Workflow[],
  allWorkflowSteps: WorkflowStep[],
  prompts: Prompt[],
  categories: Category[]
): void => {
  const orderedWorkflows = [...workflows].sort((a, b) => a.name.localeCompare(b.name));
  const csv = buildCsvRows(orderedWorkflows, allWorkflowSteps, prompts, categories);
  const filename = `promptvault-workflows-${getDateStamp()}.csv`;
  downloadCsv(csv, filename);
};