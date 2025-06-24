// controllers/documentController.js
const Counter = require('../models/Counter');
const Record = require('../models/Record');
const User = require('../models/User'); // Para verificar permisos del usuario

// @desc    Solicitar un nuevo número para un tipo de documento
// @route   POST /api/documents/request/:type
// @access  Private (requiere autenticación y permisos)
const requestDocumentNumber = async (req, res) => {
    const documentType = req.params.type; // Obtener el tipo de documento de la URL (ej. 'declaracion')
    const userId = req.user._id; // El ID del usuario que hace la solicitud (viene de req.user del middleware protect)
    const username = req.user.username; // El nombre del usuario

    // 1. Validar que el tipo de documento sea uno de los permitidos
    const validDocumentTypes = ['declaracion', 'oficio', 'acta'];
    if (!validDocumentTypes.includes(documentType)) {
        return res.status(400).json({ message: 'Tipo de documento inválido.' });
    }

    // 2. Verificar si el usuario tiene permiso para solicitar este tipo de documento
    // req.user ya contiene la información del usuario desde el middleware 'protect'
    if (!req.user.permissions.includes(documentType) && req.user.role !== 'admin') {
        return res.status(403).json({ message: `No tienes permiso para solicitar ${documentType}s.` });
    }

    try {
        // 3. Obtener el siguiente número de secuencia usando el método estático del modelo Counter
        const assignedNumber = await Counter.getNextSequenceValue(documentType);

        // 4. Crear un nuevo registro de la solicitud
        const record = await Record.create({
            userId,
            username,
            documentType,
            assignedNumber
        });

        res.status(200).json({
            message: `Número asignado para ${documentType}: ${assignedNumber}`,
            documentType,
            assignedNumber,
            timestamp: record.timestamp,
            requestedBy: username
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al solicitar el número.', error: error.message });
    }
};

// @desc    Obtener todos los registros de documentos
// @route   GET /api/documents/records
// @access  Private/Admin
const getDocumentRecords = async (req, res) => {
    try {
        // Encontrar todos los registros, ordenar por fecha descendente
        // También podemos popular la información del usuario si fuera necesario, pero el username ya lo guardamos
        const records = await Record.find({}).sort({ timestamp: -1 }); // -1 para orden descendente
        res.status(200).json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los registros de documentos.', error: error.message });
    }
};

module.exports = {
    requestDocumentNumber,
    getDocumentRecords
};