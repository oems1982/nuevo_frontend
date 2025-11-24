// Esperar a que todo el HTML esté cargado
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. GUARDIA DE RUTA (¡MUY IMPORTANTE!) ---
  // Esta es la lógica de "Ruta Protegida" en Vanilla JS
  const token = localStorage.getItem("token");
  if (!token) {
    // Si no hay token, no deberías estar aquí.
    // Redirigir al usuario a la página de login.
    alert("Acceso denegado. Debes iniciar sesión.");
    window.location.href = "index.html"; // Redirige a la página de login
    return; // Detiene la ejecución del script
  }

  // --- 2. OBTENER REFERENCIAS DEL DOM ---
  const tableBody = document.getElementById("empresas-table-body");
  const messageArea = document.getElementById("message-area");

  // --- 3. FUNCIONES DE LA APLICACIÓN ---

  /**
   * Muestra un mensaje de éxito o error
   */
  function showMessage(text, isError = false) {
    messageArea.textContent = text;
    messageArea.className = isError ? "message-error" : "message-success";
    setTimeout(() => {
      messageArea.textContent = "";
      messageArea.className = "";
    }, 3000);
  }

  /**
   * (ENDPOINT: GET /api/empresas)
   * Carga y muestra la lista de empresas en la tabla
   */
  async function loadEmpresas() {
    try {
      // Usamos fetchApi, que es público para GET
      const response = await fetchApi("/empresas");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      tableBody.innerHTML = ""; // Limpiar tabla

      data.data.forEach((empresa) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${empresa.name}</td>
          <td>${empresa.nit}</td>
          <td>
            <button class="delete-button" data-id="${empresa._id}">
              Eliminar (Protegido)
            </button>
          </td>
        `;
        tableBody.appendChild(tr);
      });
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  /**
   * (ENDPOINT: DELETE /api/empresas/:id)
   * Elimina una empresa usando la ruta protegida
   */
  async function deleteEmpresa(empresaId) {
    try {
      // ¡Esta es la ruta protegida!
      // 'fetchApi' añadirá el token 'x-token' automáticamente.
      const response = await fetchApi(`/empresas/${empresaId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar");
      }

      // ¡ÉXITO!
      showMessage("Empresa eliminado correctamente.", false);

      // Refrescar la lista de empresas
      loadEmpresas();
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  /**
   * Manejador de clics en la tabla (Delegación de eventos)
   */
  function handleTableClick(event) {
    // Verificar si se hizo clic en un botón de "eliminar"
    if (event.target.classList.contains("delete-button")) {
      const empresaId = event.target.dataset.id;

      // Pedir confirmación
      if (
        confirm(
          `¿Estás seguro de que deseas eliminar la empresa con ID: ${empresaId}?`
        )
      ) {
        deleteEmpresa(empresaId);
      }
    }
  }

  // --- 4. INICIALIZACIÓN Y EVENT LISTENERS ---

  // Asignar el manejador de eventos a la tabla
  tableBody.addEventListener("click", handleTableClick);

  // Cargar las empresas al iniciar la página
  loadEmpresas();
});
