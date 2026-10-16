import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../API/axios';
import { useAuth } from '../AuthContext.jsx';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [mine, setMine] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [openId, setOpenId] = useState(null); // kaun sa course "Manage" mode mein hai
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // sirf is instructor ke apne courses
  const loadCourses = async () => {
    try {
      const res = await api.get('/courses');
      setMine(res.data.filter((c) => c.instructor?._id === user._id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // material/assignment badalne ke baad us course ko list mein update karo
  const replaceCourse = (updated) =>
    setMine(
      mine.map((c) =>
        c._id === updated._id
          ? { ...c, materials: updated.materials, assignments: updated.assignments }
          : c
      )
    );

  const createCourse = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/courses', {
        title: form.title,
        category: form.category || 'General',
        description: form.description,
      });
      setForm({ title: '', category: '', description: '' });
      await loadCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create course');
    }
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setMine(mine.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete course');
    }
  };

  const totalMaterials = mine.reduce((s, c) => s + c.materials.length, 0);
  const totalAssignments = mine.reduce((s, c) => s + c.assignments.length, 0);

  return (
    <>
      <h1 className="page-title">Instructor Dashboard</h1>
      <p className="muted">Welcome, {user.name}</p>

      <div className="stats">
        <div className="stat"><b>{mine.length}</b><span>My courses</span></div>
        <div className="stat"><b>{totalMaterials}</b><span>Materials</span></div>
        <div className="stat"><b>{totalAssignments}</b><span>Assignments</span></div>
      </div>

      {error && <p className="error">{error}</p>}

      <form className="card" onSubmit={createCourse}>
        <h3>Create a new course</h3>
        <input
          required
          placeholder="Course title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          placeholder="Category (e.g. Programming)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <textarea
          required
          rows={3}
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="btn" type="submit">Create course</button>
      </form>

      <h2>My Courses</h2>
      {loading && <p className="muted">Loading...</p>}
      {!loading && mine.length === 0 && (
        <p className="muted">You haven't created any course yet.</p>
      )}

      {mine.map((c) => (
        <div className="card" key={c._id}>
          <div className="row">
            <div>
              <h3>{c.title}</h3>
              <p className="small muted">
                {c.materials.length} materials · {c.assignments.length} assignments
              </p>
            </div>
            <div className="actions">
              <Link className="btn btn-small btn-outline" to={`/courses/${c._id}`}>View</Link>
              <button
                className="btn btn-small"
                onClick={() => setOpenId(openId === c._id ? null : c._id)}
              >
                {openId === c._id ? 'Close' : 'Manage'}
              </button>
              <button className="btn btn-small btn-danger" onClick={() => deleteCourse(c._id)}>
                Delete
              </button>
            </div>
          </div>

          {openId === c._id && <ManageCourse course={c} onChange={replaceCourse} />}
        </div>
      ))}
    </>
  );
}

