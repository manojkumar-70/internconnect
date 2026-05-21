const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    college: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    skills: {
      type: [String],
      default: [],
    },
    resume: {
      type: String, // URL to resume
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: null,
    },
    portfolio: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    appliedInternships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
      },
    ],
    activeInternship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      default: null,
    },
    completedTasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
    badges: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    console.log('🔐 [Student Model] Password not modified, skipping hash');
    return next();
  }
  try {
    console.log('🔐 [Student Model] Hashing password...');
    console.log('🔐 [Student Model] Plain password length:', this.password.length);
    const salt = await bcrypt.genSalt(10);
    console.log('🔐 [Student Model] Salt generated');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 [Student Model] Password hashed successfully');
    console.log('🔐 [Student Model] Hash:', this.password.substring(0, 20) + '...');
    next();
  } catch (err) {
    console.error('🔐 [Student Model] Error hashing password:', err);
    next(err);
  }
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function (enteredPassword) {
  console.log('🔐 [Student Model] Comparing passwords...');
  console.log('🔐 [Student Model] Entered password length:', enteredPassword.length);
  console.log('🔐 [Student Model] Stored hash length:', this.password.length);
  console.log('🔐 [Student Model] Hash starts with $2a or $2b:', this.password.startsWith('$2a') || this.password.startsWith('$2b'));
  
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 [Student Model] bcrypt.compare result:', result);
    return result;
  } catch (error) {
    console.error('🔐 [Student Model] Error comparing passwords:', error);
    throw error;
  }
};

module.exports = mongoose.model('Student', studentSchema);
