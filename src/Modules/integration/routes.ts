import { Router } from 'express';
import googleAuthRoutes from './modules/google/auth/routes';
import microsoftAuthRoutes from './modules/microsoft/routes';
import mailRoutes from './modules/notification/mail/route';

const integrationRoutes = Router();

integrationRoutes.use('/mail', mailRoutes);
integrationRoutes.use('/google', googleAuthRoutes);
integrationRoutes.use('/microsoft', microsoftAuthRoutes);

export default integrationRoutes;
