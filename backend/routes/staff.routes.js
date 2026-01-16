const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all staff
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        s.STAFFID as STAFF_ID,
        s.FIRSTNAME as FIRST_NAME,
        s.LASTNAME as LAST_NAME,
        s.ROLEID as ROLE_ID,
        r.ROLENAME as ROLE_NAME,
        s.PHONENUM as PHONE_NUM,
        s.EMAIL,
        s.HIREDATE as HIRE_DATE,
        s.SHIFT
      FROM STAFF s
      LEFT JOIN ROLES r ON s.ROLEID = r.ROLEID
      ORDER BY s.STAFFID DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: err.message
    });
  }
});

// Add new staff
router.post('/', async (req, res) => {
  const {
    firstName,
    lastName,
    roleId,
    phoneNum,
    email,
    hireDate,
    shift
  } = req.body;

  if (!firstName || !lastName || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, and role ID are required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO STAFF
        (FIRSTNAME, LASTNAME, ROLEID, PHONENUM, EMAIL, HIREDATE, SHIFT)
       VALUES
        (:firstName, :lastName, :roleId, :phoneNum, :email, TO_DATE(:hireDate, 'YYYY-MM-DD'), :shift)
       RETURNING STAFFID INTO :id`,
      {
        firstName,
        lastName,
        roleId,
        phoneNum: phoneNum || null,
        email: email || null,
        hireDate: hireDate || null,
        shift: shift || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staffId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member',
      error: err.message
    });
  }
});

// Get single staff
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        STAFFID as STAFF_ID,
        FIRSTNAME as FIRST_NAME,
        LASTNAME as LAST_NAME,
        ROLEID as ROLE_ID,
        PHONENUM as PHONE_NUM,
        EMAIL,
        HIREDATE as HIRE_DATE,
        SHIFT
       FROM STAFF
       WHERE STAFFID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: err.message
    });
  }
});

// Update staff
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    roleId,
    phoneNum,
    email,
    hireDate,
    shift
  } = req.body;

  try {
    await exec(
      `UPDATE STAFF
       SET FIRSTNAME = :firstName,
           LASTNAME = :lastName,
           ROLEID = :roleId,
           PHONENUM = :phoneNum,
           EMAIL = :email,
           HIREDATE = TO_DATE(:hireDate, 'YYYY-MM-DD'),
           SHIFT = :shift
       WHERE STAFFID = :id`,
      {
        id,
        firstName,
        lastName,
        roleId,
        phoneNum,
        email,
        hireDate,
        shift
      }
    );

    res.json({
      success: true,
      message: 'Staff member updated successfully'
    });
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: err.message
    });
  }
});

// Delete staff
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM STAFF WHERE STAFFID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: err.message
    });
  }
});

module.exports = router;
