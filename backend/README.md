
# IoT Dashboard Backend

This is the backend server for the IoT Dashboard application. It provides APIs for device management, historical data retrieval, and MQTT integration for real-time device communication.

## Features

- RESTful API for managing IoT devices
- MQTT integration for real-time device communication
- MongoDB for persistent storage
- Authentication and authorization
- Historical data storage and retrieval

## Prerequisites

- Node.js (v14+)
- MongoDB
- MQTT Broker (e.g., Mosquitto, HiveMQ)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and update configuration
   ```
   cp .env.example .env
   ```
4. Start the server:
   ```
   npm start
   ```
   
For development with auto-reload:
```
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user info

### Devices

- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get a specific device
- `POST /api/devices` - Create a new device
- `PUT /api/devices/:id` - Update a device
- `DELETE /api/devices/:id` - Delete a device
- `PATCH /api/devices/:id/switches/:switchId` - Update a specific switch

### Historical Data

- `GET /api/history/devices/:deviceId` - Get device history
- `GET /api/history/devices/:deviceId/stats` - Get device statistics

## MQTT Topics

The server subscribes to and publishes to the following MQTT topics:

- `devices/+/data` - Device sensor data
- `devices/+/switches` - Device switch states
- `devices/+/switches/+` - Individual switch states

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development, production)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration
- `MQTT_BROKER_URL` - MQTT broker URL
- `MQTT_USERNAME` - MQTT username (optional)
- `MQTT_PASSWORD` - MQTT password (optional)

## License

MIT
