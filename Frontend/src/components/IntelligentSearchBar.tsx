import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Clock, TrendingUp, Zap, X, ChevronRight, Filter, Sparkles } from "lucide-react";
import { debounce } from "lodash";

interface SearchSuggestion {
  text: string;
  type: 'history' | 'popular' | 'semantic';
  score?: number;
}

interface SearchResult {
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

interface SearchPattern {
  name: string;
  type: string;
  value: any;
  match: string;
}

interface IntelligentSearchProps {
  onSearch: (results: SearchResult[], query: string, patterns: SearchPattern[]) => void;
  userId?: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const IntelligentSearchBar: React.FC<IntelligentSearchProps> = ({
  onSearch,
  userId,
  placeholder = "Rechercher produits (ASIN, nom ou recherche sémantique)...",
  className = "",
  disabled = false
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([
    "Produits électroniques sous 50$",
    "Livres avec +1000 avis",
    "Meilleur rapport qualité-prix",
    "Produits 5 étoiles",
    "Moins de 100 dhs"
  ]);
  const [detectedPatterns, setDetectedPatterns] = useState<SearchPattern[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger l'historique
  useEffect(() => {
    if (userId) {
      loadSearchHistory();
      loadPopularSearches();
    }
  }, [userId]);

  // Gestion du clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSearchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:8000/search/history?user_id=${userId}`);
      const data = await response.json();
      if (data.history) {
        setSearchHistory(data.history.map((item: any) => item.query).slice(0, 5));
      }
    } catch (error) {
      console.error("Erreur chargement historique:", error);
    }
  };

  const loadPopularSearches = async () => {
    try {
      const response = await fetch("http://localhost:8000/search/popular?limit=5");
      const data = await response.json();
      if (Array.isArray(data)) {
        setPopularSearches(data.map((item: any) => item.name));
      }
    } catch (error) {
      console.error("Erreur chargement recherches populaires:", error);
    }
  };

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        // Afficher historique et recherches populaires quand vide
        const allSuggestions: SearchSuggestion[] = [
          ...searchHistory.map(text => ({ text, type: 'history' as const, score: 1 })),
          ...popularSearches.map(text => ({ text, type: 'popular' as const, score: 1 }))
        ];
        setSuggestions(allSuggestions);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/search/suggestions?q=${encodeURIComponent(searchQuery)}${userId ? `&user_id=${userId}` : ''}`
        );
        const data = await response.json();
        
        const newSuggestions: SearchSuggestion[] = data.suggestions.map((text: string) => {
          if (searchHistory.includes(text)) {
            return { text, type: 'history' as const, score: 2 };
          } else if (popularSearches.some(pop => text.includes(pop))) {
            return { text, type: 'popular' as const, score: 1 };
          } else {
            return { text, type: 'semantic' as const, score: 0 };
          }
        });
        
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error("Erreur suggestions:", error);
      }
    }, 300),
    [userId, searchHistory, popularSearches]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 0) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(true);
      fetchSuggestions("");
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim() || disabled) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `http://localhost:8000/search/intelligent?q=${encodeURIComponent(searchQuery)}${userId ? `&user_id=${userId}` : ''}&limit=50`
      );
      const data = await response.json();
      
      if (data.results) {
        onSearch(data.results, searchQuery, data.patterns || []);
        setDetectedPatterns(data.patterns || []);
        
        // Mettre à jour l'historique local
        if (userId && !searchHistory.includes(searchQuery)) {
          setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5));
        }
      }
    } catch (error) {
      console.error("Erreur recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
      e.preventDefault();
      // Navigation dans les suggestions
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setDetectedPatterns([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const selectSuggestion = (suggestionText: string) => {
    setQuery(suggestionText);
    handleSearch(suggestionText);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'popular': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'semantic': return <Zap className="w-4 h-4 text-yellow-400" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSuggestionBadge = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'history': return "Historique";
      case 'popular': return "Populaire";
      case 'semantic': return "Sémantique";
      default: return "Suggestion";
    }
  };

  return (
    <div className={`relative w-full ${className}`} ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
        
        <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-xl border border-slate-700/50 
                      group-hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-center px-4">
            <Sparkles className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none 
                       disabled:cursor-not-allowed disabled:opacity-50"
            />
            
            {query && (
              <button
                onClick={clearSearch}
                disabled={disabled}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
            
            <div className="w-px h-6 bg-slate-700/50 mx-2" />
            
            <button
              onClick={() => handleSearch()}
              disabled={isSearching || disabled || !query.trim()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all mr-2 ${
                isSearching 
                  ? "bg-blue-500/20 cursor-wait" 
                  : query.trim() && !disabled
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/50" 
                    : "bg-slate-700/50 cursor-not-allowed"
              }`}
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-white">Recherche...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Rechercher</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Patterns détectés */}
        {detectedPatterns.length > 0 && (
          <div className="absolute -bottom-10 left-0 right-0 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Patterns détectés:</span>
            {detectedPatterns.map((pattern, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
              >
                {pattern.match}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-slate-800/95 backdrop-blur-xl rounded-xl border border-slate-700/50 
                      shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/20 to-cyan-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Suggestions intelligentes</span>
              </div>
              <span className="text-xs text-slate-400">{suggestions.length} suggestions</span>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.text}-${index}`}
                onClick={() => selectSuggestion(suggestion.text)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-all 
                         border-b border-slate-700/30 last:border-0 group"
              >
                <div className="flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                    {suggestion.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.type === 'history' ? 'bg-blue-500/20 text-blue-400' :
                      suggestion.type === 'popular' ? 'bg-green-500/20 text-green-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {getSuggestionBadge(suggestion.type)}
                    </span>
                    {suggestion.score !== undefined && (
                      <span className="text-xs text-slate-400">
                        Score: {suggestion.score}
                      </span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </button>
            ))}
          </div>
          
          <div className="p-3 border-t border-slate-700/50 bg-slate-900/50">
            <div className="text-xs text-slate-400">
              <span className="font-medium">💡 Astuces:</span> 
              <ul className="mt-1 space-y-1">
                <li>• Utilisez "produits sous 50$" pour filtrer par prix</li>
                <li>• Essayez "livres 1000+ avis" pour les produits populaires</li>
                <li>• "meilleur rapport qualité-prix" pour les meilleures affaires</li>
                <li>• Tapez ASIN_123 pour rechercher par ID produit</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchBar;