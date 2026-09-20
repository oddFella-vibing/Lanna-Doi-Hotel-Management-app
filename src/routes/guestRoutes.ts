import { Router } from 'express';
import { GuestController } from '../controllers/guestController';

const router = Router();

router.get('/', GuestController.getAllGuests);
router.get('/:id', GuestController.getGuestById);
router.post('/', GuestController.createGuest);
router.put('/:id', GuestController.updateGuest);
router.delete('/:id', GuestController.deleteGuest);

export default router;