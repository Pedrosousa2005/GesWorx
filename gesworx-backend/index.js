import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import vanRoutes from './routes/vanRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import taskLoadRoutes from './routes/taskLoadRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vans', vanRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/task-loads', taskLoadRoutes);

app.get('/', (req, res) => {
  res.send('GESWORX Backend API is running.');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
