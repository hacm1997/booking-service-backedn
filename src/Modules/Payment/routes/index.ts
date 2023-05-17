import { PayController } from '../controllers/pay';
import { getPayController } from '../controllers/getPay';
import { Router } from 'express';

const paymentRouter = Router();

paymentRouter.post('/', PayController);
paymentRouter.get('/:bookingCode', getPayController);

export default paymentRouter;
