const { dbCultural, dbBooking } = require('../services/cultural.service');

const create = async (req, res) => {
  try {
    const {
      id_space,
      organization,
      begin_date,
      end_date,
      capacity
    } = req.body;

   
    const [space] = await dbCultural.query(
      'SELECT * FROM cultural_space WHERE id_space = ? AND state = "operativo"',
      [id_space]
    );

    if (!space[0]) {
      return res.status(400).json({ error: 'Espacio no disponible' });
    }

    const capacityu = space[0].max_capacity;

    
    if (capacity > capacityu) {
      return res.status(400).json({ error: 'Aforo supera capacidad' });
    }

   
    const [conflict] = await dbBooking.query(
      `SELECT * FROM booking 
       WHERE id_space = ? 
       AND state = 'aprobada'
       AND (begin_date <= ? AND end_date >= ?)`,
      [id_space, end_date, begin_date]
    );

    if (conflict.length > 0) {
      return res.status(400).json({ error: 'Conflicto de horario' });
    }

 
    const [result] = await dbBooking.query(
      `INSERT INTO reserva 
      (id_space, organization, begin_date, end_date, capacity, state)
      VALUES (?, ?, ?, ?, ?, ?,  'pendiente')`,
      [
        id_space,
        organization,
        begin_date,
        end_date,
        capacity
      ]
    );

    res.status(201).json({ id: result.insertId });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { create };
