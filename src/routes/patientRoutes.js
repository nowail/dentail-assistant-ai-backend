import express from 'express';
import { body } from 'express-validator';
import {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} from '../controllers/patientController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const patientValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('date_of_birth').optional().isISO8601().withMessage('Valid date is required'),
  body('medical_notes').optional().trim()
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.post('/', patientValidation, createPatient);
router.put('/:id', patientValidation, updatePatient);
router.delete('/:id', deletePatient);

export default router;

