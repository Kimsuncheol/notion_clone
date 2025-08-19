/**
 * N-gram utilities for enhanced search functionality
 */

export interface NGramOptions {
  n?: number; // size of n-grams (default: 3)
  caseSensitive?: boolean; // case sensitive matching (default: false)
  includeSpaces?: boolean; // include spaces in n-grams (default: false)
}

/**
 * Generates n-grams from a given text
 * @param text - The input text
 * @param options - Configuration options
 * @returns Array of n-grams
 */
export function generateNGrams(text: string, options: NGramOptions = {}): string[] {
  const { n = 3, caseSensitive = false, includeSpaces = false } = options;
  
  if (!text || text.length < n) {
    return [];
  }
  
  let processedText = caseSensitive ? text : text.toLowerCase();
  
  if (!includeSpaces) {
    processedText = processedText.replace(/\s+/g, '');
  }
  
  const ngrams: string[] = [];
  
  for (let i = 0; i <= processedText.length - n; i++) {
    ngrams.push(processedText.slice(i, i + n));
  }
  
  return ngrams;
}

/**
 * Calculates Jaccard similarity between two sets of n-grams
 * @param ngrams1 - First set of n-grams
 * @param ngrams2 - Second set of n-grams
 * @returns Similarity score between 0 and 1
 */
