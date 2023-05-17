import { Router } from 'express';
import { AuthSaveTokenController, AuthGetTokensController } from '../controllers';
import { createConfigController, deleteConfigController, getConfigController, updateConfigController } from '../controllers/config';
const googleAuthRoutes = Router();

// save token access route
googleAuthRoutes.post('/token', async (req, res, next) => await AuthSaveTokenController(res, req, next));
// get token access route
googleAuthRoutes.get('/token', async (req, res, next) => await AuthGetTokensController(res, req, next));
// save credentials route
googleAuthRoutes.post('/config', async (req, res, next) => await createConfigController(res, req, next));
// delete config route
googleAuthRoutes.delete('/config', async (req, res, next) => await deleteConfigController(res, req, next));
// get config route
googleAuthRoutes.get('/config', async (req, res, next) => await getConfigController(res, req, next));
// update config route
googleAuthRoutes.put('/config', async (req, res, next) => await updateConfigController(res, req, next));

export default googleAuthRoutes;
