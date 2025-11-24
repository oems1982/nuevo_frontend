// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. OBTENER REFERENCIAS DEL DOM ---
  const crearcarnetForm = document.getElementById("crear-carnet-form");
  const regFname = document.getElementById("reg-fname");
  const regLname = document.getElementById("reg-lname");
  const regDocumento = document.getElementById("reg-documento");
  const regCargo = document.getElementById("reg-cargo");
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
   * (ENDPOINT: POST /api/carnets)
   * Maneja el envío del formulario de creacion
   */
  async function handleRegister(event) {
    event.preventDefault();

    // 1. Recolectar los datos del formulario
    const carnetData = {
      first_name: regFname.value,
      last_name: regLname.value,
      documento: regDocumento.value,
      cargo: regCargo.value,
    };

    try {
      // 2. Usar 'fetchApi' para crear el carnet
      const response = await fetchApi("/carnets", {
        method: "POST",
        body: carnetData,
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        // Capturar errores de validación del backend
        throw new Error(data.message || "Error al crear el carnet");
      }

      // 3. ¡ÉXITO!
      showMessage("¡Carnet creado con éxito! Redirigiendo a carnets...", false);

      // 4. Limpiar el formulario
      crearcarnetForm.reset();

      // 5. Redirigir al usuario a la página de gestion de carnets después de 2 segundos
      setTimeout(() => {
        window.location.href = "carnets.html";
      }, 2000);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  // --- 3. EVENT LISTENERS ---
  crearcarnetForm.addEventListener("submit", handleRegister);
});
