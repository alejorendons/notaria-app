// config/db.js
const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error al conectar a MongoDB: ${err.message}`);
        process.exit(1); // Salir del proceso con error
    }
};

module.exports = connectDB;