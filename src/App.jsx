import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Profile from './pages/Profile';
import ItemDetail from './pages/ItemDetail';
import Admin from './pages/Admin';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <Navbar />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/items/:id" element={<ItemDetail />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
