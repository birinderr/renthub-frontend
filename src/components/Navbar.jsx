import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white shadow-lg">
      <Link to="/" className="text-2xl font-bold hover:text-gray-300">
        RentHub
      </Link>

      <div className="flex items-center space-x-6">
        <Link to="/" className="hover:text-gray-300">Home</Link>

        {user ? (
          <>
            <Link to="/profile" className="hover:text-gray-300">Profile</Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
