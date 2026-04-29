// API pour la recherche intelligente
const API_BASE_URL = "http://localhost:8000";

export interface SearchResult {
  id_produit: number;
  name: string;
  description: string | null;
  prix: number;
  quantite: number;
  rating: number | null;
  reviews_count: number | null;
  product_rank: number | null;
  photo_url: string | null;
  id_categorie: number | null;
  name_categorie: string | null;
  similarity?: number;
}

export interface SearchPattern {
  name: string;
  type: string;
  value: any;
  match: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  patterns: SearchPattern[];
  total: number;
  suggestions: string[];
}

export interface SuggestionResponse {
  suggestions: string[];
}

export interface HistoryItem {
  query: string;
  timestamp: string;
  count: number;
}

export interface HistoryResponse {
  history: HistoryItem[];
}

export const searchApi = {
  // Recherche intelligente
  async intelligentSearch(query: string, userId?: number, limit: number = 50): Promise<SearchResponse> {
    const url = new URL(`${API_BASE_URL}/search/intelligent`);
    url.searchParams.append("q", query);
    if (userId) url.searchParams.append("user_id", userId.toString());
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }
    return response.json();
  },

  // Suggestions
  async getSuggestions(query: string, userId?: number): Promise<string[]> {
    const url = new URL(`${API_BASE_URL}/search/suggestions`);
    url.searchParams.append("q", query);
    if (userId) url.searchParams.append("user_id", userId.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Suggestions failed: ${response.statusText}`);
    }
    const data: SuggestionResponse = await response.json();
    return data.suggestions;
  },

  // Historique
  async getSearchHistory(userId: number): Promise<HistoryItem[]> {
    const url = new URL(`${API_BASE_URL}/search/history`);
    url.searchParams.append("user_id", userId.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`History failed: ${response.statusText}`);
    }
    const data: HistoryResponse = await response.json();
    return data.history;
  },

  // Recherches populaires
  async getPopularSearches(limit: number = 10): Promise<Array<{name: string, count: number}>> {
    const url = new URL(`${API_BASE_URL}/search/popular`);
    url.searchParams.append("limit", limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Popular searches failed: ${response.statusText}`);
    }
    return response.json();
  }
};