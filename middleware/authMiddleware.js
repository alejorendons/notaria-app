// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Necesitamos el modelo de usuario
require('dotenv').config();

// Middleware para proteger rutas (verificar token)
const protect = async (req, res, next) => {
    let token;

    // Busca el token en los encabezados de la autorización
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrae el token (quita "Bearer ")
            token = req.headers.authorization.split(' ')[1];

            // Verifica el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Busca el usuario por el ID en el token y lo adjunta al objeto de solicitud (req)
            req.user = await User.findById(decoded.id).select('-password'); // No incluir la contraseña
            next(); // Pasa al siguiente middleware o a la ruta
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

// Middleware para autorizar roles
const authorize = (roles) => {
    return (req, res, next) => {
        // req.user viene del middleware 'protect'
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'No autorizado, rol incorrecto' });
        }
        next(); // El usuario tiene el rol permitido, pasa al siguiente
    };
};

module.exports = { protect, authorize };