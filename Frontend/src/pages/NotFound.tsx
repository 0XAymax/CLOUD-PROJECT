const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-4xl font-semibold text-gray-800 mt-4">Page non trouvée</h2>
        <p className="text-gray-600 mt-4 mb-8">
          Désolé, la page que vous recherchez n'existe pas.
        </p>
        <a
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
