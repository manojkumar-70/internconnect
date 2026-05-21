const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
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
    permissions: {
      type: [String],
      default: ['manage_students', 'manage_companies', 'manage_internships', 'manage_tasks'],
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    console.log('🔐 [Admin Model] Password not modified, skipping hash');
    return next();
  }
  try {
    console.log('🔐 [Admin Model] Hashing password...');
    console.log('🔐 [Admin Model] Plain password length:', this.password.length);
    const salt = await bcrypt.genSalt(10);
    console.log('🔐 [Admin Model] Salt generated');
    this.password = await bcrypt.hash(this.password, salt);
    console.log('🔐 [Admin Model] Password hashed successfully');
    console.log('🔐 [Admin Model] Hash:', this.password.substring(0, 20) + '...');
    next();
  } catch (err) {
    console.error('🔐 [Admin Model] Error hashing password:', err);
    next(err);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function (enteredPassword) {
  console.log('🔐 [Admin Model] Comparing passwords...');
  console.log('🔐 [Admin Model] Entered password length:', enteredPassword.length);
  console.log('🔐 [Admin Model] Stored hash length:', this.password.length);
  console.log('🔐 [Admin Model] Hash starts with $2a or $2b:', this.password.startsWith('$2a') || this.password.startsWith('$2b'));
  
  try {
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 [Admin Model] bcrypt.compare result:', result);
    return result;
  } catch (error) {
    console.error('🔐 [Admin Model] Error comparing passwords:', error);
    throw error;
  }
};

module.exports = mongoose.model('Admin', adminSchema);
