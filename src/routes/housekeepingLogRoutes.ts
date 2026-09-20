import { Router } from 'express';
import { HousekeepingController } from '../controllers/housekeepingLogController';

const router = Router();

router.get('/', HousekeepingController.getAllLogs);
router.get('/:id', HousekeepingController.getLogById);
router.post('/', HousekeepingController.createLog);
router.put('/:id', HousekeepingController.updateLog);
router.delete('/:id', HousekeepingController.deleteLog);

export default router;