/* =========================================================
   rutinas.js  –  Versión integrada con backend
   - Carga ejercicios desde /api/ejercicios
   - Mantiene la lógica de selección, modales y creación
   ========================================================= */

/* ---------- Datos desde backend ---------- */
// NOTA: antes tenías un array "const ejercicios = [...]" mock.
// Ahora usamos este arreglo que se llena llamando a la API.
let ejercicios = [];

/**
 * Mapea el enum TipoEjercicio a un texto legible.
 */
function formatearTipoEjercicio(tipo) {
    const map = {
        PECHO_SUPERIOR: 'Pecho superior',
        PECHO_MEDIO: 'Pecho medio',
        PECHO_INFERIOR: 'Pecho inferior',
        DELTOIDE_ANTERIOR: 'Deltoide anterior',
        DELTOIDE_LATERAL: 'Deltoide lateral',
        DELTOIDE_POSTERIOR: 'Deltoide posterior',
        DORSALES: 'Dorsales',
        TRAPECIO_SUPERIOR: 'Trapecio superior',
        TRAPECIO_MEDIO: 'Trapecio medio',
        TRAPECIO_INFERIOR: 'Trapecio inferior',
        ROMBOIDES: 'Romboides',
        ERECTORES_ESPINALES: 'Erectores espinales',
        BICEPS: 'Bíceps',
        TRICEPS: 'Tríceps',
        ANTEBRAZO: 'Antebrazo',
        GLUTEOS: 'Glúteos',
        CUADRICEPS: 'Cuádriceps',
        ISQUIOTIBIALES: 'Isquiotibiales',
        ADUCTORES: 'Aductores',
        ABDUCTORES: 'Abductores',
        GEMELOS: 'Gemelos',
        SOLEO: 'Sóleo',
        TIBIAL_ANTERIOR: 'Tibial anterior',
        RECTO_ABDOMINAL: 'Recto abdominal',
        OBLICUOS: 'Oblicuos',
        TRANSVERSO_ABDOMINAL: 'Transverso abdominal',
        CUELLO: 'Cuello',
        FULL_BODY: 'Full body',
        OTRO: 'Otro'
    };
    return map[tipo] || tipo || '';
}

/**
 * Llama al backend y actualiza el array global "ejercicios".
 * - Respeta el filtro por grupo muscular (select #filtroGrupo).
 * - Normaliza los datos al formato que tu UI ya usaba:
 *   { id, nombre, descripcion, categoria, imagen, instrucciones, tipoEjercicio }
 */
async function cargarEjerciciosDesdeBackend() {
    const filtroGrupo = document.getElementById("filtroGrupo");
    const tipo = filtroGrupo ? filtroGrupo.value : "TODOS";

    const params = (tipo && tipo !== "TODOS") ? ('?tipo=' + encodeURIComponent(tipo)) : '';
    const resp = await fetch('/api/ejercicios' + params);

    if (!resp.ok) {
        console.error('Error al cargar ejercicios:', resp.status);
        ejercicios = [];
        return;
    }

    const data = await resp.json();

    // Normalizamos los campos al formato que usa el frontend
    ejercicios = data.map(e => ({
        id: e.id,
        nombre: e.nombre,
        descripcion: e.descripcion,
        categoria: formatearTipoEjercicio(e.tipoEjercicio),
        tipoEjercicio: e.tipoEjercicio,
        imagen: e.imagenUrl || "",
        instrucciones: []  // por ahora vacío; podrías llenarlo en el futuro
    }));
}

/* ---------- Seleccionados ---------- */
let seleccionados = [];

