import { Router } from 'express';
import { BillingController } from '../controllers/billingController';

const router = Router();

router.get('/', BillingController.getAllBillings);
router.get('/:id', BillingController.getBillingById);
router.post('/', BillingController.createBilling);

export default router;