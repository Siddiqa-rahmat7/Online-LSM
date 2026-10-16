const router = require('express').Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, students, instructors, courses, enrollments] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
  ]);
  res.json({ users, students, instructors, courses, enrollments });
}));

router.get('/users', asyncHandler(async (req, res) => {
  res.json(await User.find().select('-password').sort('-createdAt'));
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ message: 'You cannot delete yourself' });
  }
  await Enrollment.deleteMany({ student: req.params.id });
  await Submission.deleteMany({ student: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
}));

router.get('/enrollments', asyncHandler(async (req, res) => {
  res.json(await Enrollment.find().populate('student', 'name email').populate('course', 'title'));
}));

module.exports = router;