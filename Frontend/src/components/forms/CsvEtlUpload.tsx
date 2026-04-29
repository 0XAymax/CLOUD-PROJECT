import { useRef, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const CsvEtlUpload = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [details, setDetails] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setDetails(null);

    if (!file) {
      setMessage('Veuillez sélectionner un fichier CSV.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Vous devez être connecté pour importer.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/etl/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errMsg = data?.error || `Erreur upload (HTTP ${res.status})`;
        setMessage(errMsg);
        return;
      }

      setMessage(data?.status === 'SUCCESS' ? 'Import & analyse terminés.' : 'Import terminé, mais ETL en échec.');
      setDetails(
        [
          data?.savedFilePath ? `Fichier: ${data.savedFilePath}` : null,
          data?.durationMs != null ? `Durée: ${data.durationMs}ms` : null,
          data?.exitCode != null ? `Exit code: ${data.exitCode}` : null,
          data?.stderr ? `stderr: ${String(data.stderr).slice(0, 400)}` : null,
        ]
          .filter(Boolean)
          .join('\n')
      );

      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      setMessage('Erreur réseau lors de l\'upload.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700">
      <h2 className="text-xl font-semibold mb-2 text-white">Importer des ventes (CSV)</h2>
      <p className="text-gray-400 mb-4">
        Réservé au rôle <span className="text-white font-semibold">Analyste</span> — Importer puis lancer l’analyse automatiquement.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-2" htmlFor="csv-input">
            Fichier CSV
          </label>
          <input
            id="csv-input"
            ref={inputRef}
            type="file"
            accept= ".csv,text/csv"
            className="block w-full text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white hover:file:bg-slate-600"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? 'Import en cours…' : 'Importer et analyser'}
        </button>

        {message && (
          <div className="text-sm text-white bg-slate-900 border border-slate-700 rounded p-3">
            <div className="font-semibold">{message}</div>
            {details && <pre className="mt-2 text-gray-300 whitespace-pre-wrap">{details}</pre>}
          </div>
        )}
      </form>
    </div>
  );
};

export default CsvEtlUpload;
