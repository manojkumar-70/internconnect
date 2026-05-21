const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'raterModel',
      required: true,
    },
    raterModel: {
      type: String,
      enum: ['Student', 'Company'],
      required: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'rateeModel',
      required: true,
    },
    rateeModel: {
      type: String,
      enum: ['Student', 'Company'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: '',
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);
