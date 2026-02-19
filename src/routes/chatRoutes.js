import express from 'express';
import { body } from 'express-validator';
import {
  getChatHistory,
  sendMessage,
  deleteChatHistory
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const messageValidation = [
  body('patientId').isInt().withMessage('Valid patient ID is required'),
  body('message').trim().notEmpty().withMessage('Message is required')
];

// All routes require authentication
router.use(authenticateToken);

// Routes
router.get('/:patientId', getChatHistory);
router.post('/', messageValidation, sendMessage);
router.delete('/:patientId', deleteChatHistory);

export default router;

