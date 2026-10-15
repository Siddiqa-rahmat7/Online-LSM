import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCourses } from '../data/courseStore.js';
import { getGrades } from '../data/submissionStore.js';
import { useAuth } from '../AuthContext.jsx';
import useLocalStorage from '../useLocalStorage.js';

export default function CourseDetail() {
  const { id } = useParams();           // URL se course ka id
  const { user } = useAuth();
  const course = getCourses().find((c) => c.id === Number(id));

  // user ke hisaab se alag-alag keys, taaki har user ka data alag rahe
  const [enrolled, setEnrolled] = useLocalStorage(`enrolled_${user.email}`, []);
  const [done, setDone] = useLocalStorage(`done_${user.email}_${id}`, []);
  const [subs, setSubs] = useLocalStorage(`subs_${user.email}_${id}`, {});

  if (!course) {
    return <p>Course not found. <Link to="/courses">Back to courses</Link></p>;
  }

  const isStudent = user.role === 'student';
  const isEnrolled = enrolled.includes(course.id);
  const canAccess = !isStudent || isEnrolled;   // instructor/admin ko hamesha access

  const enroll = () => setEnrolled([...enrolled, course.id]);

  const toggleDone = (mid) =>
    setDone(done.includes(mid) ? done.filter((m) => m !== mid) : [...done, mid]);

  const submit = (aid, text) => setSubs({ ...subs, [aid]: text });

  // progress = (complete materials + submit assignments) / total
  const total = course.materials.length + course.assignments.length;
  const finished = done.length + Object.keys(subs).length;
  const progress = total ? Math.round((finished / total) * 100) : 0;

  // instructor ne jo marks diye hain (assignment id ke hisaab se)
  const grades = getGrades(user.email, id);

  return (
    <>
      <div className="card">
        <span className="tag">{course.category}</span>
        <h1 className="page-title">{course.title}</h1>
        <p>{course.description}</p>
        <p className="small muted">Instructor: {course.instructor}</p>

        {isStudent && !isEnrolled && (
          <button className="btn" onClick={enroll}>Enroll in this course</button>
        )}
        {isStudent && isEnrolled && (
          <>
            <p className="success">You are enrolled</p>
            <div className="bar"><div className="bar-fill" style={{ width: `${progress}%` }} /></div>
            <p className="small">{progress}% complete</p>
          </>
        )}
      </div>

      {!canAccess ? (
        <p className="muted">Enroll in this course to unlock materials and assignments.</p>
      ) : (
        <>
          <h2>Learning Materials</h2>
          {course.materials.map((m) => (
            <div className="card row" key={m.id}>
              <div>
                <strong>{m.title}</strong> <span className="tag">{m.type}</span>
                <br />
                <a href={m.url} target="_blank" rel="noreferrer">Open material</a>
              </div>
              {isStudent && (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={done.includes(m.id)}
                    onChange={() => toggleDone(m.id)}
                  />
                  Completed
                </label>
              )}
            </div>
          ))}

          <h2>Assignments</h2>
          {course.assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              saved={subs[a.id]}
              grade={grades[a.id]}
              canSubmit={isStudent}
              onSubmit={(text) => submit(a.id, text)}
            />
          ))}
        </>
      )}
    </>
  );
}

function AssignmentCard({ assignment, saved, grade, canSubmit, onSubmit }) {
  const [text, setText] = useState(saved || '');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(text);
    setMsg('Submitted!');
  };

  return (
    <div className="card">
      <h3>{assignment.title} <span className="muted small">({assignment.maxMarks} marks)</span></h3>
      <p>{assignment.description}</p>

      {canSubmit && (
        <form onSubmit={handleSubmit}>
          <textarea
            required
            rows={3}
            placeholder="Write your answer or paste a link (GitHub, Drive...)"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn btn-small" type="submit">
            {saved ? 'Update submission' : 'Submit'}
          </button>
          {msg && <span className="success small"> {msg}</span>}
          {saved && !msg && <p className="small muted">Already submitted.</p>}
        </form>
      )}

      {grade && (
        <p className="success">
          Graded: {grade.marks}/{assignment.maxMarks}
          {grade.feedback && ` · Feedback: ${grade.feedback}`}
        </p>
      )}
    </div>
  );
}