/* ---------- DOM refs ---------- */
const modal = document.getElementById("modalCrearRutina");
const btnAbrir = document.getElementById("btnAbrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const cancelar = document.getElementById("cancelar");
const listaEjercicios = document.getElementById("listaEjercicios");
const filtros = document.getElementById("filtros"); // contenedor general
const filtroGrupo = document.getElementById("filtroGrupo"); // <select>
const buscarInput = document.getElementById("buscarEjercicio");
const seleccionadosCont = document.getElementById("seleccionados");
const contadorSel = document.getElementById("contadorSel");
const crearRutinaBtn = document.getElementById("crearRutina");

/* ver modal refs */
const modalVer = document.getElementById("modalVerEjercicio");
const cerrarVer = document.getElementById("cerrarVer");
const cerrarVerFooter = document.getElementById("cerrarVerFooter");
const verNombre = document.getElementById("verNombre");
const verImagen = document.getElementById("verImagen");
const verDescripcion = document.getElementById("verDescripcion");
const verInstrucciones = document.getElementById("verInstrucciones");
const verCategorias = document.getElementById("verCategorias");

/* confirm modal refs */
const modalConfirm = document.getElementById("modalConfirm");
const cerrarConfirm = document.getElementById("cerrarConfirm");
const confirmOk = document.getElementById("confirmOk");
const confirmText = document.getElementById("confirmText");

/* =========================================================
   Abrir / cerrar modal CREAR RUTINA
   ========================================================= */
if (btnAbrir) {
    btnAbrir.addEventListener("click", async () => {
        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");

        // Cargamos ejercicios del backend y renderizamos
        await cargarEjerciciosDesdeBackend();
        renderEjercicios();
        renderSeleccionados();
    });
}

if (cerrarModal) cerrarModal.addEventListener("click", closeModal);
if (cancelar) cancelar.addEventListener("click", closeModal);

function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

/* cerrar haciendo click fuera */
if (modal) {
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
}

/* =========================================================
   Abrir / cerrar modal VER EJERCICIO
   ========================================================= */
if (cerrarVer) cerrarVer.addEventListener("click", () => modalVer.classList.add("hidden"));
if (cerrarVerFooter) cerrarVerFooter.addEventListener("click", () => modalVer.classList.add("hidden"));
if (modalVer) {
    modalVer.addEventListener("click", (e) => { if (e.target === modalVer) modalVer.classList.add("hidden"); });
}

/* =========================================================
   Abrir / cerrar modal CONFIRMACIÓN
   ========================================================= */
if (cerrarConfirm) cerrarConfirm.addEventListener("click", () => modalConfirm.classList.add("hidden"));
if (confirmOk) confirmOk.addEventListener("click", () => {
    modalConfirm.classList.add("hidden");
    // limpiar y cerrar modal main
    seleccionados = [];
    renderSeleccionados();
    const nombreRutinaInput = document.getElementById("nombreRutina");
    if (nombreRutinaInput) nombreRutinaInput.value = "";
    closeModal();
});
if (modalConfirm) {
    modalConfirm.addEventListener("click", (e) => { if (e.target === modalConfirm) modalConfirm.classList.add("hidden"); });
}

/* =========================================================
   Renderizar lista de ejercicios (panel izquierdo)
   ========================================================= */
function renderEjercicios() {
    const q = (buscarInput.value || "").toLowerCase().trim();

    listaEjercicios.innerHTML = "";
    const filtrados = ejercicios.filter(e =>
        e.nombre.toLowerCase().includes(q)
    );

    if (filtrados.length === 0) {
        listaEjercicios.innerHTML = `<div class="ejercicio">No se encontraron ejercicios</div>`;
        return;
    }

    filtrados.forEach(e => {
        const item = document.createElement("div");
        item.className = "ejercicio";
        const imagenBg = e.imagen ? `background-image:url('${e.imagen}')` : '';

        item.innerHTML = `
      <div style="display:flex; align-items:center;">
        <div style="width:76px; height:56px; border-radius:8px; ${imagenBg}; background-size:cover; background-position:center; border:1px solid var(--color-border);"></div>
        <div style="margin-left:.8rem">
          <div style="font-weight:700">${e.nombre}</div>
          <div class="meta">${e.categoria}</div>
        </div>
      </div>
      <div class="actions">
        <!-- eye SVG (ver) -->
        <button class="btn-ver" data-id="${e.id}" title="Ver">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>

        <!-- plus SVG (agregar) -->
        <button class="btn-add" data-id="${e.id}" title="Agregar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </button>
      </div>
    `;
        listaEjercicios.appendChild(item);
    });

    // event listeners para agregar / ver
    listaEjercicios.querySelectorAll(".btn-add").forEach(b => b.addEventListener("click", e => {
        const id = Number(e.currentTarget.dataset.id);
        agregarEjercicio(id);
    }));

    listaEjercicios.querySelectorAll(".btn-ver").forEach(b => b.addEventListener("click", e => {
        const id = Number(e.currentTarget.dataset.id);
        abrirVerEjercicio(id);
    }));
}

/* =========================================================
   Filtro por grupo muscular (select) y búsqueda
   ========================================================= */
if (filtroGrupo) {
    filtroGrupo.addEventListener("change", async () => {
        await cargarEjerciciosDesdeBackend();
        renderEjercicios();
    });
}

// Los botones .filter (antiguos) siguen funcionando si existen.
// No te estorban con el select.
if (filtros) {
    filtros.querySelectorAll(".filter").forEach(btn => {
        btn.addEventListener("click", async () => {
            filtros.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
            btn.classList.add("active");
            await cargarEjerciciosDesdeBackend();
            renderEjercicios();
        });
    });
}

/* búsqueda por nombre (filtra sobre el array ya cargado) */
if (buscarInput) {
    buscarInput.addEventListener("input", () => {
        renderEjercicios();
    });
}

/* =========================================================
   Agregar ejercicio a la selección
   ========================================================= */
function agregarEjercicio(id) {
    if (seleccionados.some(s => s.id === id)) return;
    const e = ejercicios.find(x => x.id === id);
    if (!e) return;

    // añadimos campos por defecto (series, reps, peso)
    seleccionados.push({
        id: e.id,
        nombre: e.nombre,
        categoria: e.categoria,
        imagen: e.imagen,
        descripcion: e.descripcion,
        instrucciones: e.instrucciones,
        series: 3,
        repeticiones: 10,
        peso: ""
    });

    renderSeleccionados();
}

/* =========================================================
   Renderizar ejercicios seleccionados (panel derecho)
   ========================================================= */
function renderSeleccionados() {
    seleccionadosCont.innerHTML = "";
    contadorSel.textContent = `(${seleccionados.length})`;

    if (seleccionados.length === 0) {
        seleccionadosCont.innerHTML = `<div class="ejercicio">No has agregado ejercicios<br><span class="text-muted-foreground">Selecciona al menos uno</span></div>`;
        return;
    }

    seleccionados.forEach(s => {
        const div = document.createElement("div");
        div.className = "sel-item";
        const imagenBg = s.imagen ? `background-image:url('${s.imagen}')` : '';

        div.innerHTML = `
      <div class="sel-left">
        <div style="width:96px; height:66px; border-radius:8px; ${imagenBg}; background-size:cover; background-position:center; border:1px solid var(--color-border);"></div>
        <div>
          <div class="sel-name">${s.nombre}</div>
          <div class="sel-small">${s.categoria}</div>
          <div class="ctrls">
            <label>Series <input type="number" min="1" value="${s.series}" data-id="${s.id}" data-prop="series" class="ctrl-number"></label>
            <label>Reps <input type="number" min="1" value="${s.repeticiones}" data-id="${s.id}" data-prop="repeticiones" class="ctrl-number"></label>
            <label>Peso <input type="number" min="0" value="${s.peso || ''}" data-id="${s.id}" data-prop="peso" class="ctrl-number"></label>
          </div>
        </div>
      </div>
      <div>
        <!-- trash SVG (eliminar) -->
        <button class="btn-eliminar" data-id="${s.id}" title="Quitar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
        seleccionadosCont.appendChild(div);
    });

    // listeners eliminar
    seleccionadosCont.querySelectorAll(".btn-eliminar").forEach(b => b.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.dataset.id);
        seleccionados = seleccionados.filter(x => x.id !== id);
        renderSeleccionados();
    }));

    // listeners inputs (series/reps/peso)
    seleccionadosCont.querySelectorAll(".ctrl-number").forEach(inp => {
        inp.addEventListener("input", (ev) => {
            const id = Number(ev.currentTarget.dataset.id);
            const prop = ev.currentTarget.dataset.prop;
            let val = ev.currentTarget.value;
            if (prop === "peso" && val === "") {
                val = "";
            } else {
                val = Number(val) || 0;
            }
            seleccionados = seleccionados.map(s => s.id === id ? { ...s, [prop]: val } : s);
        });
    });
}

/* =========================================================
   Abrir modal VER EJERCICIO (usa datos cargados del backend)
   ========================================================= */
function abrirVerEjercicio(id) {
    const e = ejercicios.find(x => x.id === Number(id));
    if (!e) return;

    verNombre.textContent = e.nombre;
    verImagen.style.backgroundImage = e.imagen ? `url('${e.imagen}')` : 'none';
    verDescripcion.textContent = e.descripcion || '';

    if (e.instrucciones && e.instrucciones.length > 0) {
        verInstrucciones.innerHTML = e.instrucciones.map(i => `<li>${i}</li>`).join("");
    } else {
        verInstrucciones.innerHTML = "";
    }

    verCategorias.innerHTML = `<span class="pill">${e.categoria}</span>`;
    modalVer.classList.remove("hidden");
}

/* =========================================================
   Crear rutina (a futuro se conectará al backend)
   ========================================================= */
if (crearRutinaBtn) {
    crearRutinaBtn.addEventListener("click", () => {
        const nombre = (document.getElementById("nombreRutina").value || "").trim() || "Rutina sin nombre";

        if (seleccionados.length === 0) {
            confirmText.textContent = "Agrega al menos un ejercicio antes de crear la rutina.";
            modalConfirm.classList.remove("hidden");
            return;
        }

        const payload = {
            nombre,
            ejercicios: seleccionados.map(s => ({
                id: s.id,
                nombre: s.nombre,
                categoria: s.categoria,
                series: s.series,
                repeticiones: s.repeticiones,
                peso: s.peso
            }))
        };
        console.log("Payload crear rutina:", payload);

        confirmText.innerHTML = `<strong>${nombre}</strong><br/>Rutina creada con ${seleccionados.length} ejercicio(s).`;
        modalConfirm.classList.remove("hidden");

        // Aquí, en el futuro, podrías hacer:
        // fetch('/api/rutinas', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    });
}

/* =========================================================
   Inicialización
   (cargamos seleccionados vacíos; los ejercicios se cargan al abrir modal)
   ========================================================= */
renderSeleccionados();
