const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: function() { return this.provider === 'local'; } },
  provider: { type: String, default: 'local' },
  confirmed: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving (only for local users)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === ROLES.ADMIN;
};

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
