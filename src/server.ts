import './bootstrap.js'
import app from './app.js';

const PORT: number = Number(process.env.PORT) || 3000;

console.log("JWT_SECRET in server.ts:", process.env.JWT_SECRET);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
