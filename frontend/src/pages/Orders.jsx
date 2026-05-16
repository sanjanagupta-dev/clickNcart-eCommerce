import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getMyOrders, cancelOrder } from "../services/api";

const statusColors = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped:   "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-500",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  const user = localStorage.getItem("user");
  if (!user) {
    // Don't redirect — just show empty state
    setLoading(false);
    return;
  }
  getMyOrders()
    .then(data => setOrders(data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, [navigate]);

  const handleCancel = async (orderId) => {
  if (!window.confirm("Are you sure you want to cancel this order?")) return;
  setCancellingId(orderId);
  try {
    await cancelOrder(orderId);
    // Remove from list completely
    setOrders(orders.filter(o => o.id !== orderId));
  } catch (err) {
    alert("Failed to cancel order");
  } finally {
    setCancellingId(null);
  }
};

  return (
    <div className="bg-[#f6ede6] min-h-screen">
      <Navbar title="My Orders" />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">

        {loading ? (
          <div className="flex justify-center items-center h-[60vh]">
            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>

        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[65vh] text-center">
            <div className="text-7xl mb-4">📦</div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-3">No Orders Yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet</p>
            <button onClick={() => navigate("/products")}
              className="bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition">
              Start Shopping
            </button>
          </div>

        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-500 text-sm">
                {orders.length} order{orders.length > 1 ? "s" : ""} placed
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((order) => {
                const items = JSON.parse(order.itemsJson || "[]");
                const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
                });
                const canCancel = order.status === "Confirmed" || order.status === "Pending";

                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow p-5">

                    {/* HEADER */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Order #{order.id}</p>
                        <p className="text-xs text-gray-400">{date}</p>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* ITEMS */}
                    <div className="space-y-3 mb-4">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img src={item.img} alt={item.name}
                            className="w-14 h-14 rounded-lg object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-bold">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>

                    {/* FOOTER */}
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {order.paymentMethod === "COD" ? "💵 Cash on Delivery" : "💳 Paid Online"}
                      </span>
                      <span className="font-bold text-lg">₹{order.total}</span>
                    </div>

                    {/* CANCEL BUTTON */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancellingId === order.id}
                        className="mt-3 w-full border border-red-300 text-red-500 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60"
                      >
                        {cancellingId === order.id ? "Cancelling..." : "Cancel Order"}
                      </button>
                    )}

                    {order.status === "Cancelled" && (
                      <div className="mt-3 text-center text-xs text-red-400 bg-red-50 py-2 rounded-xl">
                        This order has been cancelled
                      </div>
                    )}

                    {order.status === "Delivered" && (
                      <div className="mt-3 text-center text-xs text-green-600 bg-green-50 py-2 rounded-xl">
                        ✅ Order delivered successfully!
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;