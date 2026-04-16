// OJO: Asumiendo que dividiste los servicios como te recomendé
const poolCultural = require('../services/cultural.service');

const registrarEspacio = async (datos) => {
    const { name, maximum_capacity, state, dependency } = datos;
    const query = 'INSERT INTO cultural_space (name, maximum_capacity, state, dependency) VALUES (?, ?, ?, ?)';
    const [result] = await poolCultural.execute(query, [name, maximum_capacity, state, dependency]);
    return result.insertId;
};

module.exports = { registrarEspacio };