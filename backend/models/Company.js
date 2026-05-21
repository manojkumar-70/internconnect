const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const companySchema = new mongoose.Schema(
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
    companyName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    postedInternships: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Internship',
      },
    ],
    hiredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
      },
    ],
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
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
companySchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    console.log('🔐 [Company Model] Password not modified, skipping hash');
    return next();
  }
  try {
    console.log('🔐 [Company Model] Hashing password...');
    console.log('🔐 [Company Model] Plain password length:', this.password.length);
    const salt = await bcrypt.genSalt(10);
    console.log('🔐 [Company Model] Salt generated');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 [Company Model] Password hashed successfully');
    console.log('🔐 [Company Model] Hash:', this.password.substring(0, 20) + '...');
    next();
  } catch (err) {
    console.error('🔐 [Company Model] Error hashing password:', err);
    next(err);
  }
});

// Method to compare passwords
companySchema.methods.comparePassword = async function (enteredPassword) {
  console.log('🔐 [Company Model] Comparing passwords...');
  console.log('🔐 [Company Model] Entered password length:', enteredPassword.length);
  console.log('🔐 [Company Model] Stored hash length:', this.password.length);
  console.log('🔐 [Company Model] Hash starts with $2a or $2b:', this.password.startsWith('$2a') || this.password.startsWith('$2b'));
  
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 [Company Model] bcrypt.compare result:', result);
    return result;
  } catch (error) {
    console.error('🔐 [Company Model] Error comparing passwords:', error);
    throw error;
  }
};

module.exports = mongoose.model('Company', companySchema);
