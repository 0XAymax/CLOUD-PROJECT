import { useState } from 'react';

interface FilterFormProps {
  onFilter: (filters: FilterValues) => void;
  onReset: () => void;
}

export interface FilterValues {
  searchTerm: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

const FilterForm = ({ onFilter, onReset }: FilterFormProps) => {
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: '',
    categoryId: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recherche
          </label>
          <input
            type="text"
            name="searchTerm"
            value={filters.searchTerm}
            onChange={handleChange}
            placeholder="Rechercher..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix min
          </label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice || ''}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix max
          </label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice || ''}
            onChange={handleChange}
            placeholder="10000"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date début
          </label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date fin
          </label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-end space-x-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Filtrer
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </form>
  );
};

export default FilterForm;
