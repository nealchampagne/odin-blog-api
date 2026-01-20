import express from 'express';
import cors from 'cors';
import commentsRouter from './routes/comments';
import postsRouter from './routes/posts';
import usersRouter from './routes/users';
import passport from './middleware/passport';
import type { Request, Response, NextFunction } from 'express';

const app = express();

app.use(
  cors({ 
    origin: "http://localhost:5173", 
    credentials: true
  })
);

// Initialize passport.ts
app.use(passport.initialize());

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => { res.send('API is running'); });

app.use(commentsRouter);
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

app.use((
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });

export default app;