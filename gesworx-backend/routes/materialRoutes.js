import express from 'express';
import {
  createMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  getCategories,   
} from '../controllers/materialController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), createMaterial);
router.get('/', authenticate, authorizeRoles('superadmin', 'admin', 'user'), getMaterials);
router.get('/categories', authenticate, authorizeRoles('superadmin', 'admin', 'user'), getCategories);
router.get('/:id', authenticate, authorizeRoles('superadmin', 'admin', 'user'), getMaterialById);
router.put('/:id', authenticate, authorizeRoles('superadmin', 'admin'), updateMaterial);
router.delete('/:id', authenticate, authorizeRoles('superadmin'), deleteMaterial);

export default router;
