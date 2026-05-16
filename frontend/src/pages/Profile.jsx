import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { updateProfile } from "../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/");
    } else {
      setUser(storedUser);
      setNewName(storedUser.name);
    }
  }, [navigate]);

  const logout = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      const cart = localStorage.getItem("cart");
      const wishlist = localStorage.getItem("wishlist");
      if (cart) localStorage.setItem(`cart_${user.email}`, cart);
      if (wishlist) localStorage.setItem(`wishlist_${user.email}`, wishlist);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    try {
      await updateProfile(newName);
      const updatedUser = { ...user, name: newName };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event("storage"));
      setEditing(false);
      setToast("Profile updated!");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="My Profile" />

      <div className="max-w-xl mx-auto mt-10 px-4">

        {/* PROFILE CARD */}
        <div className="bg-white p-8 rounded-2xl shadow">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold mb-4">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            {!editing ? (
              <>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <span className="mt-2 bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm">
                  {user.role}
                </span>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="w-full space-y-3 mt-2">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full border rounded-xl px-4 py-3 outline-none bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-60">
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setNewName(user.name); }}
                    className="flex-1 border py-3 rounded-xl font-semibold hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {!editing && (
            <div className="space-y-3">
              {/* QUICK LINKS */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button onClick={() => navigate("/orders")}
                  className="flex items-center gap-2 border rounded-xl px-4 py-3 hover:bg-gray-50 transition text-sm font-medium">
                  📦 My Orders
                </button>
                <button onClick={() => navigate("/wishlist")}
                  className="flex items-center gap-2 border rounded-xl px-4 py-3 hover:bg-gray-50 transition text-sm font-medium">
                  🤍 Wishlist
                </button>
              </div>

              <button onClick={() => setEditing(true)}
                className="w-full border-2 border-orange-400 text-orange-500 py-3 rounded-xl font-semibold hover:bg-orange-50 transition">
                ✏️ Edit Profile
              </button>

              <button onClick={logout}
                className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition">
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

      {toast && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white font-semibold px-6 py-4 rounded-xl shadow-lg">
            ✅ {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;