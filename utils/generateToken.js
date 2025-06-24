
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Cargar SECRET_KEY

const generateToken = (id) => {
    // El token contendrá el ID del usuario
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d', // El token expirará en 1 día
    });
};

module.exports = generateToken;