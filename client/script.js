// client/script.js

// Seleccionar elementos del DOM
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('login-message');
const welcomeMessage = document.getElementById('welcome-message');
const logoutButton = document.getElementById('logout-button');

const documentTypeSelect = document.getElementById('document-type-select');
const requestNumberButton = document.getElementById('request-number-button');
const requestMessage = document.getElementById('request-message');
const assignedNumberDisplay = document.getElementById('assigned-number-display');

const recordsSection = document.getElementById('records-section');
const recordsTableBody = document.querySelector('#records-table tbody');

const adminSection = document.getElementById('admin-section');
const createUserForm = document.getElementById('create-user-form');
const newUsernameInput = document.getElementById('new-username');
const newPasswordInput = document.getElementById('new-password');
const newRoleSelect = document.getElementById('new-role');
const permDeclaracionCheckbox = document.getElementById('perm-declaracion');
const permOficioCheckbox = document.getElementById('perm-oficio');
const permActaCheckbox = document.getElementById('perm-acta');
const createUserMessage = document.getElementById('create-user-message');
const userListTableBody = document.querySelector('#user-list-table tbody');

const editUserModal = document.getElementById('edit-user-modal');
const closeButton = editUserModal.querySelector('.close-button');
const editUsernameDisplay = document.getElementById('edit-username-display');
const editUserIdInput = document.getElementById('edit-user-id');
const editUserForm = document.getElementById('edit-user-form');
const editRoleSelect = document.getElementById('edit-role');
const editPermDeclaracionCheckbox = document.getElementById('edit-perm-declaracion');
const editPermOficioCheckbox = document.getElementById('edit-perm-oficio');
const editPermActaCheckbox = document.getElementById('edit-perm-acta');
const editPermissionsMessage = document.getElementById('edit-permissions-message');
const changePasswordForm = document.getElementById('change-password-form');
const newPasswordField = document.getElementById('new-password-field');
const changePasswordMessage = document.getElementById('change-password-message');

// Variables de estado
let currentUser = null;
let userToken = null;

// --- Funciones de Utilidad ---
function showSection(section) {
    loginSection.classList.add('hidden');
    appSection.classList.add('hidden');
    recordsSection.classList.add('hidden');
    adminSection.classList.add('hidden');

    if (section === 'login') {
        loginSection.classList.remove('hidden');
    } else if (section === 'app') {
        appSection.classList.remove('hidden');
    }
}

function displayMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    setTimeout(() => {
        element.textContent = '';
        element.className = 'message';
    }, 5000); // Borra el mensaje después de 5 segundos
}

function clearAssignedNumberDisplay() {
    assignedNumberDisplay.textContent = '';
    assignedNumberDisplay.classList.add('hidden');
}

// --- Autenticación ---
async function login(username, password) {
    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            currentUser = data;
            userToken = data.token;
            localStorage.setItem('notariaUser', JSON.stringify(currentUser));
            localStorage.setItem('notariaToken', userToken);
            displayMessage(loginMessage, `Bienvenido, ${currentUser.username}!`, 'success');
            loadApp();
        } else {
            displayMessage(loginMessage, data.message || 'Error de inicio de sesión', 'error');
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        displayMessage(loginMessage, 'Error de conexión al servidor', 'error');
    }
}

function logout() {
    currentUser = null;
    userToken = null;
    localStorage.removeItem('notariaUser');
    localStorage.removeItem('notariaToken');
    showSection('login');
    documentTypeSelect.innerHTML = '<option value="">Selecciona tipo de documento</option>'; // Limpiar opciones
    clearAssignedNumberDisplay();
    requestMessage.textContent = '';
    loginForm.reset(); // Limpiar campos del login
    console.log("Sesión cerrada.");
}

// --- Carga de la Aplicación ---
function loadApp() {
    showSection('app');
    welcomeMessage.textContent = `Bienvenido, ${currentUser.username}`;
    populateDocumentTypes(); // Cargar tipos de documento según permisos

    // Mostrar/ocultar secciones de administración
    if (currentUser.role === 'admin') {
        recordsSection.classList.remove('hidden');
        adminSection.classList.remove('hidden');
        loadRecords(); // Cargar historial de documentos para admin
        loadUsers(); // Cargar lista de usuarios para admin
    } else {
        recordsSection.classList.add('hidden');
        adminSection.classList.add('hidden');
    }
}

