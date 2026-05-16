import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(data);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) localStorage.setItem(`wishlist_${user.email}`, JSON.stringify(updated));

    window.dispatchEvent(new Event("storage"));
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex !== -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    const user = JSON.parse(localStorage.getItem("user"));
    if (user) localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));

    window.dispatchEvent(new Event("storage"));

    setToast(product.name);
    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="My Wishlist" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {wishlist.length === 0 ? (

          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center h-[65vh] text-center">
            <div className="text-7xl mb-4">🤍</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-500 mb-6">
              Save items you love by tapping the heart icon
            </p>
            <button
              onClick={() => navigate("/products")}
              className="bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition"
            >
              Explore Products
            </button>
          </div>

        ) : (

          <>
            {/* HEADING */}
            <div className="mb-6">
              <p className="text-gray-500 text-sm">{wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved</p>
            </div>

            {/* GRID */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow hover:shadow-xl hover:-translate-y-2 transition duration-300 overflow-hidden"
                >
                  {/* IMAGE */}
                  <div className="relative">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-full h-52 object-cover"
                    />
                    {/* REMOVE HEART */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow hover:scale-110 transition text-lg"
                    >
                      ❤️
                    </button>
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-gray-500 text-xs mb-3">
                      {item.group} • {item.type}
                    </p>

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">₹{item.price}</span>

                      <button
                        onClick={() => addToCart(item)}
                        className="bg-black text-white px-4 py-1.5 rounded-lg text-sm hover:scale-105 hover:bg-gray-800 transition"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </>

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

    </div>
  );
};

export default Wishlist;