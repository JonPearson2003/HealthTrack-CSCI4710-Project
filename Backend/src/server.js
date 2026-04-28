import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import userRoutes from './routes/users.js';
import todoRoutes from './routes/todo.js';
import homeRoutes from './routes/home.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import fs from 'fs';
import yaml from 'yaml';

dotenv.config();

const app = express();

const file = fs.readFileSync('./src/openapi.yaml', 'utf8');
const swaggerDocument = yaml.parse(file)

app.use(cors());
app.use(express.json());

// routes
app.use('/users', userRoutes);

app.use('/todo', todoRoutes);

app.use('/home', homeRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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