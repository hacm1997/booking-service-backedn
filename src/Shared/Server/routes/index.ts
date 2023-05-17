import BookingRoutes from '@Booking/routes';
import ResourcesRouter from '@Resources/routes';
// import { verifyTenant } from '@Server/middleware/verifyTenant';
import { NextFunction, Request, Response, Router } from 'express';
import integrationRoutes from 'Modules/integration/routes';
import paymentRouter from 'Modules/Payment/routes';

const routes = Router();
// routes.use(verifyTenant);

routes.use('/booking', BookingRoutes);
routes.use('/resource', ResourcesRouter);
routes.use('/payment', paymentRouter);
routes.use('/integration', integrationRoutes);

// handle errors
routes.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) {
    res.status(400).json({
      message: err.message
    });
  } else {
    next(err);
  }
});

// handle errors
routes.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: err
  });
});

export default Router().use('/api/v1', routes) as Router;
