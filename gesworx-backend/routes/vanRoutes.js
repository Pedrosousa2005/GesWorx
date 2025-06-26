import express from 'express';
import {
  createVan,
  getVans,
  getVanById,
  updateVan,
  deleteVan,
} from '../controllers/vanController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), createVan);
router.get('/', authenticate, authorizeRoles('superadmin', 'admin'), getVans);
router.get('/:id', authenticate, authorizeRoles('superadmin', 'admin'), getVanById);
router.put('/:id', authenticate, authorizeRoles('superadmin', 'admin'), updateVan);
router.delete('/:id', authenticate, authorizeRoles('superadmin'), deleteVan);

export default router;
