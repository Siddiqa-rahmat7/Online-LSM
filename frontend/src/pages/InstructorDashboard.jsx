import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { getCourses, saveCourses } from '../data/courseStore.js';
import { getSubmissions, getGrades, saveGrade } from '../data/submissionStore.js';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState(getCourses());
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [openId, setOpenId] = useState(null);   // kaun sa course "Manage" mode mein hai

  // sirf is instructor ke apne courses
  const mine = courses.filter((c) => c.instructor === user.name);

  // state aur localStorage dono update karta hai
  const update = (list) => {
    setCourses(list);
    saveCourses(list);
  };

  // ek course ke andar kuch badalne ka helper
  const changeCourse = (id, change) =>
    update(courses.map((c) => (c.id === id ? { ...c, ...change(c) } : c)));

  const createCourse = (e) => {
    e.preventDefault();
    const newCourse = {
      id: Date.now(),
      title: form.title,
      category: form.category || 'General',
      description: form.description,
      instructor: user.name,
      materials: [],
      assignments: [],
    };
    update([newCourse, ...courses]);
    setForm({ title: '', category: '', description: '' });
  };

  const deleteCourse = (id) => {
    if (!window.confirm('Delete this course?')) return;
    update(courses.filter((c) => c.id !== id));
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

      <form className="card" onSubmit={createCourse}>
        <h3>Create a new course</h3>
        <input required placeholder="Course title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Category (e.g. Programming)" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <textarea required rows={3} placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <button className="btn" type="submit">Create course</button>
      </form>

      <h2>My Courses</h2>
      {mine.length === 0 && <p className="muted">You haven't created any course yet.</p>}

      {mine.map((c) => (
        <div className="card" key={c.id}>
          <div className="row">
            <div>
              <h3>{c.title}</h3>
              <p className="small muted">
                {c.materials.length} materials · {c.assignments.length} assignments
              </p>
            </div>
            <div className="actions">
              <Link className="btn btn-small btn-outline" to={`/courses/${c.id}`}>View</Link>
              <button className="btn btn-small"
                onClick={() => setOpenId(openId === c.id ? null : c.id)}>
                {openId === c.id ? 'Close' : 'Manage'}
              </button>
              <button className="btn btn-small btn-danger" onClick={() => deleteCourse(c.id)}>
                Delete
              </button>
            </div>
          </div>

          {openId === c.id && <ManageCourse course={c} changeCourse={changeCourse} />}
        </div>
      ))}
    </>
  );
}

function ManageCourse({ course, changeCourse }) {
  const [mat, setMat] = useState({ title: '', url: '', type: 'link' });
  const [asg, setAsg] = useState({ title: '', description: '', maxMarks: 100 });

  const addMaterial = (e) => {
    e.preventDefault();
    changeCourse(course.id, (c) => ({
      materials: [...c.materials, { ...mat, id: `m${Date.now()}` }],
    }));
    setMat({ title: '', url: '', type: 'link' });
  };

  const removeMaterial = (mid) =>
    changeCourse(course.id, (c) => ({
      materials: c.materials.filter((m) => m.id !== mid),
    }));

  const addAssignment = (e) => {
    e.preventDefault();
    changeCourse(course.id, (c) => ({
      assignments: [
        ...c.assignments,
        { ...asg, maxMarks: Number(asg.maxMarks), id: `a${Date.now()}` },
      ],
    }));
    setAsg({ title: '', description: '', maxMarks: 100 });
  };

  const removeAssignment = (aid) =>
    changeCourse(course.id, (c) => ({
      assignments: c.assignments.filter((a) => a.id !== aid),
    }));

  return (
    <div className="manage">
      <h4>Materials</h4>
      <ul>
        {course.materials.map((m) => (
          <li key={m.id}>
            {m.title} ({m.type}){' '}
            <a href={m.url} target="_blank" rel="noreferrer">link</a>{' '}
            <button className="link-btn" onClick={() => removeMaterial(m.id)}>remove</button>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={addMaterial}>
        <input required placeholder="Title" value={mat.title}
          onChange={(e) => setMat({ ...mat, title: e.target.value })} />
        <input required placeholder="https://..." value={mat.url}
          onChange={(e) => setMat({ ...mat, url: e.target.value })} />
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
          <li key={a.id}>
            {a.title} ({a.maxMarks} marks){' '}
            <button className="link-btn" onClick={() => removeAssignment(a.id)}>remove</button>
          </li>
        ))}
      </ul>
      <form className="inline-form" onSubmit={addAssignment}>
        <input required placeholder="Assignment title" value={asg.title}
          onChange={(e) => setAsg({ ...asg, title: e.target.value })} />
        <input placeholder="Description" value={asg.description}
          onChange={(e) => setAsg({ ...asg, description: e.target.value })} />
        <input type="number" min="1" style={{ width: 90 }} value={asg.maxMarks}
          onChange={(e) => setAsg({ ...asg, maxMarks: e.target.value })} />
        <button className="btn btn-small" type="submit">Add assignment</button>
      </form>
      <Submissions course={course} />
    </div>
  );
}
function Submissions({ course }) {
  const [, refresh] = useState(0);   // grade save hone par dobara draw karne ke liye
  const subs = getSubmissions(course.id);

  return (
    <>
      <h4>Student submissions ({subs.length})</h4>
      {subs.length === 0 && <p className="small muted">No submissions yet.</p>}
      {subs.map((s) => {
        const assignment = course.assignments.find((a) => a.id === s.aid);
        if (!assignment) return null;   // assignment delete ho chuka ho to skip
        return (
          <GradeRow
            key={s.email + s.aid}
            course={course}
            sub={s}
            assignment={assignment}
            onSaved={() => refresh((n) => n + 1)}
          />
        );
      })}
    </>
  );
}

function GradeRow({ course, sub, assignment, onSaved }) {
  const saved = getGrades(sub.email, course.id)[sub.aid];
  const [marks, setMarks] = useState(saved?.marks ?? '');
  const [feedback, setFeedback] = useState(saved?.feedback ?? '');
  const [msg, setMsg] = useState('');

  const save = () => {
    const m = Number(marks);
    if (marks === '' || Number.isNaN(m) || m < 0 || m > assignment.maxMarks) {
      setMsg(`Marks must be between 0 and ${assignment.maxMarks}`);
      return;
    }
    saveGrade(sub.email, course.id, sub.aid, { marks: m, feedback });
    setMsg('Saved');
    onSaved();
  };

  return (
    <div className="grade-row">
      <p>
        <strong>{sub.email}</strong> · {assignment.title}{' '}
        <span className="tag">{saved ? 'graded' : 'submitted'}</span>
      </p>
      <p className="small">{sub.text}</p>
      <div className="inline-form">
        <input type="number" min="0" max={assignment.maxMarks}
          placeholder={`Marks /${assignment.maxMarks}`} style={{ width: 120 }}
          value={marks} onChange={(e) => setMarks(e.target.value)} />
        <input placeholder="Feedback" value={feedback}
          onChange={(e) => setFeedback(e.target.value)} />
        <button className="btn btn-small" onClick={save}>Save grade</button>
      </div>
      {msg && <p className="small muted">{msg}</p>}
    </div>
  );
}