// Cargar permisos en el select
function populateDocumentTypes() {
    documentTypeSelect.innerHTML = '<option value="">Selecciona tipo de documento</option>'; // Reset
    if (currentUser && currentUser.permissions) {
        currentUser.permissions.forEach(perm => {
            const option = document.createElement('option');
            option.value = perm;
            option.textContent = perm.charAt(0).toUpperCase() + perm.slice(1); // Capitalizar
            documentTypeSelect.appendChild(option);
        });
    }
    // Admin siempre puede ver todas las opciones
    if (currentUser.role === 'admin') {
         const existingOptions = Array.from(documentTypeSelect.options).map(opt => opt.value);
         const allTypes = ['declaracion', 'oficio', 'acta'];
         allTypes.forEach(type => {
             if (!existingOptions.includes(type)) {
                 const option = document.createElement('option');
                 option.value = type;
                 option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                 documentTypeSelect.appendChild(option);
             }
         });
    }
}

// --- Solicitud de Número ---
async function requestNumber() {
    clearAssignedNumberDisplay();
    const selectedType = documentTypeSelect.value;
    if (!selectedType) {
        displayMessage(requestMessage, 'Por favor, selecciona un tipo de documento.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/documents/request/${selectedType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });
        const data = await res.json();

        if (res.ok) {
            assignedNumberDisplay.textContent = `Nº ${data.assignedNumber} (${data.documentType.toUpperCase()})`;
            assignedNumberDisplay.classList.remove('hidden');
            displayMessage(requestMessage, data.message, 'success');
            if (currentUser.role === 'admin') {
                loadRecords(); // Refrescar registros si es admin
            }
        } else {
            displayMessage(requestMessage, data.message || 'Error al solicitar número', 'error');
        }
    } catch (error) {
        console.error('Error al solicitar número:', error);
        displayMessage(requestMessage, 'Error de conexión al servidor.', 'error');
    }
}

// --- Cargar Registros (Solo Admin) ---
async function loadRecords() {
    if (currentUser && currentUser.role === 'admin') {
        try {
            const res = await fetch('/api/documents/records', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const records = await res.json();

            if (res.ok) {
                recordsTableBody.innerHTML = ''; // Limpiar tabla
                records.forEach(record => {
                    const row = recordsTableBody.insertRow();
                    row.insertCell(0).textContent = record.documentType.charAt(0).toUpperCase() + record.documentType.slice(1);
                    row.insertCell(1).textContent = record.assignedNumber;
                    row.insertCell(2).textContent = record.username;
                    row.insertCell(3).textContent = new Date(record.timestamp).toLocaleString();
                });
            } else {
                console.error('Error al cargar registros:', records.message);
            }
        } catch (error) {
            console.error('Error de conexión al cargar registros:', error);
        }
    }
}

// --- Funciones de Administración de Usuarios (Solo Admin) ---

async function loadUsers() {
    if (currentUser && currentUser.role === 'admin') {
        try {
            const res = await fetch('/api/users', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const users = await res.json();

            if (res.ok) {
                userListTableBody.innerHTML = '';
                users.forEach(user => {
                    const row = userListTableBody.insertRow();
                    row.insertCell(0).textContent = user.username;
                    row.insertCell(1).textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
                    row.insertCell(2).textContent = user.permissions.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');

                    const actionsCell = row.insertCell(3);
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar Permisos';
                    editButton.classList.add('edit-button');
                    editButton.onclick = () => openEditUserModal(user);
                    actionsCell.appendChild(editButton);

                    if (user._id !== currentUser._id) {
                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Borrar';
                        deleteButton.classList.add('delete-button');
                        deleteButton.onclick = () => deleteUser(user._id);
                        actionsCell.appendChild(deleteButton);
                    }
                });
            } else {
                console.error('Error al cargar usuarios:', users.message);
            }
        } catch (error) {
            console.error('Error de conexión al cargar usuarios:', error);
        }
    }
}

function openEditUserModal(user) {
    editUserModal.classList.add('visible'); // Muestra el modal
    editUsernameDisplay.textContent = user.username;
    editUserIdInput.value = user._id; // Guarda el ID del usuario en un campo oculto

    // Precargar el rol
    editRoleSelect.value = user.role;

    // Precargar los permisos (checkboxes)
    editPermDeclaracionCheckbox.checked = user.permissions.includes('declaracion');
    editPermOficioCheckbox.checked = user.permissions.includes('oficio');
    editPermActaCheckbox.checked = user.permissions.includes('acta');

    // Limpiar mensajes anteriores
    displayMessage(editPermissionsMessage, '', '');
    displayMessage(changePasswordMessage, '', '');
    newPasswordField.value = ''; // Limpiar campo de contraseña
}


function closeEditUserModal() {
    editUserModal.classList.remove('visible');
}

async function savePermissions() {
    const userId = editUserIdInput.value;
    const newRole = editRoleSelect.value;
    const newPermissions = [];
    if (editPermDeclaracionCheckbox.checked) newPermissions.push('declaracion');
    if (editPermOficioCheckbox.checked) newPermissions.push('oficio');
    if (editPermActaCheckbox.checked) newPermissions.push('acta');

    try {
        const res = await fetch(`/api/users/${userId}/permissions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ role: newRole, permissions: newPermissions })
        });
        const data = await res.json();

        if (res.ok) {
            displayMessage(editPermissionsMessage, `Permisos y rol de ${data.username} actualizados.`, 'success');
            loadUsers(); // Refrescar la lista de usuarios
            // Si el usuario actual es el que se editó, actualiza su sesión local
            if (currentUser._id === userId) {
                currentUser.role = data.role;
                currentUser.permissions = data.permissions;
                localStorage.setItem('notariaUser', JSON.stringify(currentUser));
                // Recargar la app para actualizar la UI del usuario actual (ej. menú de tipos de documento)
                loadApp();
            }

        } else {
            displayMessage(editPermissionsMessage, data.message || 'Error al actualizar permisos', 'error');
        }
    } catch (error) {
        console.error('Error al guardar permisos:', error);
        displayMessage(editPermissionsMessage, 'Error de conexión al servidor.', 'error');
    }
}


async function changeUserPassword() {
    const userId = editUserIdInput.value;
    const newPassword = newPasswordField.value;

    if (!newPassword) {
        displayMessage(changePasswordMessage, 'Por favor, introduce la nueva contraseña.', 'error');
        return;
    }

    try {
        const res = await fetch(`/api/users/${userId}/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ password: newPassword })
        });
        const data = await res.json();

        if (res.ok) {
            displayMessage(changePasswordMessage, 'Contraseña actualizada con éxito.', 'success');
            newPasswordField.value = ''; // Limpiar el campo
        } else {
            displayMessage(changePasswordMessage, data.message || 'Error al cambiar contraseña', 'error');
        }
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        displayMessage(changePasswordMessage, 'Error de conexión al servidor.', 'error');
    }
}


