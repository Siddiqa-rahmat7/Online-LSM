import { useState, useEffect } from 'react';
import api from '../API/axios';
import CourseCard from '../components/CourseCard.jsx';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/courses')
      .then((res) =>
        // purane CourseCard ko chalane ke liye shape badal rahe hain:
        // MongoDB ka _id -> id, aur instructor object -> naam
        setCourses(
          res.data.map((c) => ({
            ...c,
            id: c._id,
            instructor: c.instructor?.name || 'Unknown',
          }))
        )
      )
      .catch((err) => setError(err.response?.data?.message || 'Could not load courses'))
      .finally(() => setLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q)
  );

  return (
    <>
      <h1 className="page-title">Browse Courses</h1>
      <input
        className="search"
        placeholder="Search by title or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="muted">Loading courses...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        filtered.length === 0 ? (
          <p className="muted">No courses found.</p>
        ) : (
          <div className="grid">
            {filtered.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )
      )}
    </>
  );
}