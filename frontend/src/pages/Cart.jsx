import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import CheckoutModal from "../components/CheckoutModal";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    const updatedCart = storedCart.map(item => ({
      ...item,
      quantity: item.quantity || 1
    }));

    setCart(updatedCart);
  }, []);

  const updateStorage = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (index) => {
    const updated = [...cart];
    updated[index].quantity += 1;
    updateStorage(updated);
  };

  const removeItem = (index) => {
  const updated = cart.filter((_, i) => i !== index);
  updateStorage(updated);

  // 🔥 update navbar instantly
  window.dispatchEvent(new Event("storage"));
};

  const decreaseQty = (index) => {
    const updated = [...cart];
    if (updated[index].quantity > 1) {
      updated[index].quantity -= 1;
    } else {
      updated.splice(index, 1);
    }
    updateStorage(updated);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const delivery = 100;
  const discount = 100;

  const total = subtotal + delivery - discount;

  return (
  <div className="bg-[#f6ede6] min-h-screen overflow-x-hidden text-gray-900">
    <Navbar title="My Cart" />
    
    {cart.length === 0 ? (

  // ✅ EMPTY CART UI
  <div className="flex flex-col items-center justify-center h-[70vh] text-center">

    <h2 className="text-2xl md:text-3xl font-semibold mb-3">
      Your Cart is Empty 🛒
    </h2>

    <p className="text-gray-500 mb-6">
      Looks like you haven’t added anything yet
    </p>

    <button
      onClick={() => window.location.href = "/products"}
      className="bg-black text-white px-6 py-3 rounded-full hover:scale-105 transition"
    >
      Continue Shopping
    </button>

  </div>

) : (

  // ✅ NORMAL CART UI
  <div className="max-w-8xl mx-auto mt-6 md:mt-8 space-y-6">

    {/* LEFT: CART ITEMS */}
    <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6 max-w-2xl mx-auto">

      <div className="space-y-4">
        {cart.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#fafafa] p-5 rounded-xl"
          >

            {/* LEFT */}
            <div className="flex items-center gap-4 w-full">
              <img
                src={item.img}
                alt={item.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-lg object-cover"
              />

              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500 text-sm">
                  ₹{item.price}
                </p>
              </div>
            </div>

            {/* RIGHT */}
<div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-6 w-full md:w-auto">
              {/* PRICE */}
              <div className="text-left md:text-right w-full md:w-auto">
                <p className="text-lg font-bold">
                  ₹{item.price * item.quantity}
                </p>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  ₹{item.price} × {item.quantity}
                </p>
              </div>

              {/* QUANTITY */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => decreaseQty(index)}
                  className="bg-gray-200 px-2.5 py-0.4 rounded"
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() => increaseQty(index)}
                  className="bg-green-500 text-white px-2 rounded"
                >
                  +
                </button>
              </div>

              {/* REMOVE */}
              <button
                onClick={() => removeItem(index)}
                className="text-red-500 text-sm hover:underline mt-2 md:mt-0"
              >
                Remove
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>

    {/* SUMMARY */}
    <div className="bg-white rounded-2xl shadow p-6 w-full max-w-2xl mx-auto">

      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      <div className="text-sm space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery</span>
          <span>₹{delivery}</span>
        </div>

        <div className="flex justify-between text-green-600">
          <span>Discount</span>
          <span>-₹{discount}</span>
        </div>
      </div>

      <div className="flex justify-between font-bold text-lg mt-4">
        <span>Total</span>
        <span>₹{total}</span>
      </div>

      <button
  onClick={() => setShowCheckout(true)}
  className="w-full mt-5 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
>
  Checkout
</button>

    </div>

  </div>

)}
<CheckoutModal
  isOpen={showCheckout}
  onClose={() => setShowCheckout(false)}
  cart={cart}
  total={total}
/>
</div>
);
};

export default Cart;