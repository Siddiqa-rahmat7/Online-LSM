import { useState } from 'react';
import { getCourses } from '../data/courseStore.js';
import CourseCard from '../components/CourseCard.jsx';

export default function Courses() {
  const courses = getCourses();
  const [search, setSearch] = useState('');


  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
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

      {filtered.length === 0 ? (
        <p className="muted">No courses found.</p>
      ) : (
        <div className="grid">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </>
  );
}