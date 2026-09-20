import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';
import { validateBookingDatesMiddleware } from '../middelware/bookingDateMiddleware';

const router = Router();

router.get('/', BookingController.getAllBookings);
router.get('/:id', BookingController.getBookingById);
router.post('/',validateBookingDatesMiddleware, BookingController.createBooking);
router.put('/:id', BookingController.updateBooking);
router.delete('/:id', BookingController.deleteBooking);
router.post('/:id/rooms', BookingController.addRoomToBooking);
router.delete('/:id/rooms/:roomId', BookingController.removeRoomFromBooking);

export default router;