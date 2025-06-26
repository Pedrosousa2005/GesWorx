const express = require('express');
const router = express.Router();
const taskLoadController = require('../controllers/taskLoadController');
const { authenticate, authorizeRoles } = require('../middlewares/auth');

router.post('/', authenticate, authorizeRoles('superadmin', 'admin'), taskLoadController.createTaskLoad);
router.post('/:taskLoadId/materials', authenticate, taskLoadController.addMaterialToTaskLoad);
router.get('/:taskLoadId/materials', authenticate, taskLoadController.getMaterialsByTaskLoad);
router.get('/:taskLoadId/users', authenticate, taskLoadController.getUsersByTaskLoad);
router.get('/:taskLoadId/details', authenticate, taskLoadController.getTaskLoadDetails);

module.exports = router;
