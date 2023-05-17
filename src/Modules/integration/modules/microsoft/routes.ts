import { Response, Router } from 'express';
import microsoftRoutes from './auth/routes';
import authMicrosoftMiddleware, { RequestWithGraphClient } from './middleware';

const microsoftAuthRoutes = Router();

microsoftAuthRoutes.use(authMicrosoftMiddleware);
microsoftAuthRoutes.use(microsoftRoutes);
microsoftAuthRoutes.get('/calendar-events', async (req: RequestWithGraphClient, res: Response) => {
  try {
    const client = req.graphClient;
    if (client == null) {
      res.status(401).send('Unauthorized');
      return;
    }
    const events = await client.api('/me/events')
      .select('subject,start,end')
      .orderby('start/dateTime DESC')
      .get(); res.send(events);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

export default microsoftAuthRoutes;
