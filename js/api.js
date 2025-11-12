// Definimos la URL base de la API
const API_BASE_URL = "http://localhost:3000/api";

/**
 * Función 'wrapper' para fetch que añade automáticamente
 * la URL base y el token JWT de autenticación.
 * * @param {string} endpoint - El endpoint de la API al que se llamará (ej. '/usuarios/login')
 * @param {object} options - Opciones estándar de fetch (method, body, etc.)
 * @returns {Promise<Response>} La promesa de la respuesta de fetch
 */
async function fetchApi(endpoint, options = {}) {
  // 1. Crear la URL completa
  const url = `${API_BASE_URL}${endpoint}`;

  // 2. Preparar los headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers, // Permite sobrescribir o añadir headers
  };

  // 3. Recuperar el token de localStorage
  const token = localStorage.getItem("token");

  // 4. Si el token existe, añadirlo al header 'x-token'
  if (token) {
    headers["x-token"] = token;
  }

  // 5. Configurar la petición
  const config = {
    ...options,
    headers: headers,
  };

  // 6. Si hay un 'body' en las opciones, convertirlo a JSON
  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // 7. Ejecutar la petición fetch
  const response = await fetch(url, config);

  // 8. (Opcional pero recomendado) Manejo de errores 401 (No Autorizado)
  // Si el token es inválido, el backend devuelve 401.
  // Podemos forzar el logout.
  if (response.status === 401) {
    console.error("Error 401: No autorizado. El token puede ser inválido.");
    // Borramos el token "malo"
    localStorage.removeItem("token");
    // Forzamos al usuario a la pantalla de login
    window.location.reload();
  }

  return response;
}
