import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/users.js';
import todoRoutes from './routes/todo.js';
import homeRoutes from './routes/home.js';

dotenv.config();

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});