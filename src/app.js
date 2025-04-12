require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');

const messageRoutes = require('./routes/message.routes');
const statusRoutes = require('./routes/status.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use('/api/messages', messageRoutes);
app.use('/api/status', statusRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`SMS Service is running on port ${PORT}`);
});

module.exports = app; 