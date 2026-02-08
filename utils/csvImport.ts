import { Prompt, Category } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  success: boolean;
  promptsImported: number;
  errors: string[];
  warnings: string[];
}

export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.split('\n');
  const rows: string[][] = [];
  let insideQuotes = false;
  let currentRow: string[] = [];
  let currentCell = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          j++; // Skip next quote
        } else {
          // Toggle quote state
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of cell
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    // Handle line end
    if (!insideQuotes) {
      if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell.length > 0)) {
          rows.push(currentRow);
        }
      }
      currentCell = '';
      currentRow = [];
    } else {
      // Continue to next line if inside quotes
      currentCell += '\n';
    }
  }

  // Add last row if exists
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

export function importPromptsFromCSV(
  csvContent: string,
  existingCategories: Category[]
): { prompts: Prompt[], categories: Category[], result: ImportResult } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const importedPrompts: Prompt[] = [];
  const newCategories: Category[] = [...existingCategories];
  const categoryMap = new Map(existingCategories.map(c => [c.name, c.id]));

  try {
    const rows = parseCSV(csvContent);

    if (rows.length === 0) {
      errors.push('CSV file is empty');
      return {
        prompts: importedPrompts,
        categories: newCategories,
        result: { success: false, promptsImported: 0, errors, warnings }
      };
    }

    // Validate headers
    const headers = rows[0].map(h => h.toLowerCase().trim());
    const titleIndex = headers.indexOf('title');
    const contentIndex = headers.indexOf('content');
    const categoryIndex = headers.indexOf('category');
    const tagsIndex = headers.indexOf('tags');
    const favoriteIndex = headers.indexOf('favorite');

    if (titleIndex === -1 || contentIndex === -1) {
      errors.push('CSV must contain "Title" and "Content" columns');
      return {
        prompts: importedPrompts,
        categories: newCategories,
        result: { success: false, promptsImported: 0, errors, warnings }
      };
    }

    // Import data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];

      try {
        const title = row[titleIndex]?.trim();
        const content = row[contentIndex]?.trim();
        const categoryName = categoryIndex >= 0 ? row[categoryIndex]?.trim() : '';
        const tagsStr = tagsIndex >= 0 ? row[tagsIndex]?.trim() : '';
        const isFavorite = favoriteIndex >= 0 ? row[favoriteIndex]?.toLowerCase() === 'yes' : false;

        // Validate required fields
        if (!title || !content) {
          warnings.push(`Row ${i + 1}: Skipped (missing title or content)`);
          continue;
        }

        // Handle category
        let categoryId = '';
        if (categoryName && categoryName !== 'Uncategorized') {
          if (categoryMap.has(categoryName)) {
            categoryId = categoryMap.get(categoryName)!;
          } else {
            // Create new category
            const newCategoryId = uuidv4();
            const newCategory: Category = { id: newCategoryId, name: categoryName };
            newCategories.push(newCategory);
            categoryMap.set(categoryName, newCategoryId);
            categoryId = newCategoryId;
            warnings.push(`Created new category: "${categoryName}"`);
          }
        }

        // Parse tags
        const tags = tagsStr
          ? tagsStr.split(';').map(t => t.trim()).filter(t => t.length > 0)
          : [];

        // Create prompt
        const now = Date.now();
        const prompt: Prompt = {
          id: uuidv4(),
          title,
          content,
          categoryId,
          tags,
          isFavorite,
          createdAt: now,
          updatedAt: now
        };

        importedPrompts.push(prompt);
      } catch (error) {
        warnings.push(`Row ${i + 1}: Error parsing row - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const result: ImportResult = {
      success: errors.length === 0,
      promptsImported: importedPrompts.length,
      errors,
      warnings
    };

    return { prompts: importedPrompts, categories: newCategories, result };
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      prompts: importedPrompts,
      categories: newCategories,
      result: { success: false, promptsImported: 0, errors, warnings }
    };
  }
}

export function handleCSVFileUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
