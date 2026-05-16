import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getProducts, addProduct, deleteProduct, getAllOrders, updateOrderStatus } from "../services/api";

const statusColors = {
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped:   "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-500",
};

const Admin = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("products"); // "products" | "orders"
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({
    name: "", price: "", oldPrice: "", img: "",
    type: "", group: "", tag: "", desc: ""
  });

  const categories = ["Jackets", "Jeans", "Top", "Dress", "Trousers", "Shoes", "Accessories"];
  const groups = ["Men", "Women"];
  const statuses = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchProducts();
    fetchOrders();
  }, [navigate]);

  const fetchProducts = () => {
    getProducts()
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchOrders = () => {
    getAllOrders()
      .then(data => setOrders(data))
      .catch(err => console.error(err));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await addProduct({
        ...form,
        price: parseFloat(form.price),
        oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
      });
      setForm({ name: "", price: "", oldPrice: "", img: "", type: "", group: "", tag: "", desc: "" });
      setShowForm(false);
      fetchProducts();
      setToast("✅ Product added!");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      alert("Failed to add product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      setToast("🗑️ Product deleted!");
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o =>
        o.id === orderId ? { ...o, status: newStatus } : o
      ));
      setToast(`✅ Order #${orderId} → ${newStatus}`);
      setTimeout(() => setToast(""), 2500);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const inputClass = "w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-400 text-sm";

  return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="Admin Panel" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* TABS */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setTab("products")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              tab === "products" ? "bg-black text-white" : "bg-white border hover:bg-gray-50"
            }`}
          >
            📦 Products
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              tab === "orders" ? "bg-black text-white" : "bg-white border hover:bg-gray-50"
            }`}
          >
            🧾 Orders
          </button>
        </div>

        {/* ── PRODUCTS TAB ── */}
        {tab === "products" && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold">Product Management</h2>
                <p className="text-gray-500 text-sm">{products.length} products in store</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition"
              >
                {showForm ? "✕ Cancel" : "+ Add Product"}
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Add New Product</h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input placeholder="Product Name *" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass} required />
                  <input placeholder="Price *" type="number" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={inputClass} required />
                  <input placeholder="Old Price (optional)" type="number" value={form.oldPrice}
                    onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                    className={inputClass} />
                  <input placeholder="Image URL *" value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    className={inputClass} required />
                  <select value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className={inputClass} required>
                    <option value="">Select Category *</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    className={inputClass} required>
                    <option value="">Select Group *</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input placeholder="Tag (e.g. New, Sale)" value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    className={inputClass} />
                  <input placeholder="Description" value={form.desc}
                    onChange={(e) => setForm({ ...form, desc: e.target.value })}
                    className={inputClass} />
                  {form.img && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-2">Image Preview:</p>
                      <img src={form.img} alt="preview"
                        className="h-32 w-32 object-cover rounded-xl border" />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <button type="submit"
                      className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition">
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Group</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Price</th>
                      <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.img} alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover" />
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{p.type}</td>
                        <td className="px-5 py-3 text-gray-500">{p.group}</td>
                        <td className="px-5 py-3 font-semibold">₹{p.price}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleDelete(p.id)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Order Management</h2>
              <p className="text-gray-500 text-sm">{orders.length} total orders</p>
            </div>

            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Order</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Customer</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Items</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Total</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Payment</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const items = JSON.parse(order.itemsJson || "[]");
                    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    });
                    return (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <p className="font-semibold">#{order.id}</p>
                          <p className="text-xs text-gray-400">{date}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">{order.userEmail}</td>
                        <td className="px-5 py-3">
                          <div className="flex gap-1">
                            {items.slice(0, 3).map((item, i) => (
                              <img key={i} src={item.img} alt={item.name}
                                className="w-8 h-8 rounded object-cover" />
                            ))}
                            {items.length > 3 && (
                              <span className="text-xs text-gray-400 self-center">
                                +{items.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold">₹{order.total}</td>
                        <td className="px-5 py-3 text-xs text-gray-500">
                          {order.paymentMethod === "COD" ? "💵 COD" : "💳 Online"}
                        </td>
                        <td className="px-5 py-3">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer ${statusColors[order.status] || "bg-gray-100"}`}
                          >
                            {statuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-white font-semibold px-6 py-4 rounded-xl shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Admin;