import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder, createRazorpayOrder } from "../services/api";

const CheckoutModal = ({ isOpen, onClose, cart, total }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState("address");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethodUsed, setPaymentMethodUsed] = useState("");

  const [address, setAddress] = useState({
    fullName: "", phone: "", street: "", city: "", pincode: "",
  });

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!address.fullName || !address.phone || !address.street || !address.city || !address.pincode) {
      setError("Please fill all fields"); return;
    }
    if (address.phone.length !== 10) {
      setError("Enter a valid 10-digit phone number"); return;
    }
    setError("");
    setStep("payment");
  };

  const clearCartAndRedirect = (method) => {
    localStorage.removeItem("cart");
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser) localStorage.removeItem(`cart_${currentUser.email}`);
    window.dispatchEvent(new Event("storage"));
    setPaymentMethodUsed(method);
    setOrderPlaced(true);
  };

  const handleOnlinePayment = async () => {
  setLoading(true);
  setError("");
  try {
    const data = await createRazorpayOrder(total);
    const user = JSON.parse(localStorage.getItem("user")) || {};

    const options = {
      key: data.keyId,
      amount: total * 100,
      currency: "INR",
      name: "Click & Cart",
      description: "Order Payment",
      order_id: data.orderId,
      prefill: {
        name: user.name,
        email: user.email,
        contact: address.phone,
      },
      theme: { color: "#f97316" },
      handler: async function (response) {
        // Payment successful — place order
        try {
          const itemsJson = JSON.stringify(cart);
          await placeOrder(itemsJson, total, "Online");
          clearCartAndRedirect("Online");
        } catch (err) {
          setError("Payment done but order failed. Contact support.");
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (response) {
      setError("Payment failed: " + response.error.description);
      setLoading(false);
    });
    rzp.open();
    setLoading(false);
    } catch (err) {
      setError("Failed to initialize payment. Try again.");
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    setLoading(true);
    setError("");
    try {
      const itemsJson = JSON.stringify(cart);
      await placeOrder(itemsJson, total, "COD");
      clearCartAndRedirect("COD");
    } catch (err) {
      setError("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

    const inputClass = "w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 text-sm";

    const StepBar = () => (
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className={`flex items-center gap-2 text-sm font-semibold ${step === "address" ? "text-orange-500" : "text-green-500"}`}>
        {step !== "address" ? (
        <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
        ) : (
        <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">1</div>
        )}
        Address
        </div>
        <div className={`h-px w-12 ${step !== "address" ? "bg-green-400" : "bg-gray-200"}`} />
        <div className={`flex items-center gap-2 text-sm font-semibold ${step !== "address" ? "text-orange-500" : "text-gray-400"}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${step !== "address" ? "bg-orange-500" : "bg-gray-300"}`}>2</div>
        Payment
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl text-gray-400 hover:text-black">✕</button>

        {/* ── ORDER SUCCESS SCREEN ── */}
        {orderPlaced ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-4">
              ✅
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
            <p className="text-gray-500 mb-1">Your order has been placed successfully.</p>
            <p className="text-sm text-gray-400 mb-6">
              Payment:{" "}
              <span className="font-semibold text-black">
                {paymentMethodUsed === "COD" ? "Cash on Delivery" : "Paid Online"}
              </span>
            </p>

            {paymentMethodUsed === "COD" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700 mb-6 w-full">
                💵 Please keep ₹{total} ready at the time of delivery.
              </div>
            )}
            {paymentMethodUsed === "Online" && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 mb-6 w-full">
                💳 Payment of ₹{total} received successfully.
              </div>
            )}

            <button
              onClick={() => { onClose(); navigate("/orders"); }}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition"
            >
              View My Orders
            </button>
          </div>

        ) : (
          /* ── NORMAL CHECKOUT FLOW ── */
          <>
            <StepBar />

            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 text-center">{error}</div>
            )}

            {/* ── ADDRESS ── */}
            {step === "address" && (
              <>
                <h2 className="text-2xl font-bold mb-1">Delivery Address</h2>
                <p className="text-gray-500 text-sm mb-5">Where should we deliver?</p>
                <form onSubmit={handleAddressSubmit} className="space-y-3">
                  <input type="text" placeholder="Full Name" value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className={inputClass} />
                  <input type="tel" placeholder="Phone Number (10 digits)" value={address.phone} maxLength={10}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/, "") })} className={inputClass} />
                  <input type="text" placeholder="Street / Area / Landmark" value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })} className={inputClass} />
                  <div className="flex gap-3">
                    <input type="text" placeholder="City" value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })} className={inputClass} />
                    <input type="text" placeholder="Pincode" maxLength={6} value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/, "") })} className={inputClass} />
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4 text-sm space-y-1">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{total}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Delivery</span><span>₹100</span></div>
                    <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹100</span></div>
                    <div className="flex justify-between font-bold text-base pt-2 border-t border-orange-200">
                      <span>Total</span><span>₹{total}</span>
                    </div>
                  </div>

                  <button type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition">
                    Continue to Payment →
                  </button>
                </form>
              </>
            )}

            {/* ── PAYMENT METHOD ── */}
            {step === "payment" && (
              <>
                <button onClick={() => setStep("address")} className="text-orange-500 text-sm mb-4 hover:underline">← Change Address</button>
                <h2 className="text-2xl font-bold mb-1">Payment</h2>
                <p className="text-gray-500 text-sm mb-5">
                  Total: <span className="font-bold text-black text-base">₹{total}</span>
                </p>

                <div className="bg-orange-50 rounded-xl p-4 mb-5 text-sm">
                  <p className="font-semibold mb-1">📍 Delivering to</p>
                  <p className="text-gray-700">{address.fullName} · {address.phone}</p>
                  <p className="text-gray-500">{address.street}, {address.city} - {address.pincode}</p>
                </div>

                <div className="space-y-3">
                  <button onClick={handleOnlinePayment}
                    disabled={loading}
                    className="w-full border-2 border-orange-400 hover:bg-orange-50 py-4 rounded-xl transition flex items-center gap-4 px-5 disabled:opacity-60">
                    <span className="text-2xl">💳</span>
                    <div className="text-left">
                      <p className="font-semibold">Pay Online</p>
                      <p className="text-xs text-gray-500">UPI, Cards, Net Banking via Razorpay</p>
                    </div>
                  </button>

                  <button onClick={handleCOD} disabled={loading}
                    className="w-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-4 rounded-xl transition flex items-center gap-4 px-5 disabled:opacity-60">
                    <span className="text-2xl">💵</span>
                    <div className="text-left">
                      <p className="font-semibold">Cash on Delivery</p>
                      <p className="text-xs text-gray-500">Pay when your order arrives</p>
                    </div>
                  </button>
                </div>

                {loading && (
                  <div className="flex justify-center mt-5">
                    <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;