import { apiKeyMiddleware } from '../../middlewares/apiKey.middleware.js';
import * as userController from '../controllers/userController.js';
import { processAvatar, uploadAvatar } from '../../middlewares/uploadAvatar.js';
import { Router } from 'express';

const router = Router();

router.options('/createUser', (req, res) => {
  // Apenas responda 204 "No Content", que é o que o preflight espera.
  res.sendStatus(204);
});

router.post(
  '/createUser',
  apiKeyMiddleware,
  uploadAvatar,
  processAvatar,
  userController.createUserController
);

router.get('/getUsers', apiKeyMiddleware, userController.getUsersController);
router.get(
  '/getUserById/:id',
  apiKeyMiddleware,
  userController.getUserByIdController,
);
router.delete(
  '/deleteUser/:id',
  apiKeyMiddleware,
  userController.deleteUserController,
);
router.put(
  '/updateUser/:id',
  apiKeyMiddleware,
  uploadAvatar,
  processAvatar,
  userController.updateUserController
);


export default router;
