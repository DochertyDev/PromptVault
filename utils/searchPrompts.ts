import { Prompt, Category } from '../types';

export interface GroupedSearchResults {
  categories: Category[];
  tags: string[];
  prompts: Prompt[];
}

export function searchByQuery(
  searchQuery: string,
  prompts: Prompt[],
  categories: Category[]
): GroupedSearchResults {
  // If search query is empty, return empty results
  if (!searchQuery.trim()) {
    return { categories: [], tags: [], prompts: [] };
  }

  const lowerQuery = searchQuery.toLowerCase().trim();
  
  // Search categories
  const matchedCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(lowerQuery)
  );

  // Search tags and collect unique matches
  const matchedTagsSet = new Set<string>();
  const matchedPrompts = prompts.filter(prompt => {
    const titleMatch = prompt.title.toLowerCase().includes(lowerQuery);
    const contentMatch = prompt.content.toLowerCase().includes(lowerQuery);
    const tagsMatch = prompt.tags.some(tag =>
      tag.toLowerCase().includes(lowerQuery)
    );

    // If any field matches, this prompt is included in results
    if (titleMatch || contentMatch || tagsMatch) {
      // If tags matched, add them to the tags set
      if (tagsMatch) {
        prompt.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) {
            matchedTagsSet.add(tag);
          }
        });
      }
      return true;
    }
    return false;
  });

  // Convert set to sorted array
  const matchedTags = Array.from(matchedTagsSet).sort();

  return {
    categories: matchedCategories,
    tags: matchedTags,
    prompts: matchedPrompts
  };
}
