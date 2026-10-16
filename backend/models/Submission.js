const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    assignmentId: { type: String, required: true },
    content: { type: String, required: true },
    grade: { type: Number, default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);