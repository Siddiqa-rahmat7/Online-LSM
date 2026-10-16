const router = require('express').Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));

// Mere enrolled courses
router.get('/my', asyncHandler(async (req, res) => {
  const list = await Enrollment.find({ student: req.user._id }).populate('course');
  res.json(list);
}));

// Enroll karo
router.post('/:courseId', asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const exists = await Enrollment.findOne({ student: req.user._id, course: course._id });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });
  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
  res.status(201).json(enrollment);
}));

// Material complete / uncomplete (toggle)
router.put('/:courseId/toggle/:materialId', asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) return res.status(404).json({ message: 'Not enrolled' });
  const id = req.params.materialId;
  const i = enrollment.completedMaterials.indexOf(id);
  if (i === -1) enrollment.completedMaterials.push(id);
  else enrollment.completedMaterials.splice(i, 1);
  await enrollment.save();
  res.json(enrollment);
}));

module.exports = router;