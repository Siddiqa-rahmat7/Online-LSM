const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedMaterials: [String], // material _id ki list
  },
  { timestamps: true }
);

// ek student ek course mein sirf ek baar enroll ho sakta hai
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);