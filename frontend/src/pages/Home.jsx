import AuthModal from "../components/AuthModal";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProducts } from "../services/api";

const Home = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [homeProducts, setHomeProducts] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(data);
  }, []);

  // Fetch first 4 products from API
  useEffect(() => {
    getProducts()
      .then(data => {
  const featured = data.filter(p => 
    ['Urban Jacket', 'Running Shoes', 'Handbag', 'Casual Top'].includes(p.name)
  );
  setHomeProducts(featured);
})
      .catch(err => console.error(err));
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

  return (
    <div className="bg-[#f6ede6] min-h-screen text-gray-900 transition-all duration-300 overflow-x-hidden">
      <Navbar
        title={
          <>
            Click <span className="text-orange-500">&</span> Cart
          </>
        }
      />

      {/* HERO */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center px-4 md:px-6 py-12">
        <div>
          <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
            NEW ARRIVAL
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
            Shop smart, look <span className="text-orange-500">amazing</span>
          </h1>
          <p className="text-gray-600 mt-4">
            Discover trendy fashion and everyday essentials with premium quality.
          </p>
          <div className="mt-6 flex gap-4">
            <button onClick={() => navigate("/products")}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 hover:bg-orange-600 active:scale-95 transition duration-200">
              Shop Now
            </button>
          </div>
        </div>
        <div className="flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c"
            alt="fashion"
            className="rounded-2xl shadow-lg w-full max-w-[400px] hover:scale-105 transition duration-300"
          />
        </div>
      </div>

      {/* TRENDING PRODUCTS */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Trending Products</h2>
            <p className="text-gray-500 text-sm">Handpicked products just for you</p>
          </div>
          <button onClick={() => navigate("/products")}
            className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-100 hover:scale-105 active:scale-95 transition">
            View All
          </button>
        </div>

        {homeProducts.length === 0 ? (
          <div className="flex justify-center py-10">
            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {homeProducts.map((item) => (
              <div key={item.id}
              onClick={() => navigate(`/product/${item.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition duration-300 overflow-hidden">

                <div className="relative">
                  <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
                  {item.tag && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      {item.tag}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                  <p className="text-gray-500 text-xs mb-2">{item.descr}</p>

                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">₹{item.price}</span>
                      {item.oldPrice && (
                        <span className="text-gray-400 text-sm line-through ml-2">
                          ₹{item.oldPrice}
                        </span>
                      )}
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); }}
                      className="text-xl hover:scale-110 transition">
                      {isInWishlist(item.id) ? "❤️" : "♡"}
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                      className="bg-black text-white px-3 py-1 rounded text-sm hover:scale-105 transition">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WHY SHOPPERS LOVE US */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
        <h2 className="text-2xl font-bold mb-6">Why shoppers love us</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer">
            🚚
            <h3 className="font-semibold mt-2">Fast Delivery</h3>
            <p className="text-sm text-gray-500">Quick shipping & tracking</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer">
            💳
            <h3 className="font-semibold mt-2">Secure Payment</h3>
            <p className="text-sm text-gray-500">100% safe checkout</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer">
            ↩️
            <h3 className="font-semibold mt-2">Easy Returns</h3>
            <p className="text-sm text-gray-500">Hassle-free returns</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer">
            ⭐
            <h3 className="font-semibold mt-2">Top Rated</h3>
            <p className="text-sm text-gray-500">Loved by customers</p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="font-bold">Click & Cart</h2>
            <p className="text-sm text-gray-400">© 2026 All rights reserved</p>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="cursor-pointer hover:text-orange-400 transition">Privacy</span>
            <span className="cursor-pointer hover:text-orange-400 transition">Terms</span>
            <span className="cursor-pointer hover:text-orange-400 transition">Support</span>
            <span className="cursor-pointer hover:text-orange-400 transition">Contact</span>
          </div>
        </div>
      </div>

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

export default Home;