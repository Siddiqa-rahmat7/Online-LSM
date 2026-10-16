require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Submission = require('./models/Submission');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Course.deleteMany(), Enrollment.deleteMany(), Submission.deleteMany()]);

  await User.create({ name: 'Admin', email: 'admin@lms.com', password: 'admin123', role: 'admin' });
  const meera = await User.create({ name: 'Dr. Meera Sharma', email: 'meera@lms.com', password: 'teach123', role: 'instructor' });
  const rahul = await User.create({ name: 'Rahul Verma', email: 'rahul@lms.com', password: 'learn123', role: 'student' });

  const web = await Course.create({
    title: 'Web Development Basics',
    description: 'HTML, CSS aur JavaScript ki shuruaat.',
    category: 'Web',
    instructor: meera._id,
    materials: [
      { title: 'HTML Introduction', type: 'video', url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg' },
      { title: 'CSS Crash Course', type: 'video', url: 'https://www.youtube.com/watch?v=yfoY53QXEnI' },
    ],
    assignments: [{ title: 'Build a Portfolio Page', description: 'HTML + CSS se apna portfolio banao.' }],
  });

  await Course.create({
    title: 'React.js for Beginners',
    description: 'Components, props, state aur hooks.',
    category: 'Web',
    instructor: meera._id,
    materials: [{ title: 'What is React?', type: 'article', url: 'https://react.dev/learn' }],
    assignments: [{ title: 'Todo App', description: 'React mein ek todo app banao.' }],
  });

  await Enrollment.create({ student: rahul._id, course: web._id });

  console.log('Seed complete');
  console.log('admin@lms.com / admin123');
  console.log('meera@lms.com / teach123');
  console.log('rahul@lms.com / learn123');
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });