document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("documentInput");
  const card = document.getElementById("card");

  const nameField = document.getElementById("name");
  const documentField = document.getElementById("document");
  const emailField = document.getElementById("email");
  const cargoField = document.getElementById("cargo");
  const photoField = document.getElementById("photo");

  // Consumir endpoint real protegido: GET /api/carnets/documento/:documento
  async function getCarnetByDocumento(doc) {
    const response = await fetchApi(`/carnets/documento/${doc}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "No encontrado");
    return data.data[0]; // Primer resultado
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const documento = input.value.trim();
    if (!documento) return;

    try {
      const carnet = await getCarnetByDocumento(documento);

      if (!carnet) {
        alert("No se encontró un carnet con ese documento");
        return;
      }

      nameField.textContent = `${carnet.first_name} ${carnet.last_name}`;
      documentField.textContent = carnet.documento;
      emailField.textContent = carnet.email || "N/A";
      cargoField.textContent = carnet.cargo || "N/A";
      photoField.src = carnet.photo_url || "https://via.placeholder.com/110";

      card.style.display = "block";
    } catch (err) {
      alert(err.message);
    }
  });
});
