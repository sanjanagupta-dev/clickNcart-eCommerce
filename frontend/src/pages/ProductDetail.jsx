import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthModal from "../components/AuthModal";
import { getProducts } from "../services/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(data);
  }, []);

  useEffect(() => {
    getProducts()
      .then(data => {
        const found = data.find(p => p.id === parseInt(id));
        setProduct(found);
        // Related: same type, exclude current
        const related = data
          .filter(p => p.type === found?.type && p.id !== parseInt(id))
          .slice(0, 4);
        setRelatedProducts(related);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const isLoggedIn = () => localStorage.getItem("user");
  const isInWishlist = (pid) => wishlist.some(item => item.id === pid);

  const toggleWishlist = () => {
    if (!isLoggedIn()) { setShowAuth(true); return; }
    let updated = [...wishlist];
    const exists = updated.find(item => item.id === product.id);
    if (exists) {
      updated = updated.filter(item => item.id !== product.id);
    } else {
      updated.push(product);
    }
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = (prod = product, qty = quantity) => {
    if (!isLoggedIn()) { setShowAuth(true); return; }
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex(item => item.id === prod.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({ ...prod, quantity: qty });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
    setToast(prod.name);
    setTimeout(() => setToast(""), 2500);
  };

  if (loading) return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="Click & Cart" />
      <div className="flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!product) return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="Click & Cart" />
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">Product not found</h2>
        <button onClick={() => navigate("/products")}
          className="mt-4 bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition">
          Back to Products
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="Click & Cart" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <span onClick={() => navigate("/")} className="cursor-pointer hover:text-orange-500">Home</span>
          <span>/</span>
          <span onClick={() => navigate("/products")} className="cursor-pointer hover:text-orange-500">Products</span>
          <span>/</span>
          <span className="text-black font-medium">{product.name}</span>
        </div>

        {/* MAIN PRODUCT */}
        <div className="bg-white rounded-2xl shadow p-6 md:p-10 grid md:grid-cols-2 gap-10 mb-10">

          {/* IMAGE */}
          <div className="relative">
            <img
              src={product.img}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-2xl"
            />
            {product.tag && (
              <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                {product.tag}
              </span>
            )}
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-between">
            <div>
              {/* CATEGORY */}
              <p className="text-orange-500 text-sm font-semibold mb-2">
                {product.group} • {product.type}
              </p>

              {/* NAME */}
              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>

              {/* DESCRIPTION */}
              <p className="text-gray-500 mb-6">{product.descr || "Premium quality product"}</p>

              {/* PRICE */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl font-bold">₹{product.price}</span>
                {product.oldPrice && (
                  <>
                    <span className="text-gray-400 text-xl line-through">₹{product.oldPrice}</span>
                    <span className="bg-green-100 text-green-600 text-sm px-2 py-1 rounded-full font-semibold">
                      {Math.round((1 - product.price / product.oldPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* HIGHLIGHTS */}
              <div className="bg-orange-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>🚚</span> Free delivery on orders above ₹500
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>↩️</span> Easy 7-day returns
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>✅</span> Genuine product guarantee
                </div>
              </div>

              {/* QUANTITY */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-semibold text-sm">Quantity:</span>
                <div className="flex items-center gap-3 border rounded-xl px-4 py-2">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="text-lg font-bold text-gray-500 hover:text-black"
                  >−</button>
                  <span className="font-semibold w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="text-lg font-bold text-gray-500 hover:text-black"
                  >+</button>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => addToCart()}
                className="flex-1 bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 hover:scale-105 transition"
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className={`px-5 py-3 rounded-xl border-2 font-semibold transition hover:scale-105 ${
                  isInWishlist(product.id)
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 hover:border-orange-400"
                }`}
              >
                {isInWishlist(product.id) ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map(item => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/product/${item.id}`)}
                  className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition duration-300 cursor-pointer overflow-hidden"
                >
                  <img src={item.img} alt={item.name} className="w-full h-52 object-cover" />
                  <div className="p-4">
                    <h3 className="font-semibold text-sm">{item.name}</h3>
                    <p className="text-gray-500 text-xs mb-2">{item.group} • {item.type}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">₹{item.price}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(item, 1); }}
                        className="bg-black text-white px-3 py-1 rounded text-sm hover:scale-105 transition"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white font-semibold px-6 py-4 rounded-xl shadow-lg">
            Added to cart!
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

export default ProductDetail;