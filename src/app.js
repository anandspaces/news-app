import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';


const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
// Basic Route
app.get('/', (req, res) => {
  res.send('AI News App Backend is running');
});

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Import Routes
import userRoutes from './routes/userRouter.js';
import newsRoutes from './routes/newsRouter.js';
import chatRoutes from './routes/chat.js';

//routes declaration
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/chat', chatRoutes);

export default app;
