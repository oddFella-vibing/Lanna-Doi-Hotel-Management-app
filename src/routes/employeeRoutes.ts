import { Router } from 'express';
import { EmployeeController } from '../controllers/employeeController';

const router = Router();

router.get('/', EmployeeController.getAllEmployees);
router.get('/:id', EmployeeController.getEmployeeById);
router.post('/', EmployeeController.createEmployee);
router.put('/:id', EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);

export default router;