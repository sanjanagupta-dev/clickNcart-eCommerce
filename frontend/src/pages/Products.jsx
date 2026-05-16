import AuthModal from "../components/AuthModal";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getProducts } from "../services/api";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  // Fetch products from API
  useEffect(() => {
    getProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingProducts(false));
  }, []);

  // Load wishlist
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(data);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

useEffect(() => {
  // Read from URL params (when coming from home page)
  const params = new URLSearchParams(window.location.search);
  const urlSearch = params.get("search");
  if (urlSearch) setSearchQuery(urlSearch);

  // Also listen for in-page search events
  const handleSearch = (e) => setSearchQuery(e.detail);
  window.addEventListener("search", handleSearch);
  return () => window.removeEventListener("search", handleSearch);
}, []);

  const isLoggedIn = () => localStorage.getItem("user");

  const toggleWishlist = (product) => {
    if (!isLoggedIn()) {
      alert("Please login first");
      setShowAuth(true);
      return;
    }
    let updatedWishlist = [...wishlist];
    const exists = updatedWishlist.find(item => item.id === product.id);
    if (exists) {
      updatedWishlist = updatedWishlist.filter(item => item.id !== product.id);
    } else {
      updatedWishlist.push(product);
    }
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(updatedWishlist));
    }
    window.dispatchEvent(new Event("storage"));
  };

  const isInWishlist = (id) => wishlist.some(item => item.id === id);

  const addToCart = (product) => {
    if (!isLoggedIn()) {
      alert("Please login first");
      setShowAuth(true);
      return;
    }
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) {
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    }
    window.dispatchEvent(new Event("storage"));
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  const categories = [
    "All", "Men", "Women", "Accessories",
    "Shoes", "Top", "Dress", "Jeans", "Trousers", "Jackets"
  ];

  const filteredProducts = products
  .filter(p => category === "All" || p.type === category || p.group === category)
  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-[#f6ede6] min-h-screen overflow-x-hidden text-gray-900">
      <Navbar title="All Products" />

      {/* SUB HEADER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <p className="text-orange-500 font-medium">Explore our collection</p>
      </div>

      {/* FILTER */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm transition
              ${category === cat
                ? "bg-black text-white scale-105"
                : "bg-white border hover:bg-gray-100 hover:scale-105"}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRID */}
      {loadingProducts ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
              className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer overflow-hidden"
            >
              <img src={item.img} alt={item.name} className="w-full h-52 object-cover" />

              <div className="p-4">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-gray-500 text-xs mb-2">
                  {item.group} • {item.type}
                </p>

                <div className="flex justify-between items-center">
                  <span className="font-bold">₹{item.price}</span>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                    className="text-xl transition hover:scale-110"
                  >
                    {isInWishlist(item.id) ? "❤️" : "♡"}
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                    className="bg-black text-white px-3 py-1 rounded text-sm
                    hover:scale-105 hover:bg-gray-800 active:scale-95 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && !loadingProducts && (
  <div className="col-span-4 text-center py-20">
    <div className="text-5xl mb-4">🔍</div>
    <p className="text-xl font-semibold">No products found</p>
    <p className="text-gray-500 mt-2">Try a different search or category</p>
  </div>
)}

      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white font-bold px-6 py-4 rounded-xl shadow-lg">
            Added to Cart
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        type="login"
      />
    </div>
  );
};

export default Products;