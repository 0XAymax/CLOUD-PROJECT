import { useState } from 'react';
import type { Product } from '../../api/productApi';
import type { Category } from '../../api/categoryApi';

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  onSubmit: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, categories, onSubmit, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState<Product>({
    nom: '',
    description: '',
    prix: 0,
    quantite: 0,
    categorie: undefined,
    ...product,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'idCategorie') {
      setFormData((prev) => ({
        ...prev,
        categorie: { id: Number(value), nom: '' }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'prix' || name === 'quantite'
          ? Number(value) 
          : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom du produit *
        </label>
        <input
          type="text"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix *
          </label>
          <input
            type="number"
            name="prix"
            value={formData.prix}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité en stock *
          </label>
          <input
            type="number"
            name="quantite"
            value={formData.quantite}
            onChange={handleChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie *
        </label>
        <select
          name="idCategorie"
          value={formData.categorie?.id || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {product ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
