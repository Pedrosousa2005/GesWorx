import express from 'express';
import { createUser, getUsers } from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('superadmin'), createUser);
router.get('/', authenticate, authorizeRoles('superadmin'), getUsers);

export default router;
