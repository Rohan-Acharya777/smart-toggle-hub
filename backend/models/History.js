
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  current: {
    type: Number,
    required: true
  },
  voltage: {
    type: Number,
    required: true
  },
  power: {
    type: Number,
    get: function() {
      return this.current * this.voltage;
    }
  }
}, {
  timestamps: true
});

// Create compound index for deviceId and timestamp
HistorySchema.index({ deviceId: 1, timestamp: 1 });

module.exports = mongoose.model('History', HistorySchema);
