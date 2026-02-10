import { Prompt, Category } from '../types';

export function exportPromptsToCSV(prompts: Prompt[], categories: Category[]): string {
  // Create category map for easier lookup
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  // CSV headers
  const headers = ['Title', 'Content', 'Category', 'Tags', 'Favorite', 'IsTemplate', 'Created Date', 'Updated Date'];
  const csvContent: string[] = [];

  // Add headers
  csvContent.push(headers.map(h => `"${h}"`).join(','));

  // Add data rows
  prompts.forEach((prompt) => {
    const categoryName = prompt.categoryId ? categoryMap.get(prompt.categoryId) || 'Uncategorized' : 'Uncategorized';
    const tagsStr = prompt.tags.join('; ');
    const createdDate = new Date(prompt.createdAt).toISOString();
    const updatedDate = new Date(prompt.updatedAt).toISOString();

    const row = [
      `"${escapeCSV(prompt.title)}"`,
      `"${escapeCSV(prompt.content)}"`,
      `"${escapeCSV(categoryName)}"`,
      `"${escapeCSV(tagsStr)}"`,
      prompt.isFavorite ? 'Yes' : 'No',
      prompt.isTemplate ? 'Yes' : 'No',
      `"${createdDate}"`,
      `"${updatedDate}"`
    ].join(',');

    csvContent.push(row);
  });

  return csvContent.join('\n');
}

export function downloadCSV(csvContent: string, filename: string = 'prompts.csv'): void {
  const element = document.createElement('a');
  const file = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function escapeCSV(str: string): string {
  // Escape double quotes by doubling them
  return str.replace(/"/g, '""');
}

export function generateCSVWithTimestamp(prompts: Prompt[], categories: Category[]): void {
  const csv = exportPromptsToCSV(prompts, categories);
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `promptvault-backup-${timestamp}.csv`;
  downloadCSV(csv, filename);
}

export function generateCSVWithTimestampForSelected(prompts: Prompt[], categories: Category[]): void {
  const csv = exportPromptsToCSV(prompts, categories);
  const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const filename = `promptvault-export-${timestamp}.csv`;
  downloadCSV(csv, filename);
}
