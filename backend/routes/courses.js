const router = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

// Sab courses (public)
router.get('/', asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('instructor', 'name').sort('-createdAt');
  res.json(courses);
}));

// Ek course
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
}));

// Course banao (instructor / admin)
router.post('/', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ message: 'Title is required' });
  const course = await Course.create({ title, description, category, instructor: req.user._id });
  res.status(201).json(course);
}));

// helper: course sirf uska owner (ya admin) badal sakta hai
async function getOwnedCourse(req, res) {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404).json({ message: 'Course not found' }); return null; }
  if (req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) {
    res.status(403).json({ message: 'Not your course' });
    return null;
  }
  return course;
}

// Material jodo
router.post('/:id/materials', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req, res);
  if (!course) return;
  course.materials.push({ title: req.body.title, type: req.body.type, url: req.body.url });
  await course.save();
  res.status(201).json(course);
}));

// Assignment jodo
router.post('/:id/assignments', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req, res);
  if (!course) return;
  course.assignments.push({
    title: req.body.title,
    description: req.body.description,
    dueDate: req.body.dueDate,
  });
  await course.save();
  res.status(201).json(course);
}));

// Course delete (enrollments bhi hatao)
router.delete('/:id', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const course = await getOwnedCourse(req, res);
  if (!course) return;
  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();
  res.json({ message: 'Course deleted' });
}));

module.exports = router;