export function calculateJaccardSimilarity(ngrams1: string[], ngrams2: string[]): number {
  if (ngrams1.length === 0 && ngrams2.length === 0) {
    return 1;
  }
  
  if (ngrams1.length === 0 || ngrams2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(ngrams1);
  const set2 = new Set(ngrams2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Calculates cosine similarity between two sets of n-grams
 * @param ngrams1 - First set of n-grams
 * @param ngrams2 - Second set of n-grams
 * @returns Similarity score between 0 and 1
 */
export function calculateCosineSimilarity(ngrams1: string[], ngrams2: string[]): number {
  if (ngrams1.length === 0 || ngrams2.length === 0) {
    return 0;
  }
  
  // Count frequency of each n-gram
  const freq1 = new Map<string, number>();
  const freq2 = new Map<string, number>();
  
  ngrams1.forEach(ngram => {
    freq1.set(ngram, (freq1.get(ngram) || 0) + 1);
  });
  
  ngrams2.forEach(ngram => {
    freq2.set(ngram, (freq2.get(ngram) || 0) + 1);
  });
  
  // Get all unique n-grams
  const allNgrams = new Set([...freq1.keys(), ...freq2.keys()]);
  
  // Calculate dot product and magnitudes
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  allNgrams.forEach(ngram => {
    const count1 = freq1.get(ngram) || 0;
    const count2 = freq2.get(ngram) || 0;
    
    dotProduct += count1 * count2;
    magnitude1 += count1 * count1;
    magnitude2 += count2 * count2;
  });
  
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(magnitude1) * Math.sqrt(magnitude2));
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  item: string;
  score: number;
  index: number;
}

/**
 * Search configuration
 */
export interface SearchConfig extends NGramOptions {
  threshold?: number; // minimum similarity threshold (default: 0.3)
  maxResults?: number; // maximum number of results (default: 10)
  algorithm?: 'jaccard' | 'cosine'; // similarity algorithm (default: 'jaccard')
}

/**
 * Performs n-gram based fuzzy search on an array of strings
 * @param query - The search query
 * @param items - Array of items to search through
 * @param config - Search configuration
 * @returns Array of search results sorted by similarity score
 */
export function ngramSearch(
  query: string, 
  items: string[], 
  config: SearchConfig = {}
): SearchResult[] {
  const { 
    threshold = 0.3, 
    maxResults = 10, 
    algorithm = 'jaccard',
    ...ngramOptions 
  } = config;
  
  if (!query.trim()) {
    return [];
  }
  
  const queryNgrams = generateNGrams(query, ngramOptions);
  const results: SearchResult[] = [];
  
  items.forEach((item, index) => {
    const itemNgrams = generateNGrams(item, ngramOptions);
    
    let score: number;
    if (algorithm === 'cosine') {
      score = calculateCosineSimilarity(queryNgrams, itemNgrams);
    } else {
      score = calculateJaccardSimilarity(queryNgrams, itemNgrams);
    }
    
    // Check for exact substring match (boost score)
    const processedQuery = ngramOptions.caseSensitive ? query : query.toLowerCase();
    const processedItem = ngramOptions.caseSensitive ? item : item.toLowerCase();
    
    if (processedItem.includes(processedQuery)) {
      score = Math.max(score, 0.8); // Boost exact substring matches
    }
    
    // Check for word boundary matches (further boost)
    const words = processedQuery.split(/\s+/);
    const itemWords = processedItem.split(/\s+/);
    const wordMatches = words.filter(word => 
      itemWords.some(itemWord => itemWord.includes(word))
    );
    
    if (wordMatches.length > 0) {
      const wordMatchRatio = wordMatches.length / words.length;
      score = Math.max(score, wordMatchRatio * 0.9);
    }
    
    if (score >= threshold) {
      results.push({ item, score, index });
    }
  });
  
  // Sort by score (descending) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Performs n-gram based search on an array of objects
 * @param query - The search query
 * @param items - Array of objects to search through
 * @param searchFields - Fields to search within each object
 * @param config - Search configuration
 * @returns Array of search results with the original objects
 */
export function ngramSearchObjects<T extends Record<string, unknown>>(
  query: string,
  items: T[],
  searchFields: (keyof T)[],
  config: SearchConfig = {}
): Array<{ item: T; score: number; index: number }> {
  if (!query.trim()) {
    return [];
  }
  
  const { 
    threshold = 0.3, 
    maxResults = 10, 
    algorithm = 'jaccard',
    ...ngramOptions 
  } = config;
  
  const queryNgrams = generateNGrams(query, ngramOptions);
  const results: Array<{ item: T; score: number; index: number }> = [];
  
  items.forEach((item, index) => {
    let maxScore = 0;
    let combinedText = '';
    
    // Combine all searchable fields
    searchFields.forEach(field => {
      const fieldValue = String(item[field] || '');
      combinedText += fieldValue + ' ';
    });
    
    // Calculate score for combined text
    const itemNgrams = generateNGrams(combinedText.trim(), ngramOptions);
    
    let score: number;
    if (algorithm === 'cosine') {
      score = calculateCosineSimilarity(queryNgrams, itemNgrams);
    } else {
      score = calculateJaccardSimilarity(queryNgrams, itemNgrams);
    }
    
    // Boost for exact matches in individual fields
    const processedQuery = ngramOptions.caseSensitive ? query : query.toLowerCase();
    
    searchFields.forEach(field => {
      const fieldValue = String(item[field] || '');
      const processedField = ngramOptions.caseSensitive ? fieldValue : fieldValue.toLowerCase();
      
      if (processedField.includes(processedQuery)) {
        score = Math.max(score, 0.8);
      }
      
      // Word boundary matches
      const words = processedQuery.split(/\s+/);
      const fieldWords = processedField.split(/\s+/);
      const wordMatches = words.filter(word => 
        fieldWords.some(fieldWord => fieldWord.includes(word))
      );
      
      if (wordMatches.length > 0) {
        const wordMatchRatio = wordMatches.length / words.length;
        score = Math.max(score, wordMatchRatio * 0.9);
      }
    });
    
    maxScore = Math.max(maxScore, score);
    
    if (maxScore >= threshold) {
      results.push({ item, score: maxScore, index });
    }
  });
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Creates auto-completion suggestions based on n-gram analysis
 * @param query - The current query
 * @param vocabulary - Array of words/phrases for suggestions
 * @param config - Search configuration
 * @returns Array of suggestion strings
 */
export function ngramAutoComplete(
  query: string,
  vocabulary: string[],
  config: SearchConfig = {}
): string[] {
  if (!query.trim()) {
    return [];
  }
  
  const results = ngramSearch(query, vocabulary, {
    ...config,
    threshold: config.threshold || 0.2, // Lower threshold for autocomplete
    maxResults: config.maxResults || 5
  });
  
  return results.map(result => result.item);
}

/**
 * Highlights matching parts of text based on n-gram similarity
 * @param text - The text to highlight
 * @param query - The search query
 * @param options - N-gram options
 * @returns Object with highlighted text and match positions
 */
export function highlightMatches(
  text: string, 
  query: string, 
  options: NGramOptions = {}
): { highlightedText: string; matches: Array<{ start: number; end: number }> } {
  if (!query.trim()) {
    return { highlightedText: text, matches: [] };
  }
  
  const { caseSensitive = false } = options;
  const processedQuery = caseSensitive ? query : query.toLowerCase();
  const processedText = caseSensitive ? text : text.toLowerCase();
  
  const matches: Array<{ start: number; end: number }> = [];
  const words = processedQuery.split(/\s+/);
  
  // Find exact word matches
  words.forEach(word => {
    if (word.length < 2) return;
    
    let searchIndex = 0;
    while (true) {
      const index = processedText.indexOf(word, searchIndex);
      if (index === -1) break;
      
      matches.push({ start: index, end: index + word.length });
      searchIndex = index + 1;
    }
  });
  
  // Sort matches and merge overlapping ones
  matches.sort((a, b) => a.start - b.start);
  
  const mergedMatches: Array<{ start: number; end: number }> = [];
  matches.forEach(match => {
    if (mergedMatches.length === 0) {
      mergedMatches.push(match);
    } else {
      const lastMatch = mergedMatches[mergedMatches.length - 1];
      if (match.start <= lastMatch.end) {
        lastMatch.end = Math.max(lastMatch.end, match.end);
      } else {
        mergedMatches.push(match);
      }
    }
  });
  
  // Create highlighted text
  let highlightedText = text;
  let offset = 0;
  
  mergedMatches.forEach(match => {
    const start = match.start + offset;
    const end = match.end + offset;
    const beforeHighlight = highlightedText.slice(0, start);
    const highlighted = `<mark>${highlightedText.slice(start, end)}</mark>`;
    const afterHighlight = highlightedText.slice(end);
    
    highlightedText = beforeHighlight + highlighted + afterHighlight;
    offset += '<mark>'.length + '</mark>'.length;
  });
  
  return { highlightedText, matches: mergedMatches };
}
