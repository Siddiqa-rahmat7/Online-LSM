import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

// Login nahi hai to /login par bhej deta hai
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}