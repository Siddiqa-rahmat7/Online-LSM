const router = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Submission = require('../models/Submission');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

// Student: assignment submit (dobara bheje to update ho jaye)
router.post('/:courseId/:assignmentId', protect, authorize('student'), asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'Answer is required' });
  const enrolled = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrolled) return res.status(403).json({ message: 'Enroll in the course first' });
  const sub = await Submission.findOneAndUpdate(
    { student: req.user._id, course: req.params.courseId, assignmentId: req.params.assignmentId },
    { content, grade: null, feedback: '' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(201).json(sub);
}));

// Student: ek course ki meri submissions (grade ke saath)
router.get('/my/:courseId', protect, authorize('student'), asyncHandler(async (req, res) => {
  const subs = await Submission.find({ student: req.user._id, course: req.params.courseId });
  res.json(subs);
}));

// Instructor: course ki saari submissions
router.get('/course/:courseId', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your course' });
  }
  const subs = await Submission.find({ course: course._id }).populate('student', 'name email');
  res.json(subs);
}));

// Instructor: grade do
router.put('/:id/grade', protect, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const sub = await Submission.findById(req.params.id);
  if (!sub) return res.status(404).json({ message: 'Submission not found' });
  const course = await Course.findById(sub.course);
  if (req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not your course' });
  }
  sub.grade = req.body.grade;
  sub.feedback = req.body.feedback || '';
  await sub.save();
  res.json(sub);
}));

module.exports = router;