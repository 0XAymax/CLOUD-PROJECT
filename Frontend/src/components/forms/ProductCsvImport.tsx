import { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download, Database } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';

interface ImportResult {
  success: boolean;
  message: string;
  totalRows?: number;
  insertedRows?: number;
  updatedRows?: number;
  errorRows?: number;
  errors?: Array<{ row: number; error: string }>;
  duration?: number;
}

const ProductCsvImport = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const downloadTemplate = () => {
    const template = `nom,description,prix,stock,categorie,seuilAlerte,image
Ordinateur Portable,Ordinateur portable 15 pouces,899.99,50,Informatique,10,https://example.com/laptop.jpg
Souris Sans Fil,Souris ergonomique sans fil,29.99,150,Informatique,20,https://example.com/mouse.jpg
Clavier Mécanique,Clavier mécanique RGB,79.99,80,Informatique,15,https://example.com/keyboard.jpg`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_produits.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setResult(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!file) {
      setResult({
        success: false,
        message: 'Veuillez sélectionner un fichier CSV.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);

      const startTime = Date.now();
      const response = await axiosInstance.post('/api/produits/import-csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const duration = Date.now() - startTime;

      setResult({
        success: true,
        message: response.data.message || 'Import réussi',
        totalRows: response.data.totalRows,
        insertedRows: response.data.insertedRows,
        updatedRows: response.data.updatedRows,
        errorRows: response.data.errorRows,
        errors: response.data.errors,
        duration,
      });

      // Réinitialiser le formulaire après succès
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'import CSV:', error);
      setResult({
        success: false,
        message: error.response?.data?.error || 'Erreur lors de l\'import du fichier CSV',
        errors: error.response?.data?.errors,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Import de Produits CSV
          </h2>
          <p className="text-gray-400 mt-1">
            Importez vos produits via un fichier CSV avec traitement ETL automatique
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Télécharger le modèle
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Zone de drop */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
          }`}
        >
          <input
            id="csv-input"
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <label
            htmlFor="csv-input"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload
              className={`w-12 h-12 mb-4 ${
                dragActive ? 'text-blue-400' : 'text-gray-400'
              }`}
            />
            <p className="text-white font-medium mb-2">
              {file ? file.name : 'Glissez votre fichier CSV ici'}
            </p>
            <p className="text-gray-400 text-sm">
              ou cliquez pour parcourir
            </p>
            {file && (
              <div className="mt-4 flex items-center gap-2 text-green-400">
                <FileText className="w-5 h-5" />
                <span className="text-sm">
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </label>
        </div>

        {/* Format attendu */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            Format du fichier CSV
          </h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p>Colonnes requises : <code className="text-blue-400">nom, prix, stock, categorie</code></p>
            <p>Colonnes optionnelles : <code className="text-gray-400">description, seuilAlerte, image</code></p>
            <p className="text-gray-400 text-xs mt-2">
              • Le séparateur doit être une virgule (,)
              <br />• La première ligne doit contenir les en-têtes
              <br />• Les prix doivent être au format décimal (ex: 29.99)
            </p>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg"
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Import et traitement ETL en cours...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Importer et traiter les données
            </>
          )}
        </button>

        {/* Résultat */}
        {result && (
          <div
            className={`rounded-lg p-4 border ${
              result.success
                ? 'bg-green-900/20 border-green-500/50'
                : 'bg-red-900/20 border-red-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    result.success ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {result.message}
                </p>

                {result.success && (
                  <div className="mt-3 space-y-2 text-sm">
                    {result.totalRows !== undefined && (
                      <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                        <span className="text-gray-300">Total de lignes:</span>
                        <span className="text-white font-medium">{result.totalRows}</span>
                      </div>
                    )}
                    {result.insertedRows !== undefined && (
                      <div className="flex items-center justify-between bg-green-900/20 p-2 rounded">
                        <span className="text-gray-300">Produits insérés:</span>
                        <span className="text-green-400 font-medium">{result.insertedRows}</span>
                      </div>
                    )}
                    {result.updatedRows !== undefined && result.updatedRows > 0 && (
                      <div className="flex items-center justify-between bg-blue-900/20 p-2 rounded">
                        <span className="text-gray-300">Produits mis à jour:</span>
                        <span className="text-blue-400 font-medium">{result.updatedRows}</span>
                      </div>
                    )}
                    {result.errorRows !== undefined && result.errorRows > 0 && (
                      <div className="flex items-center justify-between bg-red-900/20 p-2 rounded">
                        <span className="text-gray-300">Lignes en erreur:</span>
                        <span className="text-red-400 font-medium">{result.errorRows}</span>
                      </div>
                    )}
                    {result.duration !== undefined && (
                      <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded">
                        <span className="text-gray-300">Durée du traitement:</span>
                        <span className="text-white font-medium">{result.duration}ms</span>
                      </div>
                    )}
                  </div>
                )}

                {result.errors && result.errors.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-300 mb-2">Erreurs détaillées:</p>
                    <div className="space-y-1">
                      {result.errors.map((err, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-slate-800/50 p-2 rounded text-gray-300"
                        >
                          Ligne {err.row}: {err.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductCsvImport;