function ManageCourse({ course, onChange }) {
  const [mat, setMat] = useState({ title: '', url: '', type: 'link' });
  const [asg, setAsg] = useState({ title: '', description: '', maxMarks: 100 });
  const [error, setError] = useState('');

  const addMaterial = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/courses/${course._id}/materials`, mat);
      onChange(res.data);
      setMat({ title: '', url: '', type: 'link' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add material');
    }
  };

  const removeMaterial = async (mid) => {
    try {
      const res = await api.delete(`/courses/${course._id}/materials/${mid}`);
      onChange(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove material');
    }
  };

  const addAssignment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post(`/courses/${course._id}/assignments`, {
        title: asg.title,
        description: asg.description,
        maxMarks: Number(asg.maxMarks),
      });
      onChange(res.data);
      setAsg({ title: '', description: '', maxMarks: 100 });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add assignment');
    }
  };

  const removeAssignment = async (aid) => {
    try {
      const res = await api.delete(`/courses/${course._id}/assignments/${aid}`);
      onChange(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not remove assignment');
    }
  };

  return (
    <div className="manage">
      {error && <p className="error">{error}</p>}

      <h4>Materials</h4>
      <ul>
        {course.materials.map((m) => (
          <li key={m._id}>
            {m.title} ({m.type}){' '}
            <a href={m.url} target="_blank" rel="noreferrer">link</a>{' '}
            <button className="link-btn" onClick={() => removeMaterial(m._id)}>remove</button>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={addMaterial}>
        <input
          required
          placeholder="Title"
          value={mat.title}
          onChange={(e) => setMat({ ...mat, title: e.target.value })}
        />
        <input
          required
          placeholder="https://..."
          value={mat.url}
          onChange={(e) => setMat({ ...mat, url: e.target.value })}
        />
        <select value={mat.type} onChange={(e) => setMat({ ...mat, type: e.target.value })}>
          <option value="link">Link</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="article">Article</option>
        </select>
        <button className="btn btn-small" type="submit">Add material</button>
      </form>

      <h4>Assignments</h4>
      <ul>
        {course.assignments.map((a) => (
          <li key={a._id}>
            {a.title} ({a.maxMarks} marks){' '}
            <button className="link-btn" onClick={() => removeAssignment(a._id)}>remove</button>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={addAssignment}>
        <input
          required
          placeholder="Assignment title"
          value={asg.title}
          onChange={(e) => setAsg({ ...asg, title: e.target.value })}
        />
        <input
          placeholder="Description"
          value={asg.description}
          onChange={(e) => setAsg({ ...asg, description: e.target.value })}
        />
        <input
          type="number"
          min="1"
          style={{ width: 90 }}
          value={asg.maxMarks}
          onChange={(e) => setAsg({ ...asg, maxMarks: e.target.value })}
        />
        <button className="btn btn-small" type="submit">Add assignment</button>
      </form>

      <Submissions course={course} />
    </div>
  );
}

function Submissions({ course }) {
  const [subs, setSubs] = useState([]);

  const load = async () => {
    try {
      const res = await api.get(`/submissions/course/${course._id}`);
      setSubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // assignment add/remove hone par bhi dobara load karo
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course._id, course.assignments.length]);

  return (
    <>
      <h4>Student submissions ({subs.length})</h4>
      {subs.length === 0 && <p className="small muted">No submissions yet.</p>}
      {subs.map((s) => {
        const assignment = course.assignments.find((a) => a._id === s.assignmentId);
        if (!assignment) return null; // assignment delete ho chuka ho to skip
        return <GradeRow key={s._id} sub={s} assignment={assignment} onSaved={load} />;
      })}
    </>
  );
}

function GradeRow({ sub, assignment, onSaved }) {
  const graded = sub.grade !== null && sub.grade !== undefined;
  const [marks, setMarks] = useState(graded ? sub.grade : '');
  const [feedback, setFeedback] = useState(sub.feedback ?? '');
  const [msg, setMsg] = useState('');

  const save = async () => {
    const m = Number(marks);
    if (marks === '' || Number.isNaN(m) || m < 0 || m > assignment.maxMarks) {
      setMsg(`Marks must be between 0 and ${assignment.maxMarks}`);
      return;
    }
    try {
      await api.put(`/submissions/${sub._id}/grade`, { grade: m, feedback });
      setMsg('Saved');
      onSaved();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save grade');
    }
  };

  return (
    <div className="grade-row">
      <p>
        <strong>{sub.student?.email}</strong> · {assignment.title}{' '}
        <span className="tag">{graded ? 'graded' : 'submitted'}</span>
      </p>
      <p className="small">{sub.content}</p>
      <div className="inline-form">
        <input
          type="number"
          min="0"
          max={assignment.maxMarks}
          placeholder={`Marks /${assignment.maxMarks}`}
          style={{ width: 120 }}
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
        />
        <input
          placeholder="Feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button className="btn btn-small" onClick={save}>Save grade</button>
      </div>
      {msg && <p className="small muted">{msg}</p>}
    </div>
  );
}