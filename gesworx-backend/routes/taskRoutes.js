import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('superadmin', 'admin', 'user'), createTask);
router.get('/', authenticate, authorizeRoles('superadmin', 'admin', 'user'), getTasks);
router.get('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'user'), getTaskById);
router.put('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'user'), updateTask);
router.delete('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'user'), deleteTask);

export default router;
