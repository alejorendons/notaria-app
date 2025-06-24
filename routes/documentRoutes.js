// routes/documentRoutes.js
const express = require('express');
const { requestDocumentNumber, getDocumentRecords } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Ruta para solicitar un nuevo número de documento
// Protegida: solo usuarios autenticados con los permisos adecuados pueden usarla
router.post('/request/:type', protect, requestDocumentNumber);

// Ruta para obtener todos los registros de documentos (historial)
// Protegida: solo administradores pueden ver todos los registros
router.get('/records', protect, authorize(['admin']), getDocumentRecords);

// Podrías añadir rutas para que un usuario vea solo sus propias solicitudes si lo necesitas
// router.get('/my-records', protect, getUserDocumentRecords);

module.exports = router;