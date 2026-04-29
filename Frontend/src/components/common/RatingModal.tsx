import { useState } from "react";
import { X, Star } from "lucide-react";
import { ratingApi } from "../../api/ratingApi";

interface Product {
  id: number;
  nom: string;
  image?: string;
}

interface RatingModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onSuccess?: () => void;
}

const RatingModal = ({ isOpen, products, onClose, onSuccess }: RatingModalProps) => {
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [hoveredRating, setHoveredRating] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleRatingClick = (productId: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [productId]: rating }));
  };

  const handleMouseEnter = (productId: number, rating: number) => {
    setHoveredRating((prev) => ({ ...prev, [productId]: rating }));
  };

  const handleMouseLeave = (productId: number) => {
    setHoveredRating((prev) => ({ ...prev, [productId]: 0 }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      // Soumettre les ratings pour tous les produits notés
      const ratingPromises = Object.entries(ratings).map(([productId, rating]) => {
        return ratingApi.updateRating(parseInt(productId), rating);
      });

      await Promise.all(ratingPromises);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error("Erreur lors de l'enregistrement des ratings:", err);
      setError(err?.response?.data || "Erreur lors de l'enregistrement des ratings");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Notez vos produits</h2>
            <p className="text-slate-400 text-sm mt-1">
              Partagez votre expérience avec ces produits
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Products List */}
        <div className="p-6 space-y-6">
          {products.map((product) => {
            const currentRating = ratings[product.id] || 0;
            const displayRating = hoveredRating[product.id] || currentRating;

            return (
              <div
                key={product.id}
                className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 hover:border-blue-500/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-lg bg-slate-600 flex-shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.nom}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        {product.nom.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Product Info & Rating */}
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-3">{product.nom}</h3>

                    {/* Stars Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRatingClick(product.id, star)}
                          onMouseEnter={() => handleMouseEnter(product.id, star)}
                          onMouseLeave={() => handleMouseLeave(product.id)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= displayRating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-slate-600 text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                      {currentRating > 0 && (
                        <span className="ml-2 text-sm text-slate-400">
                          {currentRating}/5
                        </span>
                      )}
                    </div>

                    {/* Comment Input */}
                    {currentRating > 0 && (
                      <div className="text-sm text-slate-400 mt-2">
                        💡 Votre note sera combinée avec les notes existantes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 p-6 flex gap-4">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-all disabled:opacity-50"
          >
            Passer
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(ratings).length === 0}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enregistrement..." : "Valider les notes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
