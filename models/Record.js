// models/Record.js
const mongoose = require('mongoose');

const RecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Referencia al ID del usuario
        ref: 'User', // Referencia al modelo 'User'
        required: true
    },
    username: {
        type: String,
        required: true
    },
    documentType: {
        type: String,
        enum: ['declaracion', 'oficio', 'acta'],
        required: true
    },
    assignedNumber: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now // Establece la fecha y hora actual por defecto
    }
});

module.exports = mongoose.model('Record', RecordSchema);