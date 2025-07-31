import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile"); 
    }
  }, [user, navigate]);

  const [step, setStep] = useState(1);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async () => {
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
  };

  const handleVerify = async () => {
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
  };

  const handleLogin = async () => {
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => {
              setIsRegistering(false);
              setStep(1);
            }}
            className={`px-4 py-2 rounded-l ${
              !isRegistering ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsRegistering(true);
              setStep(1);
            }}
            className={`px-4 py-2 rounded-r ${
              isRegistering ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegistering ? (step === 1 ? "register" : "verify") : "login"}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {isRegistering && step === 1 && (
              <>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  Register
                </button>
              </>
            )}

            {isRegistering && step === 2 && (
              <>
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <button
                  onClick={handleVerify}
                  className="w-full bg-green-600 text-white py-2 rounded"
                >
                  Verify OTP
                </button>
              </>
            )}

            {!isRegistering && (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-2 rounded"
                >
                  Login
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
