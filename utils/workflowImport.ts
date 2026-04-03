import { Category, Prompt, Workflow, WorkflowStep } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseCSV } from './csvImport';

export interface WorkflowImportResult {
  success: boolean;
  workflowsImported: number;
  stepsImported: number;
  promptsCreated: number;
  errors: string[];
  warnings: string[];
}

export function importWorkflowsFromCSV(
  csvContent: string,
  existingWorkflows: Workflow[],
  existingWorkflowSteps: WorkflowStep[],
  existingPrompts: Prompt[],
  existingCategories: Category[]
): {
  workflows: Workflow[];
  workflowSteps: WorkflowStep[];
  prompts: Prompt[];
  categories: Category[];
  result: WorkflowImportResult;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const newWorkflows: Workflow[] = [...existingWorkflows];
  const newWorkflowSteps: WorkflowStep[] = [...existingWorkflowSteps];
  const newPrompts: Prompt[] = [...existingPrompts];
  const newCategories: Category[] = [...existingCategories];

  let workflowsImported = 0;
  let stepsImported = 0;
  let promptsCreated = 0;

  try {
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      errors.push('CSV file is empty');
      return {
        workflows: newWorkflows,
        workflowSteps: newWorkflowSteps,
        prompts: newPrompts,
        categories: newCategories,
        result: { success: false, workflowsImported: 0, stepsImported: 0, promptsCreated: 0, errors, warnings },
      };
    }

    const headers = rows[0].map((h) => h.toLowerCase().trim());

    const col = (name: string) => headers.indexOf(name);

    const idxWorkflowName = col('workflow_name');
    const idxWorkflowDesc = col('workflow_description');
    const idxStepOrder = col('step_order');
    const idxStepTitleOverride = col('step_title_override');
    const idxStepNotes = col('step_notes');
    const idxPromptTitle = col('prompt_title');
    const idxPromptContent = col('prompt_content');
    const idxPromptTags = col('prompt_tags');
    const idxPromptCategory = col('prompt_category');
    const idxPromptIsTemplate = col('prompt_is_template');
    const idxPromptIsFavorite = col('prompt_is_favorite');

    if (idxWorkflowName === -1 || idxPromptTitle === -1) {
      errors.push('CSV must contain "workflow_name" and "prompt_title" columns. Make sure you are importing a workflow CSV, not a prompt CSV.');
      return {
        workflows: newWorkflows,
        workflowSteps: newWorkflowSteps,
        prompts: newPrompts,
        categories: newCategories,
        result: { success: false, workflowsImported: 0, stepsImported: 0, promptsCreated: 0, errors, warnings },
      };
    }

    // Build lookup maps
    const categoryMap = new Map(newCategories.map((c) => [c.name.toLowerCase(), c.id]));
    const promptLookup = new Map(newPrompts.map((p) => [p.title.toLowerCase(), p.id]));

    // Group rows by workflow_name preserving order
    const workflowRowMap = new Map<string, { desc: string; rows: typeof rows }>();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const workflowName = row[idxWorkflowName]?.trim();
      if (!workflowName) continue;

      if (!workflowRowMap.has(workflowName)) {
        workflowRowMap.set(workflowName, {
          desc: idxWorkflowDesc >= 0 ? row[idxWorkflowDesc]?.trim() || '' : '',
          rows: [],
        });
      }

      workflowRowMap.get(workflowName)!.rows.push(row);
    }

    const existingWorkflowNames = new Set(existingWorkflows.map((w) => w.name.toLowerCase()));

    for (const [workflowName, { desc, rows: stepRows }] of workflowRowMap.entries()) {
      const now = Date.now();

      // Warn but still import if a workflow with this name already exists
      if (existingWorkflowNames.has(workflowName.toLowerCase())) {
        warnings.push(`A workflow named "${workflowName}" already exists. Importing as a duplicate.`);
      }

      const newWorkflow: Workflow = {
        id: uuidv4(),
        name: workflowName,
        description: desc,
        createdAt: now,
        updatedAt: now,
      };

      newWorkflows.push(newWorkflow);
      workflowsImported++;

      // Sort step rows by step_order if available
      const sortedStepRows = [...stepRows].sort((a, b) => {
        const orderA = idxStepOrder >= 0 ? parseInt(a[idxStepOrder] || '0', 10) : 0;
        const orderB = idxStepOrder >= 0 ? parseInt(b[idxStepOrder] || '0', 10) : 0;
        return orderA - orderB;
      });

      let stepOrder = 1;

      for (const row of sortedStepRows) {
        const promptTitle = row[idxPromptTitle]?.trim();
        const promptContent = idxPromptContent >= 0 ? row[idxPromptContent]?.trim() : '';

        if (!promptTitle) {
          warnings.push(`Workflow "${workflowName}": Skipped a step with no prompt title.`);
          continue;
        }

        // Find existing prompt by title (case-insensitive) or create a new one
        let promptId = promptLookup.get(promptTitle.toLowerCase());

        if (!promptId) {
          if (!promptContent) {
            warnings.push(`Workflow "${workflowName}" step ${stepOrder}: Prompt "${promptTitle}" not found and has no content to create from. Step skipped.`);
            continue;
          }

          // Resolve category
          let categoryId = '';
          const categoryName = idxPromptCategory >= 0 ? row[idxPromptCategory]?.trim() : '';
          if (categoryName && categoryName !== 'Uncategorized') {
            const existingCategoryId = categoryMap.get(categoryName.toLowerCase());
            if (existingCategoryId) {
              categoryId = existingCategoryId;
            } else {
              const newCategoryId = uuidv4();
              newCategories.push({ id: newCategoryId, name: categoryName });
              categoryMap.set(categoryName.toLowerCase(), newCategoryId);
              categoryId = newCategoryId;
              warnings.push(`Created new category: "${categoryName}"`);
            }
          }

          // Parse tags
          const tagsStr = idxPromptTags >= 0 ? row[idxPromptTags]?.trim() : '';
          const tags = tagsStr
            ? tagsStr.split(';').map((t) => t.trim()).filter((t) => t.length > 0)
            : [];

          const isTemplate = idxPromptIsTemplate >= 0
            ? row[idxPromptIsTemplate]?.toLowerCase() === 'true'
            : false;

          const isFavorite = idxPromptIsFavorite >= 0
            ? row[idxPromptIsFavorite]?.toLowerCase() === 'true'
            : false;

          const newPrompt: Prompt = {
            id: uuidv4(),
            title: promptTitle,
            content: promptContent,
            categoryId,
            tags,
            isFavorite,
            isTemplate,
            createdAt: now,
            updatedAt: now,
          };

          newPrompts.push(newPrompt);
          promptLookup.set(promptTitle.toLowerCase(), newPrompt.id);
          promptId = newPrompt.id;
          promptsCreated++;
        }

        const newStep: WorkflowStep = {
          id: uuidv4(),
          workflowId: newWorkflow.id,
          promptId,
          order: stepOrder,
          titleOverride: idxStepTitleOverride >= 0 ? row[idxStepTitleOverride]?.trim() || undefined : undefined,
          notes: idxStepNotes >= 0 ? row[idxStepNotes]?.trim() || undefined : undefined,
        };

        newWorkflowSteps.push(newStep);
        stepsImported++;
        stepOrder++;
      }
    }

    return {
      workflows: newWorkflows,
      workflowSteps: newWorkflowSteps,
      prompts: newPrompts,
      categories: newCategories,
      result: {
        success: errors.length === 0,
        workflowsImported,
        stepsImported,
        promptsCreated,
        errors,
        warnings,
      },
    };
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      workflows: newWorkflows,
      workflowSteps: newWorkflowSteps,
      prompts: newPrompts,
      categories: newCategories,
      result: { success: false, workflowsImported: 0, stepsImported: 0, promptsCreated: 0, errors, warnings },
    };
  }
}