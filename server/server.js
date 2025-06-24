// server/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const userRoutes = require('../routes/userRoutes');
const documentRoutes = require('../routes/documentRoutes');
const path = require('path'); // Importa el módulo 'path' de Node.js

// Cargar variables de entorno del archivo .env
dotenv.config();

// Conectar a la base de datos MongoDB
connectDB();

const app = express();

// Middleware para parsear JSON
// Esto permite que el servidor entienda datos en formato JSON enviados en el cuerpo de las solicitudes
app.use(express.json());

// Montar las rutas de usuario
// Todas las rutas definidas en userRoutes.js comenzarán con /api/users
app.use('/api/users', userRoutes);

// Montar las rutas de documento
// Todas las rutas definidas en documentRoutes.js comenzarán con /api/documents
app.use('/api/documents', documentRoutes);

// server/server.js (solo las líneas relevantes de la parte final)
// ... tus importaciones y configuraciones iniciales ...

app.use(express.json());

// Montar las rutas de usuario
app.use('/api/users', userRoutes);
// Montar las rutas de documento
app.use('/api/documents', documentRoutes);

// NUEVA FORMA DE SERVIR EL FRONTEND:
app.use(express.static(path.join(__dirname, '../client'))); // Solo esta línea

// La ruta de prueba inicial (la mantendremos si la quieres, pero no es estrictamente necesaria ahora)
app.get('/', (req, res) => {
    res.send('API está corriendo...'); // Esta ruta ahora mostrará esto si accedes a /
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
});
