const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        ROOMID as ROOM_ID,
        ROOMTYPE as ROOM_TYPE,
        AVAILABILITYSTATUS as AVAILABILITY_STATUS
      FROM ROOMS
      ORDER BY ROOMID
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: err.message
    });
  }
});

// Add new room
router.post('/', async (req, res) => {
  const { roomType, availabilityStatus } = req.body;

  if (!roomType) {
    return res.status(400).json({
      success: false,
      message: 'Room type is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO ROOMS (ROOMTYPE, AVAILABILITYSTATUS)
       VALUES (:roomType, :availabilityStatus)
       RETURNING ROOMID INTO :id`,
      {
        roomType,
        availabilityStatus: availabilityStatus || 'Available',
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      roomId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add room',
      error: err.message
    });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        ROOMID as ROOM_ID,
        ROOMTYPE as ROOM_TYPE,
        AVAILABILITYSTATUS as AVAILABILITY_STATUS
       FROM ROOMS
       WHERE ROOMID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: err.message
    });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { roomType, availabilityStatus } = req.body;

  try {
    await exec(
      `UPDATE ROOMS
       SET ROOMTYPE = :roomType,
           AVAILABILITYSTATUS = :availabilityStatus
       WHERE ROOMID = :id`,
      { id, roomType, availabilityStatus }
    );

    res.json({
      success: true,
      message: 'Room updated successfully'
    });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: err.message
    });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM ROOMS WHERE ROOMID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: err.message
    });
  }
});

module.exports = router;
