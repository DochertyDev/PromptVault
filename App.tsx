import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PromptCard from './components/PromptCard';
import { CombinedPromptModal } from './components/CombinedPromptModal';
import ImportResultModal from './components/ImportResultModal';
import { TemplateVariableModal } from './components/TemplateVariableModal';
import { BulkActionsBar } from './components/BulkActionsBar';
import { BulkTagsModal } from './components/BulkTagsModal';
import { BulkMoveModal } from './components/BulkMoveModal';
import WorkflowList from './components/WorkflowList';
import WorkflowDetail from './components/WorkflowDetail';
import WorkflowEditorModal from './components/WorkflowEditorModal';
import AddPromptToWorkflowModal from './components/AddPromptToWorkflowModal';
import WorkflowRunnerModal from './components/WorkflowRunnerModal';
import WorkflowImportResultModal from './components/WorkflowImportResultModal';
import useIndexedDB from './hooks/useIndexedDB';
import {
  Prompt,
  Category,
  SortOption,
  MainView,
  Workflow,
  WorkflowStep,
  WorkflowStepWithPrompt,
} from './types';
import {
  Plus,
  Search,
  LayoutGrid,
  List as ListIcon,
  Star,
  Filter,
  XCircle,
  Download,
  Upload,
  GitBranch,
} from 'lucide-react';
import { CustomSelect } from './components/CustomSelect';
import { v4 as uuidv4 } from 'uuid';
import { generateCSVWithTimestamp, generateCSVWithTimestampForSelected } from './utils/csvExport';
import { importPromptsFromCSV, handleCSVFileUpload, ImportResult } from './utils/csvImport';
import { searchByQuery } from './utils/searchPrompts';
import { GroupedSearchResultsComponent } from './components/GroupedSearchResults';
import { exportWorkflowAsCsv, exportAllWorkflowsAsCsv } from './utils/workflowExport';
import { importWorkflowsFromCSV, WorkflowImportResult } from './utils/workflowImport';

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Coding' },
  { id: '2', name: 'Writing' },
  { id: '3', name: 'Marketing' },
  { id: '4', name: 'Productivity' },
];

