import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Navbar />
        <Routes>
          <Route
          path="/"
          element={<Navigate to={user ? "/profile" : "/auth"} replace />}
        />
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
