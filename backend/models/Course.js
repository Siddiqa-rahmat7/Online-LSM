const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    materials: [{ title: String, type: { type: String, default: 'link' }, url: String }],
    assignments: [{ title: String, description: String, dueDate: Date }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);