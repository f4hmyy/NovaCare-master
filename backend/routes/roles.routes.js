const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        ROLEID as ROLE_ID,
        ROLENAME as ROLE_NAME,
        ROLEDESCRIPTION as ROLE_DESCRIPTION
      FROM ROLES
      ORDER BY ROLEID
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: err.message
    });
  }
});

// Add new role
router.post('/', async (req, res) => {
  const { roleName, roleDescription } = req.body;

  if (!roleName) {
    return res.status(400).json({
      success: false,
      message: 'Role name is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO ROLES (ROLENAME, ROLEDESCRIPTION)
       VALUES (:roleName, :roleDescription)
       RETURNING ROLEID INTO :id`,
      {
        roleName,
        roleDescription: roleDescription || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Role added successfully',
      roleId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add role',
      error: err.message
    });
  }
});

// Get single role
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        ROLEID as ROLE_ID,
        ROLENAME as ROLE_NAME,
        ROLEDESCRIPTION as ROLE_DESCRIPTION
       FROM ROLES
       WHERE ROLEID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: err.message
    });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { roleName, roleDescription } = req.body;

  try {
    await exec(
      `UPDATE ROLES
       SET ROLENAME = :roleName,
           ROLEDESCRIPTION = :roleDescription
       WHERE ROLEID = :id`,
      { id, roleName, roleDescription }
    );

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: err.message
    });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM ROLES WHERE ROLEID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: err.message
    });
  }
});

module.exports = router;
