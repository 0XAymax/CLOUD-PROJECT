import { useEffect, useState } from 'react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import type { Product } from '../../api/productApi';
import type { Category } from '../../api/categoryApi';
import ProductTable from '../../components/tables/ProductTable';
import ProductForm from '../../components/forms/ProductForm';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const handleCreate = () => {
    setSelectedProduct(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (product: Product) => {
    try {
      if (selectedProduct?.id) {
        await productApi.update(selectedProduct.id, product);
      } else {
        await productApi.create(product);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await productApi.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Nouveau Produit
        </button>
      </div>

      <ProductTable
        products={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProduct ? 'Modifier le Produit' : 'Créer un Produit'}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ProductList;