async function createUser(username, password, role, permissions) {
    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ username, password, role, permissions })
        });
        const data = await res.json();

        if (res.ok) {
            displayMessage(createUserMessage, `Usuario ${data.username} creado con éxito.`, 'success');
            createUserForm.reset();
            loadUsers(); // Refrescar la lista de usuarios
        } else {
            displayMessage(createUserMessage, data.message || 'Error al crear usuario', 'error');
        }
    } catch (error) {
        console.error('Error al crear usuario:', error);
        displayMessage(createUserMessage, 'Error de conexión al servidor.', 'error');
    }
}

// --- Event Listeners ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value;
    const password = passwordInput.value;
    login(username, password);
});

logoutButton.addEventListener('click', logout);

requestNumberButton.addEventListener('click', requestNumber);

createUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newUsername = newUsernameInput.value;
    const newPassword = newPasswordInput.value;
    const newRole = newRoleSelect.value;
    const newPermissions = [];
    if (permDeclaracionCheckbox.checked) newPermissions.push('declaracion');
    if (permOficioCheckbox.checked) newPermissions.push('oficio');
    if (permActaCheckbox.checked) newPermissions.push('acta');

    createUser(newUsername, newPassword, newRole, newPermissions);
});

// --- Cargar estado inicial al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    const storedUser = localStorage.getItem('notariaUser');
    const storedToken = localStorage.getItem('notariaToken');

    if (storedUser && storedToken) {
        currentUser = JSON.parse(storedUser);
        userToken = storedToken;
        loadApp(); // Si hay sesión guardada, cargar la app
    } else {
        showSection('login'); // Si no, mostrar login
    }
});


closeButton.addEventListener('click', closeEditUserModal);

window.addEventListener('click', (event) => {
    if (event.target === editUserModal) {
        closeEditUserModal();
    }
});

editUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    savePermissions();
});

changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    changeUserPassword();
});


async function deleteUser(userId) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.')) {
        try {
            const res = await fetch(`/api/users/${userId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const data = await res.json();

            if (res.ok) {
                displayMessage(createUserMessage, data.message || 'Usuario eliminado con éxito.', 'success');
                loadUsers(); 
            } else {
                displayMessage(createUserMessage, data.message || 'Error al eliminar usuario', 'error');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            displayMessage(createUserMessage, 'Error de conexión al servidor.', 'error');
        }
    }
}