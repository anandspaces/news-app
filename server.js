import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { initSocket } from './src/sockets/index.js';

connectDB()
  .then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on: ${process.env.PORT}`);
    });
    
    initSocket(server);
  })
  .catch((error) => console.log("MONGODB connection failed!!!: ", error));
