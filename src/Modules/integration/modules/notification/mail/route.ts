import { Router } from 'express';
import { createEmail, deleteEmail, getEmail, sendEmail, updateEmail } from './controller';

const mailRoutes = Router();

mailRoutes.post('/config', createEmail);
mailRoutes.get('/config', getEmail);
mailRoutes.put('/config', updateEmail);
mailRoutes.delete('/config', deleteEmail);
mailRoutes.post('/send', sendEmail);

export default mailRoutes;
