const BASE_URL = "http://localhost:8080/api";

export const sendRegisterOtp = async (email) => {
  const res = await fetch(`${BASE_URL}/users/send-register-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to send OTP");
  return res.text();
};

export const verifyAndRegister = async (name, email, password, otp) => {
  const res = await fetch(`${BASE_URL}/users/verify-register-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, otp }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Invalid OTP");
  }
  return res.json();
};

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Invalid email or password");
  return res.json();
};

export const sendResetOtp = async (email) => {
  const res = await fetch(`${BASE_URL}/users/send-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Email not found");
  }
  return res.text();
};

export const verifyResetOtp = async (email, otp) => {
  const res = await fetch(`${BASE_URL}/users/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) throw new Error("Invalid or expired OTP");
  return res.text();
};

export const resetPassword = async (email, newPassword) => {
  const res = await fetch(`${BASE_URL}/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: newPassword }),
  });
  if (!res.ok) throw new Error("Failed to reset password");
  return res.text();
};

export const placeOrder = async (itemsJson, total, paymentMethod) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/place`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ itemsJson, total, paymentMethod }),
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
};

export const getMyOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/my`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const getProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
};

export const addProduct = async (product) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Failed to add product");
  return res.json();
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to delete product");
  return res.text();
};

export const getAllOrders = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/all`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
};

export const updateOrderStatus = async (id, status) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
};

export const createRazorpayOrder = async (amount) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error("Failed to create payment order");
  return res.json(); // direct JSON now
};

export const cancelOrder = async (id) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Failed to cancel order");
  return res.text();
};

export const updateProfile = async (name) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}/users/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};