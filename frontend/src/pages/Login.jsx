import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  try {
    await login(form.email, form.password);
    navigate('/dashboard');
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
  }
};

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}

      <label>Email</label>
      <input
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <label>Password</label>
      <input
        type="password"
        required
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button className="btn" type="submit">Login</button>
      <p className="muted">
        New here? <Link to="/register">Create an account</Link>
      </p>
      <p className="muted small">
        Demo: rahul@lms.com / learn123 · meera@lms.com / teach123 · admin@lms.com / admin123
      </p>
    </form>
  );
}