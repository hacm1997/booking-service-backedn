import { Router } from 'express';
import { AuthSaveTokenController, AuthGetTokensController } from '../controllers';
import { createConfigController, deleteConfigController, getConfigController, updateConfigController } from '../controllers/config';
const microsoftRoutes = Router();

// save token access route
microsoftRoutes.post('/token', async (req, res, next) => await AuthSaveTokenController(res, req, next));
// get token access route
microsoftRoutes.get('/token', async (req, res, next) => await AuthGetTokensController(res, req, next));
// save credentials route
microsoftRoutes.post('/config', async (req, res, next) => await createConfigController(res, req, next));
// delete config route
microsoftRoutes.delete('/config', async (req, res, next) => await deleteConfigController(res, req, next));
// get config route
microsoftRoutes.get('/config', async (req, res, next) => await getConfigController(res, req, next));
// update config route
microsoftRoutes.put('/config', async (req, res, next) => await updateConfigController(res, req, next));

export default microsoftRoutes;
