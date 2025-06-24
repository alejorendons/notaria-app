// controllers/userController.js
const User = require('../models/User'); // Importa el modelo de usuario
const generateToken = require('../utils/generateToken'); // Para generar tokens JWT (lo crearemos pronto)

// @desc    Registrar un nuevo usuario
// @route   POST /api/users/register
// @access  Admin
const registerUser = async (req, res) => {
    const { username, password, role, permissions } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ username });

    if (userExists) {
        return res.status(400).json({ message: 'El usuario ya existe' });
    }

    try {
        const user = await User.create({
            username,
            password,
            role,
            permissions
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
                token: generateToken(user._id) // Genera un token JWT para la sesión
            });
        } else {
            res.status(400).json({ message: 'Datos de usuario inválidos' });
        }
    } catch (error) {
        // Manejar errores de validación de Mongoose o otros errores
        res.status(500).json({ message: error.message });
    }
};

// @desc    Autenticar un usuario y obtener token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;

    // Buscar usuario por nombre de usuario
    const user = await User.findOne({ username });

    // Verificar si el usuario existe y la contraseña es correcta
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            permissions: user.permissions,
            token: generateToken(user._id)
        });
    } else {
        res.status(401).json({ message: 'Nombre de usuario o contraseña inválidos' });
    }
};

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password'); // No enviar contraseñas
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Actualizar permisos de un usuario
// @route   PUT /api/users/:id/permissions
// @access  Admin

const updateUserPermissions = async (req, res) => {
    // Asegúrate de que 'role' esté en el destructuring si lo vas a enviar desde el frontend
    const { role, permissions } = req.body; // <--- Asegúrate que 'role' esté aquí

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Permite actualizar el rol
            user.role = role || user.role; // Si 'role' viene en el body, úsalo; si no, mantén el actual

            // Validar que los permisos sean válidos antes de asignar
            if (permissions && Array.isArray(permissions)) {
                const validPermissions = ['declaracion', 'oficio', 'acta'];
                const filteredPermissions = permissions.filter(p => validPermissions.includes(p));
                user.permissions = filteredPermissions;
            } else if (permissions === null || permissions === undefined) {
                 user.permissions = []; // Si se envía null/undefined, se borran los permisos
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                role: updatedUser.role,
                permissions: updatedUser.permissions,
            });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        // Manejo específico para errores de validación de Mongoose si se intenta un rol no permitido
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Rol o permisos no válidos.' });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cambiar la contraseña de un usuario (solo por Admin)
// @route   PUT /api/users/:id/password
// @access  Admin
const updateUserPassword = async (req, res) => {
    const { password } = req.body;

    // Verificar si se proporcionó una nueva contraseña
    if (!password) {
        return res.status(400).json({ message: 'Por favor, proporciona una nueva contraseña.' });
    }

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Asignar la nueva contraseña. Mongoose se encargará de encriptarla gracias al 'pre-save' hook
            user.password = password;
            await user.save(); // Esto activará el 'pre-save' para encriptar

            res.json({ message: 'Contraseña actualizada correctamente.' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor al cambiar la contraseña.', error: error.message });
    }
};

// OPCIONAL: Añadir función para eliminar usuario (si decidiste agregar la ruta DELETE)
// @desc    Eliminar un usuario
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Evitar que un admin se elimine a sí mismo
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
            }
            await user.deleteOne(); // Usa deleteOne() o remove() si tu versión de Mongoose es más antigua
            res.json({ message: 'Usuario eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el usuario.', error: error.message });
    }
};


module.exports = {
    registerUser,
    authUser,
    getUsers,
    getUserById,
    updateUserPermissions,
    updateUserPassword,
    deleteUser
};