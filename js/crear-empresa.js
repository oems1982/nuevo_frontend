// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. OBTENER REFERENCIAS DEL DOM ---
  const crearempresaForm = document.getElementById("crear-empresa-form");
  const regName = document.getElementById("reg-name");
  const regNit = document.getElementById("reg-nit");
  const regAdress = document.getElementById("reg-adress");
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
   * (ENDPOINT: POST /api/empresas)
   * Maneja el envío del formulario de creacion
   */
  async function handleRegister(event) {
    event.preventDefault();

    // 1. Recolectar los datos del formulario
    const empresaData = {
      name: regName.value,
      nit: regNit.value,
      adress: regAdress.value,
      };

    try {
      // 2. Usar 'fetchApi' para crear la empresa
      const response = await fetchApi("/empresas", {
        method: "POST",
        body: empresaData,
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        // Capturar errores de validación del backend
        throw new Error(data.message || "Error al crear la empresa");
      }

      // 3. ¡ÉXITO!
      showMessage("¡Empresa creada con éxito! Redirigiendo a gestionar empresas...", false);

      // 4. Limpiar el formulario
      crearempresaForm.reset();

      // 5. Redirigir al usuario a la página de gestion de empresas después de 2 segundos
      setTimeout(() => {
        window.location.href = "empresas.html";
      }, 2000);
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  // --- 3. EVENT LISTENERS ---
  crearempresaForm.addEventListener("submit", handleRegister);
});
