import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/index.js';
import logger from './src/utils/logger.js'; // Import logger

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      logger.info(`Server is listening on: ${process.env.PORT}`); // Using logger.info
    });

    initSocket(server);
  })
  .catch((error) => logger.error(`MONGODB connection failed!!!: ${error}`)); // Using logger.error
