import { useMemo, useState } from 'react';
import type { Sale, SaleRequest } from '../../api/saleApi';
import type { Product } from '../../api/productApi';
import type { Client } from '../../api/clientApi';

interface SaleFormProps {
  sale?: Sale;
  products: Product[];
  clients: Client[];
  onSubmit: (sale: SaleRequest) => void;
  onCancel: () => void;
}

type SaleFormData = {
  clientId: number | '';
  produitId: number | '';
  quantite: number;
};

const pad2 = (value: number) => value.toString().padStart(2, '0');

const getNowIsoDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
};

const getNowIsoTime = () => {
  const now = new Date();
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
};

const SaleForm = ({ sale, products, clients, onSubmit, onCancel }: SaleFormProps) => {
  const [formData, setFormData] = useState<SaleFormData>({
    clientId: sale?.client?.id ?? '',
    produitId: sale?.produit?.id ?? '',
    quantite: sale?.quantite ?? 1,
  });

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === formData.produitId),
    [products, formData.produitId]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numeric = name === 'quantite' || name === 'produitId' || name === 'clientId';
    setFormData((prev) => ({
      ...prev,
      [name]: numeric ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.clientId) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (!formData.produitId) {
      alert('Veuillez sélectionner un produit');
      return;
    }
    if (!formData.quantite || formData.quantite <= 0) {
      alert('La quantité doit être supérieure à 0');
      return;
    }
    
    // Check if product has enough stock
    if (selectedProduct && selectedProduct.quantite !== undefined && selectedProduct.quantite < formData.quantite) {
      alert(`Stock insuffisant. Stock disponible: ${selectedProduct.quantite}`);
      return;
    }
    
    const dateVente = sale?.dateVente ?? getNowIsoDate();
    const heureVente = sale?.heureVente ?? getNowIsoTime();
    
    console.log('Submitting sale:', {
      clientId: Number(formData.clientId),
      produitId: Number(formData.produitId),
      quantite: formData.quantite,
      dateVente,
      heureVente,
    });
    
    onSubmit({
      clientId: Number(formData.clientId),
      produitId: Number(formData.produitId),
      quantite: formData.quantite,
      dateVente,
      heureVente,
    });
  };

  const prixUnitaire = selectedProduct?.prix ?? 0;
  const montantTotal = formData.quantite * prixUnitaire;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client *
        </label>
        <select
          name="clientId"
          value={formData.clientId || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner un client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.nom} {client.prenom}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Produit *
        </label>
        <select
          name="produitId"
          value={formData.produitId || ''}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner un produit</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.nom} - {product.prix}€
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantité *
          </label>
          <input
            type="number"
            name="quantite"
            value={formData.quantite}
            onChange={handleChange}
            required
            min="1"
            max={selectedProduct?.quantite || 999999}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedProduct && (
            <p className="text-xs text-gray-500 mt-1">
              Stock disponible: {selectedProduct.quantite || 0}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix unitaire *
          </label>
          <input
            type="number"
            value={prixUnitaire}
            readOnly
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <p className="text-lg font-semibold text-gray-900">
          Montant Total: {montantTotal.toFixed(2)}€
        </p>
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
          {sale ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default SaleForm;
