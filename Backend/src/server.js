import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import todoRoutes from './routes/todo.js';
import homeRoutes from './routes/home.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

dotenv.config({ path: '../.env' });

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use('/users', userRoutes);

app.use('/todo', todoRoutes);

app.use('/home', homeRoutes);

// health check
app.get('/', (req, res) => {
  res.send('Endpoints: /users, /todo, /home');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});