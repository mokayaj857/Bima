const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

const PERMISSIONS = {
  // User management
  USER_VIEW: 'user_view',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',

  // Sensor management
  SENSOR_VIEW: 'sensor_view',
  SENSOR_CREATE: 'sensor_create',
  SENSOR_UPDATE: 'sensor_update',
  SENSOR_DELETE: 'sensor_delete',

  // Anomaly management
  ANOMALY_VIEW: 'anomaly_view',
  ANOMALY_UPDATE: 'anomaly_update',
  ANOMALY_RESOLVE: 'anomaly_resolve',

  // System management
  SYSTEM_VIEW: 'system_view',
  SYSTEM_UPDATE: 'system_update',
  SYSTEM_CONFIG: 'system_config',

  // Data management
  DATA_VIEW: 'data_view',
  DATA_EXPORT: 'data_export',
  DATA_DELETE: 'data_delete',

  // Report management
  REPORT_VIEW: 'report_view',
  REPORT_CREATE: 'report_create',
  REPORT_DELETE: 'report_delete',

  // Billing
  BILL_VIEW: 'bill_view',
  BILL_PROCESS: 'bill_process',
  BILL_MANAGE: 'bill_manage'
};

const ADMIN_LEVELS = {
  LEVEL_1: 'level_1', // Basic admin - view and update
  LEVEL_2: 'level_2', // Advanced admin - create and manage
  LEVEL_3: 'level_3'  // Super admin - full access
};

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: function() { return this.provider === 'local'; } },
  provider: { type: String, default: 'local' },
  confirmed: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  role: { type: String, enum: Object.values(ROLES), default: ROLES.USER },

  // Two-tiered admin system
  adminLevel: {
    type: String,
    enum: Object.values(ADMIN_LEVELS),
    default: null
  },
  permissions: [{
    type: String,
    enum: Object.values(PERMISSIONS)
  }],

  // Admin-specific fields
  adminProfile: {
    department: String,
    zone: String, // Geographic zone they manage
    specialization: [String], // Areas of expertise
    managedSensors: [String], // Sensor IDs they can manage
    maxUsers: Number, // Maximum users they can create
    canApprove: Boolean, // Can approve certain actions
    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },

  // Activity tracking
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  lastActivity: Date,

  // Security
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutUntil: Date,
  securityQuestions: [{
    question: String,
    answer: String // Hashed
  }],

  // Preferences
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },

  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient querying
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, adminLevel: 1 });
userSchema.index({ 'adminProfile.zone': 1 });
userSchema.index({ 'adminProfile.managedSensors': 1 });

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

// Hash security question answers
userSchema.pre('save', async function(next) {
  if (this.isModified('securityQuestions')) {
    for (let sq of this.securityQuestions) {
      if (sq.answer) {
        const salt = await bcrypt.genSalt(10);
        sq.answer = await bcrypt.hash(sq.answer, salt);
      }
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Compare security question answer
userSchema.methods.compareSecurityAnswer = async function(questionIndex, candidateAnswer) {
  if (!this.securityQuestions[questionIndex]) return false;
  return await bcrypt.compare(candidateAnswer, this.securityQuestions[questionIndex].answer);
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === ROLES.ADMIN || this.role === ROLES.SUPER_ADMIN;
};

// Check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === ROLES.SUPER_ADMIN;
};

// Check specific permission
userSchema.methods.hasPermission = function(permission) {
  if (this.role === ROLES.SUPER_ADMIN) return true;
  if (this.role === ROLES.ADMIN && this.adminLevel === ADMIN_LEVELS.LEVEL_3) return true;
  return this.permissions.includes(permission);
};

// Check if user can manage specific sensor
userSchema.methods.canManageSensor = function(sensorId) {
  if (this.role === ROLES.SUPER_ADMIN) return true;
  if (this.role === ROLES.ADMIN && this.adminLevel === ADMIN_LEVELS.LEVEL_3) return true;
  return this.adminProfile?.managedSensors?.includes(sensorId);
};

// Check if user can manage specific zone
userSchema.methods.canManageZone = function(zone) {
  if (this.role === ROLES.SUPER_ADMIN) return true;
  if (this.role === ROLES.ADMIN && this.adminLevel === ADMIN_LEVELS.LEVEL_3) return true;
  return this.adminProfile?.zone === zone;
};

// Get admin permissions based on level
userSchema.methods.getAdminPermissions = function() {
  const basePermissions = [PERMISSIONS.USER_VIEW, PERMISSIONS.SENSOR_VIEW, PERMISSIONS.ANOMALY_VIEW];

  switch (this.adminLevel) {
    case ADMIN_LEVELS.LEVEL_1:
      return [...basePermissions, PERMISSIONS.ANOMALY_UPDATE];
    case ADMIN_LEVELS.LEVEL_2:
      return [
        ...basePermissions,
        PERMISSIONS.USER_CREATE,
        PERMISSIONS.USER_UPDATE,
        PERMISSIONS.SENSOR_CREATE,
        PERMISSIONS.SENSOR_UPDATE,
        PERMISSIONS.ANOMALY_UPDATE,
        PERMISSIONS.ANOMALY_RESOLVE,
        PERMISSIONS.REPORT_VIEW
      ];
    case ADMIN_LEVELS.LEVEL_3:
      return Object.values(PERMISSIONS);
    default:
      return this.permissions || [];
  }
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.lastActivity = new Date();
  this.failedLoginAttempts = 0; // Reset failed attempts on successful login
};

// Record failed login attempt
userSchema.methods.recordFailedLogin = function() {
  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= 5) {
    this.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lockout
  }
};

// Check if account is locked
