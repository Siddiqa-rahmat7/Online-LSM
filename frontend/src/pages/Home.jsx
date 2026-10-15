import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="hero">
      <h1>Welcome to LearnHub</h1>
      <p className="muted">Learn new skills with courses from expert instructors.</p>
      <Link className="btn" to="/register">Get Started</Link>
      <Link className="btn btn-outline" to="/login">Login</Link>
    </div>
  );
}