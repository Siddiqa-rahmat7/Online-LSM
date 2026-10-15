// Fake data. Backend ke baad ye API se aayega.
const courses = [
  {
    id: 1,
    title: 'Full Stack Web Development',
    category: 'Web Development',
    instructor: 'Dr. Meera Sharma',
    description: 'Build complete web apps with React, Node.js, Express and MongoDB.',
    materials: [
      { id: 'm1', title: 'HTML & CSS Basics', type: 'article', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML' },
      { id: 'm2', title: 'React Official Tutorial', type: 'article', url: 'https://react.dev/learn' },
    ],
    assignments: [
      { id: 'a1', title: 'Build a Todo App', description: 'Create a React todo app. Submit the GitHub link.', maxMarks: 50 },
    ],
  },
  {
    id: 2,
    title: 'Python for Beginners',
    category: 'Programming',
    instructor: 'Prof. Arjun Verma',
    description: 'Learn Python from variables to functions and files.',
    materials: [
      { id: 'm1', title: 'Python Tutorial', type: 'article', url: 'https://docs.python.org/3/tutorial/' },
      { id: 'm2', title: 'Data Types', type: 'link', url: 'https://docs.python.org/3/tutorial/introduction.html' },
    ],
    assignments: [
      { id: 'a1', title: 'Calculator Program', description: 'Write a calculator that supports + - * /.', maxMarks: 20 },
    ],
  },
  {
    id: 3,
    title: 'Database Fundamentals',
    category: 'Databases',
    instructor: 'Prof. Arjun Verma',
    description: 'Understand SQL and NoSQL databases, schema design and queries.',
    materials: [
      { id: 'm1', title: 'MongoDB University', type: 'link', url: 'https://learn.mongodb.com/' },
    ],
    assignments: [
      { id: 'a1', title: 'Design a Schema', description: 'Design a schema for a library system.', maxMarks: 30 },
    ],
  },
  {
    id: 4,
    title: 'UI/UX Design Basics',
    category: 'Design',
    instructor: 'Dr. Meera Sharma',
    description: 'Learn layout, colors, typography and how to design usable screens.',
    materials: [
      { id: 'm1', title: 'Laws of UX', type: 'article', url: 'https://lawsofux.com/' },
    ],
    assignments: [
      { id: 'a1', title: 'Redesign a Login Page', description: 'Sketch or design a better login page.', maxMarks: 25 },
    ],
  },
];

export default courses;