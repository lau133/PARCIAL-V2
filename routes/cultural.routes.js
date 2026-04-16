const express = require('express');
const router = express.Router();
const culturalDao = require('../dao/cultural.dao');

// Endpoint para registrar un espacio cultural
router.post('/registrar', async (req, res) => {
    try {
        const newspace = req.body;
        const result = await culturalDao.registrarEspacio(newspace);
        res.status(201).json({ mensaje: 'Espacio registrado con éxito', id: result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;