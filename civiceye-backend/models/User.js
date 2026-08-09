const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Supports the three user roles described in Section V.B:
 * citizen, municipal admin (department-scoped), and system_admin
 * (platform-level configuration).
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['citizen', 'admin', 'system_admin'],
      default: 'citizen',
    },
    // For admin accounts, the department they are scoped to.
    // null / 'all' means the account can see every department (system_admin).
    department: {
      type: String,
      enum: [
        'Roads & Infrastructure',
        'Water & Drainage',
        'Sanitation & Waste Management',
        'Electrical & Street Lighting',
        'Parks & Environment',
        'General Administration',
        null,
      ],
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
