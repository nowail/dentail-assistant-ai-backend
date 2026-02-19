import pool from '../config/database.js';
import { validationResult } from 'express-validator';

/**
 * Get all patients with pagination
 */
export const getPatients = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    // Build query with optional search
    let query = `
      SELECT id, name, email, phone, date_of_birth, medical_notes, created_at, updated_at
      FROM patients
    `;
    let countQuery = 'SELECT COUNT(*) FROM patients';
    const params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1';
      countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    // Execute queries
    const [patientsResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        patients: patientsResult.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patients' 
    });
  }
};

/**
 * Get single patient by ID
 */
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, name, email, phone, date_of_birth, medical_notes, created_at, updated_at FROM patients WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch patient' 
    });
  }
};

/**
 * Create new patient
 */
export const createPatient = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { name, email, phone, date_of_birth, medical_notes } = req.body;

    const result = await pool.query(
      `INSERT INTO patients (name, email, phone, date_of_birth, medical_notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, date_of_birth, medical_notes, created_at, updated_at`,
      [name, email, phone, date_of_birth, medical_notes, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create patient' 
    });
  }
};

/**
 * Update patient
 */
export const updatePatient = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { name, email, phone, date_of_birth, medical_notes } = req.body;

    // Check if patient exists
    const checkResult = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    const result = await pool.query(
      `UPDATE patients 
       SET name = $1, email = $2, phone = $3, date_of_birth = $4, medical_notes = $5
       WHERE id = $6
       RETURNING id, name, email, phone, date_of_birth, medical_notes, created_at, updated_at`,
      [name, email, phone, date_of_birth, medical_notes, id]
    );

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update patient' 
    });
  }
};

/**
 * Delete patient
 */
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM patients WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete patient' 
    });
  }
};

