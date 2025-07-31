import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", otp: "" });
    setStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      if (!res.ok) throw new Error("Registration failed");
      setStep(2);
      toast.success("Registration successful! Please check your email for OTP.");
    } catch (err) {
      toast.error("Registration error");
    }
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");
      login(data);
      navigate("/profile");
      toast.success("OTP verified! Welcome.");
    } catch (err) {
      toast.error("OTP verification failed");
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      login(data);
      navigate("/profile");
      toast.success("Login successful!");
    } catch (err) {
      toast.error("Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            RentHub
          </h1>
          <p className="text-gray-600">
            {isRegistering ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white backdrop-blur-sm bg-opacity-80 p-8 rounded-2xl shadow-2xl border border-white border-opacity-20">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => {
                setIsRegistering(false);
                resetForm();
              }}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                !isRegistering
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsRegistering(true);
                resetForm();
              }}
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isRegistering
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {/* Registration Step 1 */}
            {isRegistering && step === 1 && (
              <form onSubmit={handleRegister}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Join RentHub and start renting today
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-6"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}

            {/* OTP Verification Step */}
            {isRegistering && step === 2 && (
              <form onSubmit={handleVerify}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify Your Email
                  </h2>
                  <p className="text-gray-600">
                    We've sent a verification code to
                    <br />
                    <span className="font-medium text-gray-900">
                      {formData.email}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-center text-lg tracking-widest disabled:bg-gray-50"
                    maxLength="6"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-6"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-full text-gray-600 py-2 font-medium hover:text-gray-800 transition-colors disabled:opacity-50"
                >
                  ← Back to Registration
                </button>
              </form>
            )}

            {/* Login Form */}
            {!isRegistering && (
              <form onSubmit={handleLogin}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600">Sign in to your RentHub account</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 mr-2"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center mt-6"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Social Login Options */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm mb-4">
              Or continue with
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="mr-2">🔍</span>
                <span className="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <span className="mr-2">📘</span>
                <span className="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          By signing up, you agree to our{" "}
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Terms of Service
          </button>{" "}
          and{" "}
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
