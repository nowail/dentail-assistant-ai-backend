import pool from '../config/database.js';
import { validationResult } from 'express-validator';
import axios from 'axios';

/**
 * Get chat history for a patient
 */
export const getChatHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    // Verify patient exists
    const patientCheck = await pool.query(
      'SELECT id, name FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Get chat messages
    const result = await pool.query(
      `SELECT id, message, role, created_at 
       FROM chat_messages 
       WHERE patient_id = $1 
       ORDER BY created_at ASC 
       LIMIT $2`,
      [patientId, limit]
    );

    res.json({
      success: true,
      data: {
        patient: patientCheck.rows[0],
        messages: result.rows
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat history' 
    });
  }
};

/**
 * Send chat message and get AI response
 */
export const sendMessage = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { patientId, message } = req.body;

    // Verify patient exists and get context
    const patientResult = await pool.query(
      'SELECT id, name, email, phone, date_of_birth, medical_notes FROM patients WHERE id = $1',
      [patientId]
    );

    if (patientResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    const patient = patientResult.rows[0];

    // Store user message
    await pool.query(
      'INSERT INTO chat_messages (patient_id, user_id, message, role) VALUES ($1, $2, $3, $4)',
      [patientId, req.user.id, message, 'user']
    );

    // Call AI service
    let aiResponse = '';
    const aiServiceEnabled = process.env.AI_SERVICE_ENABLED === 'true';
    
    if (aiServiceEnabled) {
      try {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const response = await axios.post(
          `${aiServiceUrl}/generate`,
          {
            message,
            patient_context: {
              name: patient.name,
              email: patient.email,
              phone: patient.phone,
              date_of_birth: patient.date_of_birth,
              medical_notes: patient.medical_notes
            }
          },
          {
            timeout: 30000, // 30 second timeout
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        aiResponse = response.data.response || response.data.message || 'No response from AI service';
      } catch (aiError) {
        console.error('AI service error:', aiError.message);
        // Fallback to mock response if AI service fails
        aiResponse = `Thank you for your message regarding ${patient.name}. As a dental assistant, I'm here to help. However, I'm currently experiencing technical difficulties connecting to our AI service. Please try again in a moment, or contact our support team for immediate assistance.`;
      }
    } else {
      // Mock AI response when service is disabled
      aiResponse = `Hello! Thank you for your inquiry about patient ${patient.name}. As a dental assistant, I'd be happy to help you with any questions about dental care, appointments, or general information. Please note: For specific medical advice, always consult with a licensed dentist.`;
    }

    // Store AI response
    const aiMessageResult = await pool.query(
      `INSERT INTO chat_messages (patient_id, user_id, message, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, message, role, created_at`,
      [patientId, req.user.id, aiResponse, 'assistant']
    );

    res.json({
      success: true,
      data: {
        userMessage: {
          message,
          role: 'user',
          created_at: new Date()
        },
        aiMessage: aiMessageResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message' 
    });
  }
};

/**
 * Delete chat history for a patient
 */
export const deleteChatHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    await pool.query(
      'DELETE FROM chat_messages WHERE patient_id = $1',
      [patientId]
    );

    res.json({
      success: true,
      message: 'Chat history deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete chat history' 
    });
  }
};

