const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: [true, 'Please provide an action']
  },
  actionType: {
    type: String,
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'auth', 'admin'],
    required: true
  },
  resource: {
    type: String
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  status: {
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success'
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: { createdAt: true, updatedAt: false } // same behavior
});


// 🔥 Indexes (same as Sequelize)
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ actionType: 1 });
activityLogSchema.index({ resource: 1 });
activityLogSchema.index({ createdAt: 1 });
activityLogSchema.index({ status: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);