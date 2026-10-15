import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Demo users (backend aane tak). Naye register hue users localStorage mein jayenge.
export const demoUsers = [
  { name: 'Rahul Singh', email: 'rahul@lms.com', password: 'learn123', role: 'student' },
  { name: 'Dr. Meera Sharma', email: 'meera@lms.com', password: 'teach123', role: 'instructor' },
  { name: 'Admin', email: 'admin@lms.com', password: 'admin123', role: 'admin' },
];

const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  // page refresh par bhi login bana rahe, isliye localStorage se padhte hain
  const [user, setUser] = useState(() => read('user', null));

  const allUsers = () => [...demoUsers, ...read('users', [])];

  const login = (email, password) => {
    const found = allUsers().find(
      (u) => u.email === email.toLowerCase() && u.password === password
    );
    if (!found) throw new Error('Invalid email or password');
    const safeUser = { name: found.name, email: found.email, role: found.role };
    localStorage.setItem('user', JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const register = (form) => {
    const email = form.email.toLowerCase();
    if (allUsers().some((u) => u.email === email)) {
      throw new Error('Email is already registered');
    }
    const newUser = { ...form, email };
    localStorage.setItem('users', JSON.stringify([...read('users', []), newUser]));
    login(email, form.password);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}