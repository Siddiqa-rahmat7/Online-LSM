const router = require('express').Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, students, instructors, courses, enrollments, submissions] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    Submission.countDocuments(),
  ]);
  res.json({ users, students, instructors, courses, enrollments, submissions });
}));


router.get('/users', asyncHandler(async (req, res) => {
  res.json(await User.find().select('-password').sort('-createdAt'));
}));

router.delete('/users/:id', asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) {
    return res.status(400).json({ message: 'You cannot delete yourself' });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Instructor ho to uske courses aur unka data bhi hatao
  if (user.role === 'instructor') {
    const courses = await Course.find({ instructor: user._id }).select('_id');
    const ids = courses.map((c) => c._id);
    await Enrollment.deleteMany({ course: { $in: ids } });
    await Submission.deleteMany({ course: { $in: ids } });
    await Course.deleteMany({ _id: { $in: ids } });
  }

  await Enrollment.deleteMany({ student: user._id });
  await Submission.deleteMany({ student: user._id });
  await user.deleteOne();
  res.json({ message: 'User deleted' });
}));

router.get('/enrollments', asyncHandler(async (req, res) => {
  res.json(await Enrollment.find().populate('student', 'name email').populate('course', 'title'));
}));

module.exports = router;