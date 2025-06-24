// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true // Eliminar espacios en blanco al inicio/fin
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'], // Solo 'admin' o 'user'
        default: 'user'
    },
    permissions: [{
        type: String,
        enum: ['declaracion', 'oficio', 'acta'] // Tipos de documentos permitidos
    }]
}, {
    timestamps: true // Añade createdAt y updatedAt automáticamente
});

// Encriptar contraseña antes de guardar el usuario
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comparar contraseñas
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);