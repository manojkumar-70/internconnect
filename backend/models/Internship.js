const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    duration: {
      type: String, // e.g., "3 months", "6 months"
      required: true,
    },
    stipend: {
      type: Number,
      default: 0,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    minCGPA: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    positionsAvailable: {
      type: Number,
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application',
      },
    ],
    selectedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    status: {
      type: String,
      enum: ['open', 'closed', 'in-progress', 'completed'],
      default: 'open',
    },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract'],
      default: 'full-time',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Internship', internshipSchema);
