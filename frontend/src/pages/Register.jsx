import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    try {
      register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <h2>Create account</h2>
      {error && <p className="error">{error}</p>}

      <label>Full name</label>
      <input required value={form.name} onChange={set('name')} />

      <label>Email</label>
      <input type="email" required value={form.email} onChange={set('email')} />

      <label>Password (min 6 characters)</label>
      <input type="password" required minLength={6} value={form.password} onChange={set('password')} />

      <label>I am a</label>
      <select value={form.role} onChange={set('role')}>
        <option value="student">Student</option>
        <option value="instructor">Instructor</option>
      </select>

      <button className="btn" type="submit">Register</button>
      <p className="muted">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}