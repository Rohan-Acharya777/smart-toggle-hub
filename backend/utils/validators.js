
const Joi = require('joi');

// Device schema validation
const deviceSchema = Joi.object({
  name: Joi.string().required(),
  macAddress: Joi.string().required(),
  isOnline: Joi.boolean(),
  location: Joi.string().allow('', null),
  description: Joi.string().allow('', null),
  mqttTopic: Joi.string().allow('', null),
  switches: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      state: Joi.boolean().default(false),
      icon: Joi.string().allow('', null),
      color: Joi.string().allow('', null)
    })
  ),
  sensorData: Joi.object({
    current: Joi.number().default(0),
    voltage: Joi.number().default(0),
    timestamp: Joi.date()
  }),
  mqttConfig: Joi.object({
    brokerUrl: Joi.string().required(),
    username: Joi.string().allow('', null),
    password: Joi.string().allow('', null),
    clientId: Joi.string().required(),
    topicPrefix: Joi.string().required(),
    qos: Joi.number().valid(0, 1, 2).default(0)
  }),
  mongoConfig: Joi.object({
    connectionString: Joi.string().allow('', null),
    database: Joi.string().allow('', null),
    collection: Joi.string().allow('', null),
    retentionDays: Joi.number().default(30)
  })
});

// User schema validation
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Login schema validation
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Switch update schema validation
const switchSchema = Joi.object({
  state: Joi.boolean().required()
});

module.exports = {
  deviceSchema,
  userSchema,
  loginSchema,
  switchSchema
};
