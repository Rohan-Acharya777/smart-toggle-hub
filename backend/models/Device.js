
const mongoose = require('mongoose');

const SwitchSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  state: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String
  },
  color: {
    type: String
  }
});

const SensorDataSchema = new mongoose.Schema({
  current: {
    type: Number,
    required: true
  },
  voltage: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const MQTTConfigSchema = new mongoose.Schema({
  brokerUrl: {
    type: String,
    required: true
  },
  username: {
    type: String
  },
  password: {
    type: String
  },
  clientId: {
    type: String,
    required: true
  },
  topicPrefix: {
    type: String,
    required: true
  },
  qos: {
    type: Number,
    enum: [0, 1, 2],
    default: 0
  }
});

const MongoDBConfigSchema = new mongoose.Schema({
  connectionString: {
    type: String
  },
  database: {
    type: String
  },
  collection: {
    type: String
  },
  retentionDays: {
    type: Number,
    default: 30
  }
});

const DeviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  macAddress: {
    type: String,
    required: true,
    unique: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  location: {
    type: String
  },
  description: {
    type: String
  },
  mqttTopic: {
    type: String
  },
  switches: [SwitchSchema],
  sensorData: {
    type: SensorDataSchema,
    default: () => ({
      current: 0,
      voltage: 0
    })
  },
  mqttConfig: {
    type: MQTTConfigSchema
  },
  mongoConfig: {
    type: MongoDBConfigSchema
  }
}, {
  timestamps: true
});

// Set _id to virtual for frontend compatibility
DeviceSchema.virtual('_id').get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
DeviceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Device', DeviceSchema);
