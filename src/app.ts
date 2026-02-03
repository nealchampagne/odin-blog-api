import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts';
import usersRouter from './routes/users';
import passport from './middleware/passport';
import type { Request, Response, NextFunction } from 'express';

const app = express();

app.use(
  cors({ 
    origin: [
      "https://odin-blog-consumer-app.netlify.app",
      "https://odin-blog-owner-n97nsdwsi-n-cs-projects-7e3a1f25.vercel.app"
    ],
    credentials: true
  })
);

// Initialize passport.ts
app.use(passport.initialize());

// Middleware to parse JSON bodies
app.use(express.json());

app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

// Routes
app.use('/users', usersRouter);
app.use('/posts', postsRouter);

app.use((
  err: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: 'Internal server error' });
  });

export default app;