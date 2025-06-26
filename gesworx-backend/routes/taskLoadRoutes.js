import express from 'express';
import {
  createTaskLoad,
  addMaterialToTaskLoad,
  getMaterialsByTaskLoad,
  getUsersByTaskLoad,
  getTaskLoadDetails,
} from '../controllers/taskLoadController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), createTaskLoad);
router.post('/:taskLoadId/materials', authenticate, addMaterialToTaskLoad);
router.get('/:taskLoadId/materials', authenticate, getMaterialsByTaskLoad);
router.get('/:taskLoadId/users', authenticate, getUsersByTaskLoad);
router.get('/:taskLoadId/details', authenticate, getTaskLoadDetails);

export default router;