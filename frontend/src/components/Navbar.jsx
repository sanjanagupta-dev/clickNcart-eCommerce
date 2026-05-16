import AuthModal from "./AuthModal";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { AiOutlineHeart, AiOutlineShoppingCart, AiOutlineSearch } from "react-icons/ai";

const Navbar = ({ title }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef();
  const [searchOpen, setSearchOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const location = useLocation();

  useEffect(() => {
    // Load user on mount and on storage change
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    loadUser();
    window.addEventListener("storage", loadUser);


    const updateWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    updateWishlist();
    window.addEventListener("storage", updateWishlist);

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(total);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("storage", updateWishlist);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {
  if (location.pathname !== "/products") {
    setSearchOpen(false);
    setSearchQuery("");
    window.dispatchEvent(new CustomEvent("search", { detail: "" }));
  }
}, [location.pathname]);

  const activeClass = "relative text-black pb-1 after:absolute after:left-0 after:-bottom-0 after:w-full after:h-[2px] after:bg-orange-500";
  const inactiveClass = "hover:text-orange-500 transition cursor-pointer";

  return (
    <>
      {/* TOP BAR */}
      <div className="bg-black text-white text-sm text-center py-2">
        Free Shipping on Orders Above ₹500 🚀
      </div>

      {/* NAVBAR */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex gap-12 text-xl font-medium items-center">
            <NavLink to="/"
              className={({ isActive }) => isActive ? activeClass : inactiveClass}>
              Home
            </NavLink>

            <NavLink to="/products"
              className={({ isActive }) => isActive ? activeClass : inactiveClass}>
              Products
            </NavLink>

            <NavLink to="/orders"
              className={({ isActive }) => isActive ? activeClass : inactiveClass}>
              Orders
            </NavLink>

            <NavLink
  to="/profile"
  onClick={(e) => {
    if (!localStorage.getItem("user")) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuth(true);
    }
  }}
  className={({ isActive }) => isActive ? activeClass : inactiveClass}
>
  Profile
</NavLink>

            {/* ADMIN LINK — only for ADMIN role */}
            {user?.role === "ADMIN" && (
              <NavLink to="/admin"
                className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                Admin
              </NavLink>
            )}
          </div>

          {/* ICONS */}
          <div className="flex items-center gap-6">

            {/* SEARCH */}
<div
  onClick={() => {
    if (window.location.pathname === "/") {
      navigate("/products");
      setTimeout(() => setSearchOpen(true), 100);
    } else {
      setSearchOpen(!searchOpen);
    }
  }}
  className="relative cursor-pointer text-2xl font-bold hover:scale-110 transition"
>
  <AiOutlineSearch />
</div>

            {/* WISHLIST */}
            <div onClick={() => navigate("/wishlist")}
              className="relative cursor-pointer text-2xl font-bold hover:scale-110 transition">
              <AiOutlineHeart />
              {wishlistCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-orange-500 text-white text-xs px-2 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </div>

            {/* CART */}
            <div onClick={() => navigate("/cart")}
              className="relative cursor-pointer text-2xl font-bold hover:scale-110 transition">
              <AiOutlineShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-3 bg-orange-500 text-white text-xs px-2 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <div className="md:hidden text-2xl cursor-pointer" onClick={() => setMenuOpen(true)}>
              <HiOutlineMenu />
            </div>
          </div>
        </div>
      </div>
      {/* SEARCH BAR */}
{searchOpen && (
  <div className="bg-white border-t shadow-sm sticky top-[72px] z-40">
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
      <AiOutlineSearch className="text-xl text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        autoFocus
        onChange={(e) => {
          setSearchQuery(e.target.value);
          window.dispatchEvent(new CustomEvent("search", { detail: e.target.value }));
        }}
        className="w-full outline-none text-base"
      />
      <button
        onClick={() => {
          setSearchQuery("");
          setSearchOpen(false);
          window.dispatchEvent(new CustomEvent("search", { detail: "" }));
        }}
        className="text-gray-400 hover:text-black text-xl shrink-0"
      >
        ✕
      </button>
    </div>
  </div>
)}


      {/* BACKDROP */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      )}

      {/* SLIDE MENU */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 shadow-xl transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-end p-4">
          <HiOutlineX className="text-2xl cursor-pointer" onClick={() => setMenuOpen(false)} />
        </div>

        <div className="flex flex-col gap-6 px-6 text-lg font-medium">
          <span onClick={() => { navigate("/"); setMenuOpen(false); }}>Home</span>
          <span onClick={() => { navigate("/products"); setMenuOpen(false); }}>Products</span>
          <span onClick={() => { navigate("/orders"); setMenuOpen(false); }}>Orders</span>
          <span onClick={() => { setMenuOpen(false); if (!localStorage.getItem("user")) { setShowAuth(true); } else { navigate("/profile"); }}}>Profile</span>

          {/* ADMIN in mobile menu — only for ADMIN role */}
          {user?.role === "ADMIN" && (
            <span
              onClick={() => { navigate("/admin"); setMenuOpen(false); }}
              className="text-orange-500 font-semibold"
            >
              Admin Panel
            </span>
          )}
        </div>

      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        type="login"
      />
    </>
  );
};

export default Navbar;