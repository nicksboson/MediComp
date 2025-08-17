import React, { useState } from 'react';
import { Search, ShoppingCart, ExternalLink, AlertCircle, Loader2, Star, TrendingUp } from 'lucide-react';

const MedicineSearchApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchMedicine = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a medicine name');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/search-medicine', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ medicineName: searchTerm }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.message || 'Search failed');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMedicine();
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price not available';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <ShoppingCart className="text-blue-600" />
            Medicine Finder
          </h1>
          <p className="text-gray-600 text-lg">Find the best prices for your medicines across India</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter medicine name (e.g., Paracetamol, Azithromycin)"
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={searchMedicine}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2 font-semibold"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Search Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Search Results for "{results.search_information.query_displayed}"
                  </h2>
                  <p className="text-gray-600 flex items-center gap-2">
                    <TrendingUp className="text-green-500" size={16} />
                    {results.search_information.total_results} products found, sorted by price (lowest first)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {results.shopping_items.length}
                  </div>
                  <div className="text-gray-500 text-sm">Available Options</div>
                </div>
              </div>
            </div>

            {/* Medicine Cards */}
            {results.shopping_items.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.shopping_items.map((medicine, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Ranking Badge */}
                    {index < 3 && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          <Star size={12} className={index === 0 ? 'fill-current' : ''} />
                          #{index + 1} Best Price
                        </div>
                      </div>
                    )}

                    {/* Medicine Image */}
                    <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                      <img
                        src={medicine.thumbnail || '/api/placeholder/200/200'}
                        alt={medicine.title}
                        className="max-h-full max-w-full object-contain p-4"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/200/200';
                        }}
                      />
                    </div>

                    {/* Medicine Details */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 min-h-[3rem]">
                        {medicine.title}
                      </h3>
                      
                      {/* Price */}
                      <div className="mb-3">
                        <div className={`text-2xl font-bold ${
                          medicine.extracted_price > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {formatPrice(medicine.extracted_price)}
                        </div>
                        {medicine.extracted_price > 0 && index === 0 && (
                          <div className="text-xs text-green-600 font-medium">Lowest Price!</div>
                        )}
                      </div>

                      {/* Source */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">Available at:</div>
                        <div className="font-medium text-blue-600">{medicine.source}</div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => openLink(medicine.link)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <ExternalLink size={16} />
                        View on {medicine.source}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <ShoppingCart size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
                <p className="text-gray-500">Try searching with a different medicine name.</p>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        {!results && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Search Tips</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="p-4 bg-blue-50 rounded-lg">
                <strong className="text-blue-600">Generic Names:</strong> Try searching with generic names like "Paracetamol" instead of brand names
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <strong className="text-green-600">Common Medicines:</strong> Search for antibiotics, pain relievers, vitamins, etc.
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <strong className="text-purple-600">Accurate Spelling:</strong> Make sure the medicine name is spelled correctly
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineSearchApp;