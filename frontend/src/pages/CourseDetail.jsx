import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../API/axios';
import { useAuth } from '../AuthContext.jsx';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [subs, setSubs] = useState({}); // { assignmentId: submission }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isStudent = user.role === 'student';
  const isEnrolled = !!enrollment;
  const canAccess = !isStudent || isEnrolled; // instructor/admin ko hamesha access

  const loadSubmissions = async () => {
    const res = await api.get(`/submissions/my/${id}`);
    const map = {};
    res.data.forEach((s) => (map[s.assignmentId] = s));
    setSubs(map);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data);
        if (isStudent) {
          const my = await api.get('/enrollments/my');
          const found = my.data.find((e) => e.course?._id === id) || null;
          setEnrollment(found);
          if (found) await loadSubmissions();
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Course not found');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isStudent]);

  const enroll = async () => {
    try {
      const res = await api.post(`/enrollments/${id}`);
      setEnrollment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not enroll');
    }
  };

  const toggleDone = async (materialId) => {
    try {
      const res = await api.put(`/enrollments/${id}/toggle/${materialId}`);
      setEnrollment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update');
    }
  };

  const submit = async (assignmentId, content) => {
    const res = await api.post(`/submissions/${id}/${assignmentId}`, { content });
    setSubs({ ...subs, [assignmentId]: res.data });
  };

  if (loading) return <p className="muted">Loading...</p>;
  if (!course) {
    return (
      <p>
        {error || 'Course not found.'} <Link to="/courses">Back to courses</Link>
      </p>
    );
  }

  const done = enrollment?.completedMaterials || [];
  // progress = (complete kiye material + submit kiye assignments) / total
  const total = course.materials.length + course.assignments.length;
  const finished = done.length + Object.keys(subs).length;
  const progress = total ? Math.round((finished / total) * 100) : 0;

  return (
    <>
      <div className="card">
        <span className="tag">{course.category}</span>
        <h1 className="page-title">{course.title}</h1>
        <p>{course.description}</p>
        <p className="small muted">Instructor: {course.instructor?.name}</p>
        {error && <p className="error">{error}</p>}

        {isStudent && !isEnrolled && (
          <button className="btn" onClick={enroll}>Enroll in this course</button>
        )}
        {isStudent && isEnrolled && (
          <>
            <p className="success">You are enrolled</p>
            <div className="bar">
              <div className="bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="small">{progress}% complete</p>
          </>
        )}
      </div>

      {!canAccess ? (
        <p className="muted">Enroll in this course to unlock materials and assignments.</p>
      ) : (
        <>
          <h2>Learning Materials</h2>
          {course.materials.length === 0 && <p className="muted">No materials yet.</p>}
          {course.materials.map((m) => (
            <div className="card row" key={m._id}>
              <div>
                <strong>{m.title}</strong> <span className="tag">{m.type}</span>
                <br />
                <a href={m.url} target="_blank" rel="noreferrer">Open material</a>
              </div>
              {isStudent && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={done.includes(m._id)}
                    onChange={() => toggleDone(m._id)}
                  />
                  Completed
                </label>
              )}
            </div>
          ))}

          <h2>Assignments</h2>
          {course.assignments.length === 0 && <p className="muted">No assignments yet.</p>}
          {course.assignments.map((a) => (
            <AssignmentCard
              key={a._id}
              assignment={a}
              saved={subs[a._id]}
              canSubmit={isStudent}
              onSubmit={(text) => submit(a._id, text)}
            />
          ))}
        </>
      )}
    </>
  );
}

function AssignmentCard({ assignment, saved, canSubmit, onSubmit }) {
  const [text, setText] = useState(saved?.content || '');
  const [msg, setMsg] = useState('');

  // saved baad mein load hota hai, isliye text ko sync karo
  useEffect(() => {
    if (saved?.content) setText(saved.content);
  }, [saved?.content]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await onSubmit(text);
      setMsg('Submitted!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not submit');
    }
  };

  const graded = saved && saved.grade !== null && saved.grade !== undefined;

  return (
    <div className="card">
      <h3>{assignment.title}</h3>
      <p>{assignment.description}</p>
      {assignment.dueDate && (
        <p className="small muted">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit}>
          <textarea
            required
            rows={4}
            placeholder="Write your answer or paste a link (GitHub, Drive...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-small" type="submit">
            {saved ? 'Update submission' : 'Submit'}
          </button>
          {msg && <p className="small muted">{msg}</p>}
        </form>
      )}


      {graded && (
        <p className="success">
          Graded: {saved.grade}/{assignment.maxMarks}
          {saved.feedback && ` - Feedback: ${saved.feedback}`}
        </p>
      )}

      {saved && !graded && <p className="small muted">Submitted, waiting for grade.</p>}
    </div>
  );
}