// script.js
const API_BASE = "https://nuevo-backend-lt34.onrender.com/api"; // URL pública encontrada en tu frontend
const searchBtn = document.getElementById("search-btn");
const docInput = document.getElementById("doc-input");
const message = document.getElementById("message");
const cardWrap = document.getElementById("card-wrap");
const downloadBtn = document.getElementById("download-btn");

// campos
const fotoEl = document.getElementById("foto");
const holderName = document.getElementById("holder-name");
const holderRole = document.getElementById("holder-role");
const infoDocumento = document.getElementById("info-documento");
const infoEmpresa = document.getElementById("info-empresa");
const infoVigencia = document.getElementById("info-vigencia");
const infoEmail = document.getElementById("info-email");
const infoCreated = document.getElementById("info-created");
const metaDoc = document.getElementById("meta-doc");
const metaStatus = document.getElementById("meta-status");
const extraFields = document.getElementById("extra-fields");
const carnetCard = document.getElementById("carnet-card");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b91c1c" : "";
}

/** Normaliza la fecha ISO a formato dd/mm/yyyy */
function formatDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-CO");
  } catch (e) {
    return iso;
  }
}

/** Carga los datos recibidos (objeto carnet) y pinta la tarjeta */
function renderCarnet(carnet) {
  // limpiar
  extraFields.innerHTML = "";
  showMessage("");

  // Los controlamos de forma defensiva (si no existen, mostramos '-')
  const first_name = carnet.first_name || carnet.nombre || "";
  const last_name = carnet.last_name || carnet.apellido || "";
  const documento = carnet.documento || carnet.numero_documento || carnet.dni || "";
  const cargo = carnet.cargo || carnet.role || carnet.rol || carnet.job || "";
  const empresa = carnet.empresa || carnet.company || "";
  const foto = carnet.foto || carnet.photo || "";
  const vigencia = carnet.vigencia || carnet.valid_until || carnet.expiry || "";

  const estado = ("is_active" in carnet) ? (carnet.is_active ? "Activo" : "Inactivo") : (carnet.status || "-");
  const email = carnet.email || carnet.correo || "-";

  holderName.textContent = `${(first_name + " " + last_name).trim() || "-".repeat(3)}`;
  holderRole.textContent = cargo || "—";
  infoDocumento.textContent = documento || "-";
  infoEmpresa.textContent = empresa || "-";
  infoVigencia.textContent = vigencia ? (typeof vigencia === "string" ? vigencia : formatDate(vigencia)) : "-";
  infoEmail.textContent = email;
  metaDoc.textContent = documento || "-";
  metaStatus.textContent = estado;
  infoCreated.textContent = carnet.createdAt ? formatDate(carnet.createdAt) : "-";

  // foto: si es url válida, usarla; si no, usar placeholder con iniciales
  if (foto && /^https?:\/\//i.test(foto)) {
    fotoEl.src = foto;
  } else {
    // placeholder: generamos una imagen SVG data-uri con iniciales
    const initials = (first_name[0] || "") + (last_name[0] || "");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='1000'><rect width='100%' height='100%' fill='#e6f0ff'/><text x='50%' y='50%' font-family='Inter, sans-serif' font-size='180' fill='#0b72ff' dominant-baseline='middle' text-anchor='middle'>${initials.toUpperCase()}</text></svg>`;
    fotoEl.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // Renderizar cualquier otra propiedad útil como campos extra
  const skipKeys = new Set([
    "first_name","last_name","documento","dni","numero_documento",
    "cargo","role","rol","job","empresa","company","foto","photo",
    "vigencia","valid_until","expiry","email","correo","is_active","status",
    "createdAt","updatedAt","_id","__v"
  ]);

  const keys = Object.keys(carnet).filter(k => !skipKeys.has(k));
  if (keys.length > 0) {
    keys.forEach(k => {
      const v = carnet[k];
      const row = document.createElement("div");
      row.className = "extra-row";
      row.innerHTML = `<span class="label">${k}</span><div class="value">${(v===null||v===undefined) ? "-" : (typeof v === "object" ? JSON.stringify(v) : v)}</div>`;
      extraFields.appendChild(row);
    });
  }

  // Mostrar tarjeta
  cardWrap.classList.remove("hidden");
  // scroll suave al resultado
  carnetCard.scrollIntoView({ behavior: "smooth", block: "center" });
}

/** Realiza la consulta al backend por documento (sin token) */
async function fetchByDocumento(documento) {
  const url = `${API_BASE}/carnets/documento/${encodeURIComponent(documento)}`;
  try {
    showMessage("Buscando...");
    const res = await fetch(url, { method: "GET" });
    if (res.status === 404) {
      showMessage("No se encontró un carnet con ese documento.", true);
      cardWrap.classList.add("hidden");
      return null;
    }
    if (!res.ok) {
      const text = await res.text();
      showMessage("Error en la consulta: " + res.status, true);
      cardWrap.classList.add("hidden");
      console.error("Respuesta no OK:", res.status, text);
      return null;
    }
    const payload = await res.json();
    if (!payload || !payload.data) {
      showMessage("Respuesta inválida del servidor.", true);
      cardWrap.classList.add("hidden");
      return null;
    }
    showMessage("");
    return payload.data;
  } catch (err) {
    console.error(err);
    showMessage("Error de red o CORS. Revisa la consola.", true);
    cardWrap.classList.add("hidden");
    return null;
  }
}

/** Handler del botón de búsqueda */
async function handleSearch() {
  const documento = (docInput.value || "").trim();
  if (!documento) {
    showMessage("Ingresa un número de documento.", true);
    return;
  }
  // bloqueamos UI
  searchBtn.disabled = true;
  searchBtn.textContent = "Buscando...";
  const carnet = await fetchByDocumento(documento);
  if (carnet) renderCarnet(carnet);
  searchBtn.disabled = false;
  searchBtn.textContent = "Buscar";
}

// Descargar la tarjeta como PNG usando html2canvas
downloadBtn.addEventListener("click", async () => {
  downloadBtn.disabled = true;
  downloadBtn.textContent = "Generando...";
  try {
    const el = document.getElementById("carnet-card");
    const canvas = await html2canvas(el, { scale: 2, useCORS: true });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carnet_${(document.getElementById("info-documento").textContent || "id")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (e) {
    console.error(e);
    alert("No fue posible generar la imagen. Revisa la consola.");
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = "Descargar PNG";
  }
});

searchBtn.addEventListener("click", handleSearch);
docInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
