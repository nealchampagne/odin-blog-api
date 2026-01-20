import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

console.log("JWT_SECRET in server.ts:", process.env.JWT_SECRET);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
