import { Link } from 'react-router-dom';

export default function CourseCard({ course }) {
  return (
    <div className="card">
      <span className="tag">{course.category}</span>
      <h3>{course.title}</h3>
      <p className="muted">{course.description}</p>
      <p className="small">Instructor: {course.instructor}</p>
      <Link className="btn btn-small" to={`/courses/${course.id}`}>View course</Link>
    </div>
  );
}