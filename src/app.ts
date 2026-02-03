import express from 'express';
import cors from 'cors';
import postsRouter from './routes/posts';
import usersRouter from './routes/users';
import passport from './middleware/passport';
import type { Request, Response, NextFunction } from 'express';

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://odin-blog-consumer-app.netlify.app",
  "https://nealchampagne-odin-blog-owner-app.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// Initialize passport.ts
app.use(passport.initialize());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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