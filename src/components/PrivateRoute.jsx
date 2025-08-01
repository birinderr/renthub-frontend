import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user || !user.token) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}