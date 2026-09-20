import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';

const router = Router();

router.get('/', PaymentController.getAllPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.createPayment);

export default router;