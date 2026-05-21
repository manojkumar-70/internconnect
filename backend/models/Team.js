const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    complementarySkills: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['proposed', 'accepted', 'active', 'completed'],
      default: 'proposed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
