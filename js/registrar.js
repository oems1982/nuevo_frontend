// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. OBTENER REFERENCIAS DEL DOM ---
  const registerForm = document.getElementById("register-form");
  const regFname = document.getElementById("reg-fname");
  const regLname = document.getElementById("reg-lname");
  const regEmail = document.getElementById("reg-email");
  const regPassword = document.getElementById("reg-password");
  const messageArea = document.getElementById("message-area");

  // NOTA: No necesitamos "Guardia de Ruta" aquí,
  // porque esta página debe ser pública.

  // --- 2. FUNCIONES ---

  /**
   * Muestra un mensaje de éxito o error
   */
  function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError ? "message-error" : "message-success";
    setTimeout(() => {
      messageArea.textContent = "";
      messageArea.className = "";
    }, 3000); // El mensaje desaparece a los 3 seg
  }

  /**
   * (ENDPOINT: POST /api/usuarios)
   * Maneja el envío del formulario de registro
   */
  async function handleRegister(event) {
    event.preventDefault();

    // 1. Recolectar los datos del formulario
    const userData = {
      first_name: regFname.value,
      last_name: regLname.value,
      email: regEmail.value,
      password: regPassword.value,
    };

    try {
      // 2. Usar 'fetchApi' para crear el usuario
      const response = await fetchApi("/usuarios", {
        method: "POST",
        body: userData,
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        // Capturar errores de validación del backend
        throw new Error(data.message || "Error al registrar el usuario");
      }

      // 3. ¡ÉXITO!
      showMessage("¡Usuario creado con éxito! Redirigiendo al login...", false);

      // 4. Limpiar el formulario
      registerForm.reset();

      // 5. Redirigir al usuario a la página de login después de 2 segundos
      setTimeout(() => {
        window.location.href = "index.html";
      }, 2000);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  // --- 3. EVENT LISTENERS ---
  registerForm.addEventListener("submit", handleRegister);
});
