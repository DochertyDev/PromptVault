export interface Category {
  id: string;
  name: string;
  icon?: string; // Icon name from Lucide
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  isFavorite: boolean;
  isTemplate: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'grid' | 'list';

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';

export type BulkAction = 'copy' | 'delete' | 'move' | 'addTags' | 'removeTags' | 'export';

export interface TemplateVariable {
  name: string;
  value?: string;
}

export type TemplateFillValues = Record<string, string>;

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}