const INITIAL_PROMPTS: Prompt[] = [
  {
    id: '101',
    title: 'React Component Generator',
    content:
      'Create a functional React component using TypeScript and Tailwind CSS. The component should be responsive and accessible. Include interface definitions for props.',
    categoryId: '1',
    tags: ['react', 'typescript', 'frontend'],
    isFavorite: true,
    isTemplate: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '102',
    title: 'Blog Post Outline',
    content:
      'Write a detailed outline for a blog post about {topic}. Include a catchy title, introduction with a hook, 3 main section headers with bullet points, and a conclusion with a call to action.',
    categoryId: '2',
    tags: ['blog', 'content', 'seo'],
    isFavorite: false,
    isTemplate: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const reindexWorkflowSteps = (steps: WorkflowStep[]): WorkflowStep[] => {
  const groups = new Map<string, WorkflowStep[]>();

  steps.forEach((step) => {
    if (!groups.has(step.workflowId)) {
      groups.set(step.workflowId, []);
    }
    groups.get(step.workflowId)!.push(step);
  });

  return Array.from(groups.values()).flatMap((group) =>
    [...group]
      .sort((a, b) => a.order - b.order)
      .map((step, index) => ({
        ...step,
        order: index + 1,
      }))
  );
};

const App: React.FC = () => {
  const [categories, setCategories] = useIndexedDB<Category[]>('pv_categories', INITIAL_CATEGORIES);
  const [prompts, setPrompts] = useIndexedDB<Prompt[]>('pv_prompts', INITIAL_PROMPTS);
  const [workflows, setWorkflows] = useIndexedDB<Workflow[]>('pv_workflows', []);
  const [workflowSteps, setWorkflowSteps] = useIndexedDB<WorkflowStep[]>('pv_workflow_steps', []);

  const [mainView, setMainView] = useState<MainView>('prompts');

  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showImportResult, setShowImportResult] = useState(false);
  const [importedPromptsCount, setImportedPromptsCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [workflowImportResult, setWorkflowImportResult] = useState<WorkflowImportResult | null>(null);
  const [showWorkflowImportResult, setShowWorkflowImportResult] = useState(false);
  const workflowFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptModalPrompt, setPromptModalPrompt] = useState<Prompt | null>(null);
  const [promptModalMode, setPromptModalMode] = useState<'view' | 'edit'>('view');
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());
  const [showTemplateVariableModal, setShowTemplateVariableModal] = useState(false);
  const [templateToFill, setTemplateFill] = useState<Prompt | null>(null);
  const [showBulkTagsModal, setShowBulkTagsModal] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [showWorkflowEditor, setShowWorkflowEditor] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState<Workflow | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [showAddPromptToWorkflowModal, setShowAddPromptToWorkflowModal] = useState(false);
  const [workflowIdForPromptAdd, setWorkflowIdForPromptAdd] = useState<string | null>(null);
  const [runningWorkflow, setRunningWorkflow] = useState<Workflow | null>(null);
  const [pendingSelectedPromptIds, setPendingSelectedPromptIds] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedPromptIds.size > 0) {
        setSelectedPromptIds(new Set());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPromptIds.size]);

  const promptMap = useMemo(() => {
    return new Map(prompts.map((prompt) => [prompt.id, prompt]));
  }, [prompts]);

  const groupedSearchResults = useMemo(() => {
    return searchByQuery(searchQuery, prompts, categories);
  }, [searchQuery, prompts, categories]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const relevantPrompts = selectedCategoryId
      ? prompts.filter((p) => {
          if (selectedCategoryId === 'uncategorized') {
            return !p.categoryId || !categories.find((c) => c.id === p.categoryId);
          }
          return p.categoryId === selectedCategoryId;
        })
      : prompts;

    relevantPrompts.forEach((p) => {
      p.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    return counts;
  }, [prompts, selectedCategoryId, categories]);

  const filteredPrompts = useMemo(() => {
    return prompts
      .filter((prompt) => {
        let matchesCategory = true;

        if (selectedCategoryId === 'uncategorized') {
          matchesCategory = !prompt.categoryId || !categories.find((c) => c.id === prompt.categoryId);
        } else if (selectedCategoryId) {
          matchesCategory = prompt.categoryId === selectedCategoryId;
        }

        const matchesTag = selectedTag ? prompt.tags.includes(selectedTag) : true;
        const matchesSearch =
          prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesFavorite = showFavoritesOnly ? prompt.isFavorite : true;

        return matchesCategory && matchesTag && matchesSearch && matchesFavorite;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            return b.createdAt - a.createdAt;
          case 'oldest':
            return a.createdAt - b.createdAt;
          case 'az':
            return a.title.localeCompare(b.title);
          case 'za':
            return b.title.localeCompare(a.title);
          default:
            return b.createdAt - a.createdAt;
        }
      });
  }, [prompts, selectedCategoryId, selectedTag, searchQuery, showFavoritesOnly, sortOption, categories]);

  const sortedWorkflows = useMemo(() => {
    return [...workflows].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [workflows]);

  const selectedWorkflow = useMemo(() => {
    if (!selectedWorkflowId) return null;
    return workflows.find((workflow) => workflow.id === selectedWorkflowId) || null;
  }, [selectedWorkflowId, workflows]);

  const selectedWorkflowSteps = useMemo<WorkflowStepWithPrompt[]>(() => {
    if (!selectedWorkflowId) return [];

    return workflowSteps
      .filter((step) => step.workflowId === selectedWorkflowId)
      .sort((a, b) => a.order - b.order)
      .map((step) => {
        const prompt = promptMap.get(step.promptId);
        return prompt ? { step, prompt } : null;
      })
      .filter((item): item is WorkflowStepWithPrompt => item !== null);
  }, [selectedWorkflowId, workflowSteps, promptMap]);

  const getHeaderTitle = () => {
    if (mainView === 'workflows') {
      if (selectedWorkflow) return selectedWorkflow.name;
      return 'Workflows';
    }

    if (selectedCategoryId === 'uncategorized') return 'Uncategorized';
    if (selectedCategoryId) return categories.find((c) => c.id === selectedCategoryId)?.name || 'Unknown Category';
    return 'All Prompts';
  };

  const getHeaderSubtitle = () => {
    if (mainView === 'workflows') {
      if (selectedWorkflow) {
        return `${selectedWorkflowSteps.length} ${selectedWorkflowSteps.length === 1 ? 'step' : 'steps'}`;
      }
      return `${sortedWorkflows.length} ${sortedWorkflows.length === 1 ? 'workflow' : 'workflows'}`;
    }

    return `${filteredPrompts.length} ${filteredPrompts.length === 1 ? 'prompt' : 'prompts'} found`;
  };

  const touchWorkflow = (workflowId: string) => {
    setWorkflows((current) =>
      current.map((workflow) =>
        workflow.id === workflowId
          ? { ...workflow, updatedAt: Date.now() }
          : workflow
      )
    );
  };

  const handleAddCategory = (name: string) => {
    setCategories([...categories, { id: uuidv4(), name }]);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id));
    setPrompts(prompts.map((p) => (p.categoryId === id ? { ...p, categoryId: '' } : p)));

    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
  };

  const handleEditCategory = (id: string, name: string) => {
    setCategories(categories.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    if (promptData.id && typeof promptData.id === 'string') {
      setPrompts(
        prompts.map((p) => {
          if (p.id === promptData.id) {
            return {
              id: p.id,
              title: promptData.title,
              content: promptData.content,
              categoryId: promptData.categoryId,
              tags: promptData.tags,
              isFavorite: promptData.isFavorite,
              isTemplate: promptData.isTemplate,
              createdAt: p.createdAt,
              updatedAt: Date.now(),
            };
          }
          return p;
        })
      );
    } else {
      const newPrompt: Prompt = {
        id: uuidv4(),
        title: promptData.title,
        content: promptData.content,
        categoryId: promptData.categoryId,
        tags: promptData.tags,
        isFavorite: promptData.isFavorite,
        isTemplate: promptData.isTemplate,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setPrompts([newPrompt, ...prompts]);
    }
  };

  const handleDeletePrompt = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;

    setPrompts((currentPrompts) => currentPrompts.filter((p) => p.id !== id));
    setWorkflowSteps((currentSteps) => reindexWorkflowSteps(currentSteps.filter((step) => step.promptId !== id)));
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setPromptModalPrompt(prompt);
    setPromptModalMode('edit');
    setPromptModalOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTagClick = (tag: string | null) => {
    setSelectedTag((current) => (current === tag ? null : tag));
    setSearchQuery('');
  };

  const handleCategorySelect = (id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const togglePromptSelection = (id: string) => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setSearchQuery('');
  };

  const clearSelection = () => {
    setSelectedPromptIds(new Set());
    setSearchQuery('');
  };

  const handleTemplateRequest = (prompt: Prompt) => {
    setTemplateFill(prompt);
    setShowTemplateVariableModal(true);
  };

  const handleExpandPrompt = (prompt: Prompt) => {
    setPromptModalPrompt(prompt);
    setPromptModalMode('view');
    setPromptModalOpen(true);
    setSearchQuery('');
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`Delete ${selectedPromptIds.size} prompt(s)?`)) return;

    const idsToDelete = new Set(selectedPromptIds);
    setPrompts(prompts.filter((p) => !idsToDelete.has(p.id)));
    setWorkflowSteps((currentSteps) =>
      reindexWorkflowSteps(currentSteps.filter((step) => !idsToDelete.has(step.promptId)))
    );
    setSelectedPromptIds(new Set());
  };

  const handleBulkMove = (categoryId: string) => {
    setPrompts(
      prompts.map((p) =>
        selectedPromptIds.has(p.id)
          ? { ...p, categoryId, updatedAt: Date.now() }
          : p
      )
    );
    setSelectedPromptIds(new Set());
    setShowBulkMoveModal(false);
  };

  const handleBulkAddTags = (tagsToAdd: string[], tagsToRemove: string[]) => {
    setPrompts(
      prompts.map((p) => {
        if (selectedPromptIds.has(p.id)) {
          const newTags = [...new Set([...p.tags, ...tagsToAdd])].filter((t) => !tagsToRemove.includes(t));
          return { ...p, tags: newTags, updatedAt: Date.now() };
        }
        return p;
      })
    );
    setSelectedPromptIds(new Set());
    setShowBulkTagsModal(false);
  };

  const handleBulkCopy = () => {
    const selectedPrompts = prompts.filter((p) => selectedPromptIds.has(p.id));
    const textToCopy = selectedPrompts.map((p) => `${p.title}\n${p.content}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(textToCopy);
    setSelectedPromptIds(new Set());
  };

  const handleBulkExport = () => {
    try {
      const selectedPrompts = prompts.filter((p) => selectedPromptIds.has(p.id));
      generateCSVWithTimestampForSelected(selectedPrompts, categories);
      setSelectedPromptIds(new Set());
    } catch (error) {
      console.error('Error exporting selected prompts:', error);
      alert('Failed to export selected prompts. Please try again.');
    }
  };

  const getSelectedPromptTags = () => {
    const counts: Record<string, number> = {};

    prompts
      .filter((p) => selectedPromptIds.has(p.id))
      .forEach((p) => {
        p.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      });

    return counts;
  };

  const handleExportCSV = () => {
    try {
      generateCSVWithTimestamp(prompts, categories);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export prompts. Please try again.');
    }
  };

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await handleCSVFileUpload(file);
      const { prompts: importedPrompts, categories: updatedCategories, result } = importPromptsFromCSV(
        csvContent,
        categories
      );

      setCategories(updatedCategories);
      setPrompts([...prompts, ...importedPrompts]);
      setImportResult(result);
      setImportedPromptsCount(importedPrompts.length);
      setShowImportResult(true);
    } catch (error) {
      console.error('Error importing CSV:', error);
      setImportResult({
        success: false,
        promptsImported: 0,
        errors: [`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
      setImportedPromptsCount(0);
      setShowImportResult(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImportWorkflowCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await handleCSVFileUpload(file);
      const {
        workflows: updatedWorkflows,
        workflowSteps: updatedSteps,
        prompts: updatedPrompts,
        categories: updatedCategories,
        result,
      } = importWorkflowsFromCSV(csvContent, workflows, workflowSteps, prompts, categories);

      setWorkflows(updatedWorkflows);
      setWorkflowSteps(updatedSteps);
      setPrompts(updatedPrompts);
      setCategories(updatedCategories);
      setWorkflowImportResult(result);
      setShowWorkflowImportResult(true);
    } catch (error) {
      console.error('Error importing workflow CSV:', error);
      setWorkflowImportResult({
        success: false,
        workflowsImported: 0,
        stepsImported: 0,
        promptsCreated: 0,
        errors: [`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
      });
      setShowWorkflowImportResult(true);
    }

    if (workflowFileInputRef.current) {
      workflowFileInputRef.current.value = '';
    }
  };

  const handleSearchCategorySelect = (categoryId: string) => {
    setMainView('prompts');
    setSelectedCategoryId(categoryId);
    setSelectedTag(null);
    setSearchQuery('');
  };

  const handleSearchTagSelect = (tag: string) => {
    setMainView('prompts');
    setSelectedTag(tag);
    setSearchQuery('');
  };

  const handleOpenCreateWorkflow = (selectedIds: string[] = []) => {
    setWorkflowToEdit(null);
    setPendingSelectedPromptIds(selectedIds);
    setShowWorkflowEditor(true);
  };

  const handleOpenEditWorkflow = (workflow: Workflow) => {
    setWorkflowToEdit(workflow);
    setPendingSelectedPromptIds([]);
    setShowWorkflowEditor(true);
  };

  const handleSaveWorkflow = (values: { id?: string; name: string; description: string }) => {
    if (values.id) {
      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.id === values.id
            ? { ...workflow, name: values.name, description: values.description, updatedAt: Date.now() }
            : workflow
        )
      );
      setShowWorkflowEditor(false);
      setWorkflowToEdit(null);
      return;
    }

    const newWorkflow: Workflow = {
      id: uuidv4(),
      name: values.name,
      description: values.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setWorkflows((current) => [newWorkflow, ...current]);

    if (pendingSelectedPromptIds.length > 0) {
      const uniquePromptIds = [...new Set(pendingSelectedPromptIds)];
      const newSteps: WorkflowStep[] = uniquePromptIds.map((promptId, index) => ({
        id: uuidv4(),
        workflowId: newWorkflow.id,
        promptId,
        order: index + 1,
      }));

      setWorkflowSteps((current) => [...current, ...newSteps]);
      setSelectedPromptIds(new Set());
      setPendingSelectedPromptIds([]);
    }

    setSelectedWorkflowId(newWorkflow.id);
    setMainView('workflows');
    setShowWorkflowEditor(false);
    setWorkflowToEdit(null);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const workflow = workflows.find((item) => item.id === workflowId);
    const workflowName = workflow?.name || 'this workflow';

    if (!window.confirm(`Delete ${workflowName}?`)) return;

    setWorkflows((current) => current.filter((item) => item.id !== workflowId));
    setWorkflowSteps((current) => current.filter((step) => step.workflowId !== workflowId));

    if (selectedWorkflowId === workflowId) {
      setSelectedWorkflowId(null);
    }
  };

  const handleOpenWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setMainView('workflows');
  };

  const handleBackToWorkflowList = () => {
    setSelectedWorkflowId(null);
  };

  const handleOpenAddPromptsModal = (workflowId: string) => {
    setWorkflowIdForPromptAdd(workflowId);
    setShowAddPromptToWorkflowModal(true);
  };

  const handleAddPromptsToWorkflow = (promptIds: string[]) => {
    if (!workflowIdForPromptAdd || promptIds.length === 0) return;

    setWorkflowSteps((current) => {
      const existingForWorkflow = current
        .filter((step) => step.workflowId === workflowIdForPromptAdd)
        .sort((a, b) => a.order - b.order);

      const existingPromptIds = new Set(existingForWorkflow.map((step) => step.promptId));
      const uniquePromptIds = promptIds.filter((promptId) => !existingPromptIds.has(promptId));

      if (uniquePromptIds.length === 0) return current;

      const newSteps: WorkflowStep[] = uniquePromptIds.map((promptId, index) => ({
        id: uuidv4(),
        workflowId: workflowIdForPromptAdd,
        promptId,
        order: existingForWorkflow.length + index + 1,
      }));

      return [...current, ...newSteps];
    });

    touchWorkflow(workflowIdForPromptAdd);
    setShowAddPromptToWorkflowModal(false);
    setWorkflowIdForPromptAdd(null);
  };

  const handleRemoveWorkflowStep = (stepId: string) => {
    const step = workflowSteps.find((item) => item.id === stepId);
    if (!step) return;

    setWorkflowSteps((current) => reindexWorkflowSteps(current.filter((item) => item.id !== stepId)));
    touchWorkflow(step.workflowId);
  };

  const handleMoveWorkflowStep = (stepId: string, direction: -1 | 1) => {
    const step = workflowSteps.find((item) => item.id === stepId);
    if (!step) return;

    setWorkflowSteps((current) => {
      const workflowOnly = current
        .filter((item) => item.workflowId === step.workflowId)
        .sort((a, b) => a.order - b.order);

      const currentIndex = workflowOnly.findIndex((item) => item.id === stepId);
      const targetIndex = currentIndex + direction;

      if (currentIndex === -1 || targetIndex < 0 || targetIndex >= workflowOnly.length) {
        return current;
      }

      const reordered = [...workflowOnly];
      [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

      const reindexed = reordered.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      return [...current.filter((item) => item.workflowId !== step.workflowId), ...reindexed];
    });

    touchWorkflow(step.workflowId);
  };

  const handleRunWorkflow = (workflow: Workflow) => {
    setRunningWorkflow(workflow);
  };

  const handleExportWorkflow = (workflow: Workflow) => {
    try {
      exportWorkflowAsCsv(workflow, workflowSteps, prompts, categories);
    } catch (error) {
      console.error('Error exporting workflow:', error);
      alert('Failed to export workflow. Please try again.');
    }
  };

  const handleExportAllWorkflows = () => {
    try {
      exportAllWorkflowsAsCsv(workflows, workflowSteps, prompts, categories);
    } catch (error) {
      console.error('Error exporting workflows:', error);
      alert('Failed to export workflows. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-black text-zinc-100">
      <Sidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategorySelect}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onEditCategory={handleEditCategory}
        tagCounts={tagCounts}
        selectedTag={selectedTag}
        onSelectTag={handleTagClick}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 max-w-[1920px] pb-24 transition-all duration-300`}>
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center bg-black-200 border border-black-300 rounded-lg p-1">
                  <button
                    onClick={() => setMainView('prompts')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      mainView === 'prompts' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Prompts
                  </button>
                  <button
                    onClick={() => setMainView('workflows')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      mainView === 'workflows' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Workflows
                  </button>
                </div>

                {mainView === 'prompts' && selectedTag && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-accent-light text-accent rounded-full text-sm font-medium border border-accent/30">
                    <Filter className="w-3 h-3" />
                    <span>{selectedTag}</span>
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="ml-1 hover:text-white"
                      title="Clear tag filter"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">{getHeaderTitle()}</h1>
              <p className="text-zinc-400 text-sm">{getHeaderSubtitle()}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {mainView === 'prompts' && selectedPromptIds.size > 0 && (
                <button
                  onClick={() => handleOpenCreateWorkflow(Array.from(selectedPromptIds))}
                  className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-4 py-2.5 rounded-lg font-medium transition-colors border border-black-300"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>Workflow from Selection</span>
                </button>
              )}

              {mainView === 'prompts' ? (
                <button
                  onClick={() => {
                    setPromptModalPrompt(null);
                    setPromptModalMode('edit');
                    setPromptModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-accent/20"
                >
                  <Plus className="w-5 h-5" />
                  <span>New</span>
                </button>
              ) : (
                <>
                  {selectedWorkflow && (
                    <button
                      onClick={() => handleOpenAddPromptsModal(selectedWorkflow.id)}
                      className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-4 py-2.5 rounded-lg font-medium transition-colors border border-black-300"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Prompts</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenCreateWorkflow()}
                    className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-accent/20"
                  >
                    <Plus className="w-5 h-5" />
                    <span>New Workflow</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {mainView === 'prompts' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black-200 border border-black-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-zinc-200 focus:ring-2 focus:ring-accent outline-none transition-all"
                />
              </div>

              <div className="w-40">
                <CustomSelect
                  value={sortOption}
                  onChange={(value) => setSortOption(value as SortOption)}
                  options={[
                    { value: 'newest', label: 'Newest' },
                    { value: 'oldest', label: 'Oldest' },
                    { value: 'az', label: 'A-Z' },
                    { value: 'za', label: 'Z-A' },
                  ]}
                  title="Sort prompts"
                />
              </div>

              <div className="flex items-center bg-black-200 border border-black-300 rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-accent-light text-accent' : 'text-zinc-400 hover:text-white'
                  }`}
                  title="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`p-2.5 rounded-lg border transition-colors flex-shrink-0 ${
                  showFavoritesOnly
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                    : 'bg-black-200 border-black-300 text-zinc-400 hover:text-white'
                }`}
                title="Show Favorites"
              >
                <Star className="w-5 h-5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-3 py-2.5 rounded-lg font-medium transition-colors border border-black-300 flex-shrink-0"
                title="Export prompts as CSV"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Export</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-black-200 hover:bg-black-300 text-zinc-300 hover:text-accent px-3 py-2.5 rounded-lg font-medium transition-colors border border-black-300 flex-shrink-0"
                title="Import prompts from CSV"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">Import</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </div>
          )}
        </header>

        {mainView === 'prompts' ? (
          searchQuery.trim() ? (
            <GroupedSearchResultsComponent
              results={groupedSearchResults}
              searchQuery={searchQuery}
              categories={categories}
              onSelectCategory={handleSearchCategorySelect}
              onSelectTag={handleSearchTagSelect}
              onSelectPrompt={handleExpandPrompt}
            />
          ) : filteredPrompts.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-4'}>
              {filteredPrompts.map((prompt) => (
                <div key={prompt.id} className={viewMode === 'list' ? 'max-w-4xl mx-auto w-full' : ''}>
                  <PromptCard
                    prompt={prompt}
                    category={categories.find((c) => c.id === prompt.categoryId)}
                    onEdit={handleEditPrompt}
                    onDelete={handleDeletePrompt}
                    onCopy={copyToClipboard}
                    onToggleFavorite={handleToggleFavorite}
                    onTagClick={handleTagClick}
                    selectedTag={selectedTag}
                    viewMode={viewMode}
                    isSelected={selectedPromptIds.has(prompt.id)}
                    onSelect={togglePromptSelection}
                    onTemplateRequest={handleTemplateRequest}
                    onExpand={handleExpandPrompt}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-black-200 p-4 rounded-full mb-4">
                <Search className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">No prompts found</h3>
              <p className="text-zinc-400 max-w-sm">
                We couldn't find any prompts matching your criteria. Try adjusting your search filters.
              </p>
            </div>
          )
        ) : selectedWorkflow ? (
          <WorkflowDetail
            workflow={selectedWorkflow}
            steps={selectedWorkflowSteps}
            onBack={handleBackToWorkflowList}
            onEdit={() => handleOpenEditWorkflow(selectedWorkflow)}
            onDelete={() => handleDeleteWorkflow(selectedWorkflow.id)}
            onRun={() => handleRunWorkflow(selectedWorkflow)}
            onExport={() => handleExportWorkflow(selectedWorkflow)}
            onAddPrompt={() => handleOpenAddPromptsModal(selectedWorkflow.id)}
            onRemoveStep={handleRemoveWorkflowStep}
            onMoveStep={handleMoveWorkflowStep}
          />
        ) : (
          <WorkflowList
            workflows={sortedWorkflows}
            workflowSteps={workflowSteps}
            onOpen={handleOpenWorkflow}
            onCreate={() => handleOpenCreateWorkflow()}
            onEdit={handleOpenEditWorkflow}
            onDelete={handleDeleteWorkflow}
            onRun={handleRunWorkflow}
            onExportWorkflow={handleExportWorkflow}
            onExportAll={handleExportAllWorkflows}
            onImport={() => workflowFileInputRef.current?.click()}
          />
        )}
      </main>

      {/* Hidden workflow CSV file input */}
      <input
        ref={workflowFileInputRef}
        type="file"
        accept=".csv"
        onChange={handleImportWorkflowCSV}
        className="hidden"
      />

      <CombinedPromptModal
        isOpen={promptModalOpen}
        onClose={() => {
          setPromptModalOpen(false);
          setPromptModalPrompt(null);
          setPromptModalMode('view');
        }}
        onSave={handleSavePrompt}
        prompt={promptModalPrompt}
        categories={categories}
        mode={promptModalMode}
        onTemplateRequest={handleTemplateRequest}
        onCopy={copyToClipboard}
      />

      <ImportResultModal
        isOpen={showImportResult}
        onClose={() => setShowImportResult(false)}
        result={importResult}
        promptsImported={importedPromptsCount}
      />

      <WorkflowImportResultModal
        isOpen={showWorkflowImportResult}
        result={workflowImportResult}
        onClose={() => {
          setShowWorkflowImportResult(false);
          setWorkflowImportResult(null);
        }}
      />

      <TemplateVariableModal
        isOpen={showTemplateVariableModal}
        content={templateToFill?.content || ''}
        onClose={() => {
          setShowTemplateVariableModal(false);
          setTemplateFill(null);
        }}
        onSubmit={() => {}}
      />

      <BulkTagsModal
        isOpen={showBulkTagsModal}
        allExistingTags={Object.keys(tagCounts).sort()}
        selectedPromptTags={getSelectedPromptTags()}
        totalSelected={selectedPromptIds.size}
        onClose={() => setShowBulkTagsModal(false)}
        onApply={handleBulkAddTags}
      />

      <BulkMoveModal
        isOpen={showBulkMoveModal}
        categories={categories}
        totalSelected={selectedPromptIds.size}
        onClose={() => setShowBulkMoveModal(false)}
        onApply={handleBulkMove}
      />

      <BulkActionsBar
        selectedCount={selectedPromptIds.size}
        onCopy={handleBulkCopy}
        onDelete={handleBulkDelete}
        onMove={() => setShowBulkMoveModal(true)}
        onTags={() => setShowBulkTagsModal(true)}
        onExport={handleBulkExport}
        onClearSelection={clearSelection}
      />

      <WorkflowEditorModal
        isOpen={showWorkflowEditor}
        workflow={workflowToEdit}
        onClose={() => {
          setShowWorkflowEditor(false);
          setWorkflowToEdit(null);
          setPendingSelectedPromptIds([]);
        }}
        onSave={handleSaveWorkflow}
      />

      <AddPromptToWorkflowModal
        isOpen={showAddPromptToWorkflowModal}
        prompts={prompts}
        existingPromptIds={
          workflowIdForPromptAdd
            ? workflowSteps
                .filter((step) => step.workflowId === workflowIdForPromptAdd)
                .map((step) => step.promptId)
            : []
        }
        onClose={() => {
          setShowAddPromptToWorkflowModal(false);
          setWorkflowIdForPromptAdd(null);
        }}
        onAdd={handleAddPromptsToWorkflow}
      />

      <WorkflowRunnerModal
        isOpen={Boolean(runningWorkflow)}
        workflow={runningWorkflow}
        steps={
          runningWorkflow
            ? workflowSteps
                .filter((step) => step.workflowId === runningWorkflow.id)
                .sort((a, b) => a.order - b.order)
                .map((step) => {
                  const prompt = promptMap.get(step.promptId);
                  return prompt ? { step, prompt } : null;
                })
                .filter((item): item is WorkflowStepWithPrompt => item !== null)
            : []
        }
        onClose={() => setRunningWorkflow(null)}
      />
    </div>
  );
};

export default App;