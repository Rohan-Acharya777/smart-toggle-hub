
module.exports = {
  app: {
    name: 'iot-dashboard-api',
    version: '1.0.0'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
};
