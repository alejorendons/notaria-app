# Notaría App

Una aplicación web para la gestión eficiente de números consecutivos de documentos notariales (Declaraciones, Oficios, Actas) y la administración de usuarios con diferentes roles y permisos.

## Características Principales

* **Autenticación de Usuarios:** Sistema de inicio de sesión seguro.
* **Gestión de Roles y Permisos:**
    * **Administradores (admin):** Control total sobre usuarios (creación, edición de rol/permisos, cambio de contraseña, eliminación) y visualización del historial completo de documentos.
    * **Usuarios Normales (user):** Permisos asignados para solicitar números de tipos de documento específicos.
* **Generación de Números Consecutivos:** Asignación automática y consecutiva de números para diferentes tipos de documentos (ej. Declaración, Oficio, Acta).
* **Historial de Solicitudes:** Registro detallado de todos los números asignados, incluyendo tipo de documento, número, usuario solicitante y fecha/hora.
* **Interfaz de Usuario Intuitiva:** Frontend basado en HTML, CSS y JavaScript para una experiencia de usuario fluida.

## Tecnologías Utilizadas

* **Backend:** Node.js, Express.js
* **Base de Datos:** MongoDB (utilizando Mongoose como ODM)
* **Autenticación:** JSON Web Tokens (JWT)
* **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
* **Variables de Entorno:** `dotenv`

## Requisitos

Asegúrate de tener instalado lo siguiente en tu entorno de desarrollo:

* Node.js (versión 14 o superior recomendada)
* npm (se instala con Node.js)
* MongoDB (local o una instancia en la nube como MongoDB Atlas)

## Configuración del Entorno Local

Sigue estos pasos para poner la aplicación en funcionamiento en tu máquina local:

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/alejorendons/notaria-app.git
    cd notaria-app
    ```

2.  **Instalar Dependencias del Backend:**
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz de tu proyecto con el siguiente contenido. Asegúrate de reemplazar los valores de ejemplo con tus propios datos.

    ```
    PORT=5000
    MONGO_URI=mongodb+srv://<usuario>:<contraseña>@<cluster-atlas>/notaria-app?retryWrites=true&w=majority
    JWT_SECRET=tuSecretJWTSuperSeguroYdificilDeAdivinar
    ```
    * `MONGO_URI`: Cadena de conexión a tu base de datos MongoDB. Si usas MongoDB Atlas, asegúrate de crear un usuario y permitir el acceso desde tu IP.
    * `JWT_SECRET`: Una cadena de texto larga y aleatoria para firmar tus tokens JWT.

4.  **Iniciar el Servidor:**
    ```bash
    npm start
    ```
    El servidor se iniciará en `http://localhost:5000`.

## Uso de la Aplicación

1.  **Accede a la Interfaz:** Abre tu navegador web y navega a `http://localhost:5000`.

2.  **Crear un Usuario Administrador (Inicial):**
    * La primera vez que uses la aplicación, no habrá usuarios. Puedes crear uno directamente desde la base de datos (por ejemplo, usando MongoDB Compass o la shell de Mongo) con el rol `admin`, o si tienes un mecanismo de registro inicial no protegido, puedes usarlo.
    * **Alternativa simple (para desarrollo):** Puedes modificar temporalmente tu `server/server.js` para crear un usuario administrador si no existe al iniciar la aplicación. (Esto no se recomienda en producción).

3.  **Iniciar Sesión:**
    * Usa las credenciales de tu usuario administrador para iniciar sesión.

4.  **Administrar Usuarios:**
    * Como administrador, verás la sección "Administración de Usuarios".
    * Puedes crear nuevos usuarios, asignarles roles (`user` o `admin`) y permisos específicos (declaración, oficio, acta).
    * También puedes editar los roles, permisos y contraseñas de usuarios existentes.

5.  **Solicitar Números:**
    * En la sección "Solicitar Número de Documento", selecciona el tipo de documento y haz clic en "Solicitar Número". El sistema asignará el siguiente número consecutivo.

6.  **Ver Historial:**
    * Los administradores pueden ver un historial completo de todas las solicitudes de números en la sección "Historial de Solicitudes".

## Despliegue

La aplicación está diseñada para ser desplegada en plataformas que soporten Node.js y MongoDB.
Se recomienda utilizar:

* **Backend:** Render.com o Heroku
* **Base de Datos:** MongoDB Atlas
* **Frontend (estático):** Servido directamente por el backend de Express, o alternativamente, plataformas como Netlify/Vercel si se desea separar el frontend.

---

## Contribuciones

Las contribuciones son bienvenidas. Si deseas mejorar la aplicación, por favor, abre un "issue" o envía un "pull request".

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---
