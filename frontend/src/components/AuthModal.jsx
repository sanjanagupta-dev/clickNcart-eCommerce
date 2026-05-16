import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  sendRegisterOtp,
  verifyAndRegister,
  sendResetOtp,
  verifyResetOtp,
  resetPassword,
} from "../services/api";

const AuthModal = ({ isOpen, onClose, type = "login" }) => {
  const navigate = useNavigate();

  // Views: "login" | "register" | "register-otp" | "forgot-email" | "forgot-otp" | "forgot-newpass"
  const [view, setView] = useState(type === "login" ? "login" : "register");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clear = () => {
    setError(""); setSuccess("");
    setOtp(""); setNewPassword("");
  };

  const saveUserSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({
      name: data.name, email: data.email, role: data.role
    }));
    const savedCart = localStorage.getItem(`cart_${data.email}`);
    const savedWishlist = localStorage.getItem(`wishlist_${data.email}`);
    if (savedCart) localStorage.setItem("cart", savedCart);
    if (savedWishlist) localStorage.setItem("wishlist", savedWishlist);
    window.dispatchEvent(new Event("storage"));
  };

  // ── LOGIN ──
  const handleLogin = async (e) => {
    e.preventDefault(); clear();
    if (!email || !password) return setError("Please fill all fields");
    setLoading(true);
    try {
      const data = await loginUser(email, password);
      saveUserSession(data);
      onClose(); navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── REGISTER: send OTP ──
  const handleSendRegisterOtp = async (e) => {
    e.preventDefault(); clear();
    if (!name || !email || !password) return setError("Please fill all fields");
    setLoading(true);
    try {
      await sendRegisterOtp(email);
      setSuccess(`OTP sent to ${email}`);
      setView("register-otp");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── REGISTER: verify OTP ──
  const handleVerifyRegisterOtp = async (e) => {
    e.preventDefault(); clear();
    if (!otp) return setError("Please enter the OTP");
    setLoading(true);
    try {
      const data = await verifyAndRegister(name, email, password, otp);
      saveUserSession(data);
      onClose(); navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── FORGOT: send OTP ──
  const handleSendResetOtp = async (e) => {
    e.preventDefault(); clear();
    if (!email) return setError("Please enter your email");
    setLoading(true);
    try {
      await sendResetOtp(email);
      setSuccess(`OTP sent to ${email}`);
      setView("forgot-otp");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── FORGOT: verify OTP ──
  const handleVerifyResetOtp = async (e) => {
    e.preventDefault(); clear();
    if (!otp) return setError("Please enter the OTP");
    setLoading(true);
    try {
      await verifyResetOtp(email, otp);
      setView("forgot-newpass");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // ── FORGOT: set new password ──
  const handleResetPassword = async (e) => {
    e.preventDefault(); clear();
    if (!newPassword) return setError("Please enter a new password");
    setLoading(true);
    try {
      await resetPassword(email, newPassword);
      setSuccess("Password reset! Redirecting to login...");
      setTimeout(() => { setView("login"); clear(); }, 2000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  const inputClass = "w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400";
  const btnClass = "w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-[90%] max-w-md rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl">✕</button>

        {/* ERROR / SUCCESS */}
        {error && <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 text-center">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-2 rounded-lg mb-4 text-center">{success}</div>}

        {/* ── LOGIN VIEW ── */}
        {view === "login" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-center mb-6">Login to continue shopping</p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              <div className="text-right">
                <button type="button" onClick={() => { clear(); setView("forgot-email"); }}
                  className="text-sm text-orange-500 hover:underline">
                  Forgot Password?
                </button>
              </div>
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Please wait..." : "Login"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Don't have an account?
              <button onClick={() => { clear(); setView("register"); }}
                className="text-orange-500 font-semibold ml-2">Register</button>
            </p>
          </>
        )}

        {/* ── REGISTER VIEW ── */}
        {view === "register" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
            <p className="text-gray-500 text-center mb-6">Register to start shopping</p>
            <form onSubmit={handleSendRegisterOtp} className="space-y-4">
              <input type="text" placeholder="Full Name" value={name}
                onChange={(e) => setName(e.target.value)} className={inputClass} />
              <input type="email" placeholder="Email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              <input type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              Already have an account?
              <button onClick={() => { clear(); setView("login"); }}
                className="text-orange-500 font-semibold ml-2">Login</button>
            </p>
          </>
        )}

        {/* ── REGISTER OTP VIEW ── */}
        {view === "register-otp" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">Verify Email</h2>
            <p className="text-gray-500 text-center mb-6">
              Enter the 6-digit OTP sent to<br />
              <span className="font-semibold text-black">{email}</span>
            </p>
            <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
              <input type="text" placeholder="Enter 6-digit OTP" value={otp}
                onChange={(e) => setOtp(e.target.value)} maxLength={6}
                className={inputClass + " text-center text-2xl tracking-widest"} />
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Verifying..." : "Verify & Login"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              <button onClick={() => { clear(); setView("register"); }}
                className="text-orange-500 font-semibold">← Change Email</button>
            </p>
          </>
        )}

        {/* ── FORGOT: ENTER EMAIL VIEW ── */}
        {view === "forgot-email" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">Forgot Password</h2>
            <p className="text-gray-500 text-center mb-6">
              Enter your registered email to receive an OTP
            </p>
            <form onSubmit={handleSendResetOtp} className="space-y-4">
              <input type="email" placeholder="Your registered email" value={email}
                onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              <button onClick={() => { clear(); setView("login"); }}
                className="text-orange-500 font-semibold">← Back to Login</button>
            </p>
          </>
        )}

        {/* ── FORGOT: VERIFY OTP VIEW ── */}
        {view === "forgot-otp" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">Enter OTP</h2>
            <p className="text-gray-500 text-center mb-6">
              OTP sent to<br />
              <span className="font-semibold text-black">{email}</span>
            </p>
            <form onSubmit={handleVerifyResetOtp} className="space-y-4">
              <input type="text" placeholder="Enter 6-digit OTP" value={otp}
                onChange={(e) => setOtp(e.target.value)} maxLength={6}
                className={inputClass + " text-center text-2xl tracking-widest"} />
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-5">
              <button onClick={() => { clear(); setView("forgot-email"); }}
                className="text-orange-500 font-semibold">← Change Email</button>
            </p>
          </>
        )}

        {/* ── FORGOT: NEW PASSWORD VIEW ── */}
        {view === "forgot-newpass" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-2">New Password</h2>
            <p className="text-gray-500 text-center mb-6">Enter your new password</p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="password" placeholder="New Password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthModal;