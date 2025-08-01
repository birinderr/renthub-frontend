// src/pages/Home.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const itemsSectionRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/items')
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Extract unique categories from items
  const categories = ['all', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleItemClick = (itemId) => {
    navigate(`/items/${itemId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Welcome to RentHub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Rent anything, anytime, anywhere - Your marketplace for everything!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-transparent hover:border-white hover:border-2 hover:text-white transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => {
                  if (itemsSectionRef.current) {
                    itemsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Start Renting
              </button>
              <button
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105 shadow-lg cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                List Your Items
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div ref={itemsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium cursor-pointer transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-xl text-gray-600">Loading awesome items...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {selectedCategory === 'all' ? 'All Items' : selectedCategory}
              </h2>
              <p className="text-gray-600">
                {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map(item => (
                <div
                  key={item._id}
                  onClick={() => handleItemClick(item._id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-lg">
                      <span className="text-sm font-semibold text-gray-700">{item.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {'⭐'.repeat(Math.floor(item.averageRating || 0))}
                        <span className="ml-2 text-sm text-gray-600">
                          {item.averageRating ? item.averageRating : 'No ratings'}{item.reviewCount ? ` (${item.reviewCount} reviews)` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{item.pricePerDay}
                        <span className="text-sm text-gray-500 font-normal">/day</span>
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                        Rent Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No items found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose RentHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">Secure & Safe</h3>
              <p className="text-gray-600">All items are verified and insured for your peace of mind</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Quick Booking</h3>
              <p className="text-gray-600">Book instantly with our streamlined rental process</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-lg">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-gray-600">Get help whenever you need it from our support team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
