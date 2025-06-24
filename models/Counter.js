// models/Counter.js
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
    _id: { // Usamos _id para almacenar el tipo de documento (ej. 'declaracion')
        type: String,
        required: true
    },
    sequence_value: {
        type: Number,
        default: 0
    }
});

// Función para obtener y actualizar el siguiente número de secuencia
CounterSchema.statics.getNextSequenceValue = async function(sequenceName) {
    const counter = await this.findByIdAndUpdate(
        sequenceName, // Busca el contador por su _id (nombre de la secuencia)
        { $inc: { sequence_value: 1 } }, // Incrementa el valor en 1
        { new: true, upsert: true } // new: true devuelve el documento actualizado; upsert: true crea si no existe
    );
    return counter.sequence_value;
};

module.exports = mongoose.model('Counter', CounterSchema);