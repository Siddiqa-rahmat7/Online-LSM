import "./App.css";

const courses = [
  {
    id: 1,
    tilte: "JavaScript",
    category: "Progamming",
    instructor: "Rahul Sharma",
    lesson: 18,
    icon: "⚡",
    color: "yellow",
    },
     {
    id: 1,
    tilte: "Database Managment",
    category: "Database",
    instructor: "Priya Verma",
    lesson: 24,
    icon: "🗄️",
    color: "blue",
    },
     {
    id: 1,
    tilte: "Web Development",
    category: "Development",
    instructor: "Aman Khan",
    lesson: 20,
    icon: "💻",
    color: "purple",
    },
];

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">Neurastep<span>.</span></h2>

        <p className="menu-title">MENU</p>
        <a className="nav active" href="#home">🏠 Dashboard</a>
        <a className="nav" href="#courses">📚 My Courses</a>
        <a className="nav" href="#assignments">📝 Assignments</a>
        <a className="nav" href="#progress">📈 My Progress</a>

        <div className="sidebar-bottom">
          <p>Start learning today!</p>
          <small>Your future begins with knowledge.</small>
        </div>
      </aside>
      
 <main className="main">
        <header className="topbar">
          <div>
            <h2>Student Dashboard</h2>
            <p>Welcome back! Ready to learn something new?</p>
          </div>
          <div className="profile">
            <span>👩‍🎓</span>
            <div>
              <strong>Student</strong>
              <small>Learner Account</small>
            </div>
          </div>
        </header>
         <section className="welcome" id="home">
          <div>
            <p className="eyebrow">YOUR LEARNING JOURNEY</p>
            <h1>Learn new skills.<br />Build your future.</h1>
            <p>Explore courses and grow your knowledge every day.</p>
            <a className="primary-btn" href="#courses">
              Explore Courses →
            </a>
          </div>
          <div className="welcome-icon">🎓</div>
        </section>

          <section className="stats" id="progress">
          <article className="stat-card">
            <span>📚</span>
            <p>Available Courses</p>
            <h2>12</h2>
          </article>
          <article className="stat-card">
            <span>✅</span>
            <p>Completed Lessons</p>
            <h2>08</h2>
          </article>
          <article className="stat-card">
            <span>📝</span>
            <p>Pending Assignments</p>
            <h2>03</h2>
          </article>
        </section>

        <section className="course-section" id="courses">
          <div className="section-heading">
            <div>
              <h2>Explore Courses</h2>
              <p>Choose a course to start learning.</p>
            </div>
            <span>{courses.length} featured courses</span>
          </div>

          <div className="course-grid">
            {courses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className={`course-icon ${course.color}`}>
                  {course.icon}
                </div>
                <p className="category">{course.category}</p>
                <h3>{course.title}</h3>
                <p className="instructor">
                  Instructor: {course.instructor}
                </p>
                <div className="course-footer">
                  <span>📖 {course.lessons} lessons</span>
                  <button
                    onClick={() =>
                      alert(`${course.title} selected!`)
                    }
                  >
                    View Course →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="assignment" id="assignments">
          <div>
            <h3>📝 Keep learning!</h3>
            <p>Check your assignments and stay on track.</p>
          </div>
          <a href="#progress">View Progress →</a>
        </section>
      </main>
    </div>
  );
}

export default App;
