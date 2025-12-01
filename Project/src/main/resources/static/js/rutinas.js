// ========================================================
// rutinas.js
// Pantalla "Mis Rutinas"
// - Cargar ejercicios desde /api/ejercicios
// - Crear / listar / editar / eliminar rutinas
// - Ver detalle y empezar rutina (sessionStorage)
// ========================================================


/* ========================================================
   ESTADO GLOBAL
   ======================================================== */

let ejercicios = [];          // Ejercicios disponibles (para crear / agregar)
let seleccionados = [];       // Ejercicios elegidos al CREAR rutina

let borradorRutina = null;    // Datos temporales al crear rutina (antes del POST)
let rutinaEditData = null;    // Rutina que se está editando
let rutinasCache = [];        // Lista de rutinas del usuario (para buscador)
let rutinaVistaActual = null; // Rutina que se ve en el modal "Ver Rutina" (Empezar)

const pageSize = 10;
let currentPage = 1;          // Paginación lista de ejercicios (crear rutina)
let currentPageAgregar = 1;   // Paginación en modal "Agregar ejercicios" (editar)

let confirmCallback = null;   // Callback genérico del modal de confirmación


/* ========================================================
   REFERENCIAS AL DOM
   ======================================================== */

// Modal crear rutina
const modal = document.getElementById("modalCrearRutina");
const btnAbrir = document.getElementById("btnAbrirModal");
const cancelar = document.getElementById("cancelar");

const nombreRutinaInput = document.getElementById("nombreRutina");
const listaEjercicios = document.getElementById("listaEjercicios");
const filtroGrupo = document.getElementById("filtroGrupo");
const buscarInput = document.getElementById("buscarEjercicio");
const seleccionadosCont = document.getElementById("seleccionados");
const contadorSel = document.getElementById("contadorSel");
const crearRutinaBtn = document.getElementById("crearRutina");

// Contenedor principal de rutinas
const contenedorRutinas = document.getElementById("rutinasExistentes");

// Buscador de rutinas (header)
const buscadorRutinas = document.querySelector(
    'input.search-input[placeholder^="Buscar rutinas"]'
);

// Modal "Ver ejercicio"
const modalVer = document.getElementById("modalVerEjercicio");
const cerrarVerFooter = document.getElementById("cerrarVerFooter");
const verNombre = document.getElementById("verNombre");
const verImagen = document.getElementById("verImagen");
const verDescripcion = document.getElementById("verDescripcion");
const verCategorias = document.getElementById("verCategorias");

// Modal confirmación genérico
const modalConfirm = document.getElementById("modalConfirm");
const confirmOk = document.getElementById("confirmOk");
const confirmText = document.getElementById("confirmText");
const confirmTitulo = document.getElementById("confirmTitulo");

// Modal descripción al crear rutina
const modalDescripcion = document.getElementById("modalDescripcionRutina");
const cerrarDescripcion = document.getElementById("cerrarDescripcion");
const cancelarDescripcion = document.getElementById("cancelarDescripcion");
const hechoDescripcion = document.getElementById("hechoDescripcion");
const descripcionRutinaInput = document.getElementById("descripcionRutina");
const descripcionRutinaContador = document.getElementById("descripcionRutinaContador");

// Modal editar rutina
const modalEditarRutina = document.getElementById("modalEditarRutina");
const editarNombreRutinaInput = document.getElementById("editarNombreRutina");
const editarDescripcionRutina = document.getElementById("editarDescripcionRutina");
const listaEjerciciosEditar = document.getElementById("listaEjerciciosEditar");
const cerrarEditarRutina = document.getElementById("cerrarEditarRutina");
const cancelarEditarRutina = document.getElementById("cancelarEditarRutina");
const guardarEditarRutina = document.getElementById("guardarEditarRutina");
const btnAgregarEjercicioEditar = document.getElementById("btnAgregarEjercicioEditar");

// Modal "Agregar ejercicios" (desde editar rutina)
const modalAgregarEjercicios = document.getElementById("modalAgregarEjercicios");
const cerrarAgregarEjercicios = document.getElementById("cerrarAgregarEjercicios");
const cancelarAgregarEjercicios = document.getElementById("cancelarAgregarEjercicios");
const guardarAgregarEjerciciosBtn = document.getElementById("guardarAgregarEjercicios");
const listaEjerciciosAgregar = document.getElementById("listaEjerciciosAgregar");
const buscarEjercicioAgregar = document.getElementById("buscarEjercicioAgregar");
const filtroGrupoAgregar = document.getElementById("filtroGrupoAgregar");

// Modal "Ver rutina" (Empezar rutina)
const modalVerRutina = document.getElementById("modalVerRutina");
const cerrarVerRutinaFooter = document.getElementById("cerrarVerRutinaFooter");
const verRutinaNombre = document.getElementById("verRutinaNombre");
const verRutinaResumen = document.getElementById("verRutinaResumen");
const verRutinaDescripcion = document.getElementById("verRutinaDescripcion");
const verRutinaListaEjercicios = document.getElementById("verRutinaListaEjercicios");
const verRutinaEmpezarBtn = document.getElementById("verRutinaEmpezarBtn");

// CSRF Spring
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
const csrfHeaderName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content");

// Toast notificación
const toastNotif = document.getElementById("toastNotif");
const toastNotifText = document.getElementById("toastNotifText");
let toastNotifTimeoutId = null;


/* ========================================================
   LISTENERS BÁSICOS INMEDIATOS
   ======================================================== */

if (nombreRutinaInput) {
    nombreRutinaInput.addEventListener("input", updateCrearRutinaBtnState);
}


/* ========================================================
   HELPERS GENERALES
   ======================================================== */

// Abrir/cerrar modal por clase .hidden y aria-hidden
function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("hidden");
    modalEl.setAttribute("aria-hidden", "false");
}

function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("hidden");
    modalEl.setAttribute("aria-hidden", "true");
}

// Cierre del modal al hacer clic en el fondo oscuro
function setupModalBackdropClose(modalEl, closeFn) {
    if (!modalEl || typeof closeFn !== "function") return;
    modalEl.addEventListener("click", (e) => {
        if (e.target === modalEl) closeFn();
    });
}

// Paginación genérica
function renderPagination({ container, totalPages, currentPage, onPageChange }) {
    if (!container || totalPages <= 1) return;

    const pag = document.createElement("div");
    pag.className = "pagination";

    const prev = document.createElement("button");
    prev.textContent = "‹";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    });
    pag.appendChild(prev);

    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.textContent = p;
        btn.className = "page-btn" + (p === currentPage ? " active" : "");
        btn.addEventListener("click", () => onPageChange(p));
        pag.appendChild(btn);
    }

    const next = document.createElement("button");
    next.textContent = "›";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    });
    pag.appendChild(next);

    container.appendChild(pag);
}

// Texto tipo "3 ejercicios"
function resumenEjercicios(n) {
    return `${n} ejercicio${n === 1 ? "" : "s"}`;
}

// Toast simple esquina inferior derecha
function showToast(message) {
    if (!toastNotif || !toastNotifText) return;

    toastNotifText.textContent = message || "";
    toastNotif.classList.remove("hidden");

    if (toastNotifTimeoutId !== null) {
        clearTimeout(toastNotifTimeoutId);
        toastNotifTimeoutId = null;
    }

    toastNotifTimeoutId = setTimeout(() => {
        toastNotif.classList.add("hidden");
        toastNotifTimeoutId = null;
    }, 3000);
}

// Habilitar/deshabilitar botón "Crear Rutina"
function updateCrearRutinaBtnState() {
    if (!crearRutinaBtn) return;

    const nombreInput = document.getElementById("nombreRutina");
    const nombre = (nombreInput?.value || "").trim();
    const puedeCrear = nombre && seleccionados.length > 0;

    crearRutinaBtn.disabled = !puedeCrear;
}

// Headers base para fetch (incluye CSRF si existe)
function buildHeaders(json = false) {
    const headers = {};
    if (json) headers["Content-Type"] = "application/json";
    if (csrfToken && csrfHeaderName) {
        headers[csrfHeaderName] = csrfToken;
    }
    return headers;
}


/* ========================================================
   HELPERS ESPECÍFICOS DE EJERCICIOS
   ======================================================== */

// Pasar ENUM tipoEjercicio a texto legible
function formatearTipoEjercicio(tipo) {
    const map = {
        PECHO_SUPERIOR: "Pecho superior",
        PECHO_MEDIO: "Pecho medio",
        PECHO_INFERIOR: "Pecho inferior",
        DELTOIDE_ANTERIOR: "Deltoide anterior",
        DELTOIDE_LATERAL: "Deltoide lateral",
        DELTOIDE_POSTERIOR: "Deltoide posterior",
        DORSALES: "Dorsales",
        TRAPECIO_SUPERIOR: "Trapecio superior",
        TRAPECIO_MEDIO: "Trapecio medio",
        TRAPECIO_INFERIOR: "Trapecio inferior",
        ROMBOIDES: "Romboides",
        ERECTORES_ESPINALES: "Erectores espinales",
        BICEPS: "Bíceps",
        TRICEPS: "Tríceps",
        ANTEBRAZO: "Antebrazo",
        GLUTEOS: "Glúteos",
        CUADRICEPS: "Cuádriceps",
        ISQUIOTIBIALES: "Isquiotibiales",
        ADUCTORES: "Aductores",
        ABDUCTORES: "Abductores",
        GEMELOS: "Gemelos",
        SOLEO: "Sóleo",
        TIBIAL_ANTERIOR: "Tibial anterior",
        RECTO_ABDOMINAL: "Recto abdominal",
        OBLICUOS: "Oblicuos",
        TRANSVERSO_ABDOMINAL: "Transverso abdominal",
        CUELLO: "Cuello",
        FULL_BODY: "Full body",
        OTRO: "Otro"
    };
    return map[tipo] || tipo || "";
}


/* ========================================================
   CARGA DESDE BACKEND
   ======================================================== */

/**
 * Carga ejercicios para los selectores:
 *  - Sin parámetro: usa el select #filtroGrupo (crear rutina)
 *  - Con tipoOverride: usa ese tipo (modal "Agregar ejercicios")
 */
async function cargarEjerciciosDesdeBackend(tipoOverride) {
    const tipoBase = filtroGrupo ? filtroGrupo.value : "TODOS";
    const tipo = (typeof tipoOverride === "string" && tipoOverride.length > 0)
        ? tipoOverride
        : tipoBase;

    const params = tipo && tipo !== "TODOS"
        ? "?tipo=" + encodeURIComponent(tipo)
        : "";

    const resp = await fetch("/api/ejercicios" + params);
    if (!resp.ok) {
        console.error("Error al cargar ejercicios:", resp.status);
        ejercicios = [];
        return;
    }

    const data = await resp.json();

    ejercicios = data.map(e => ({
        id: e.id,
        nombre: e.nombre,
        descripcion: e.descripcion,
        categoria: formatearTipoEjercicio(e.tipoEjercicio),
        tipoEjercicio: e.tipoEjercicio,
        imagen: e.imagenUrl || "",
        instrucciones: [] // reservado por si luego se almacenan instrucciones
    }));
}

// Carga rutinas del usuario
async function cargarRutinasExistentes() {
    if (!contenedorRutinas) return;

    contenedorRutinas.innerHTML =
        `<div class="ejercicio">Cargando tus rutinas...</div>`;

    try {
        const resp = await fetch("/api/rutinas/mias");
        if (!resp.ok) {
            console.error("Error al cargar rutinas:", resp.status);
            contenedorRutinas.innerHTML =
                `<div class="ejercicio">No se pudieron cargar tus rutinas.</div>`;
            return;
        }

        const rutinas = await resp.json();
        rutinasCache = rutinas || [];
        renderRutinasLista("");

    } catch (err) {
        console.error("Error de red al cargar rutinas:", err);
        contenedorRutinas.innerHTML =
            `<div class="ejercicio">Error de conexión al cargar tus rutinas.</div>`;
    }
}


/* ========================================================
   MODAL CREAR RUTINA
   ======================================================== */

function openCrearRutinaModal() {
    openModal(modal);
}

function closeCrearRutinaModal() {
    closeModal(modal);
}

// Abrir modal crear
if (btnAbrir) {
    btnAbrir.addEventListener("click", async () => {
        openCrearRutinaModal();
        await cargarEjerciciosDesdeBackend();
        currentPage = 1;
        renderEjercicios();
        renderSeleccionados();
    });
}

// Cerrar modal crear
if (cancelar) cancelar.addEventListener("click", closeCrearRutinaModal);
setupModalBackdropClose(modal, closeCrearRutinaModal);


/* ========================================================
   MODAL VER EJERCICIO
   ======================================================== */

function closeVerEjercicioModal() {
    closeModal(modalVer);
}

if (cerrarVerFooter) {
    cerrarVerFooter.addEventListener("click", closeVerEjercicioModal);
}
setupModalBackdropClose(modalVer, closeVerEjercicioModal);

// Rellena el modal con los datos del ejercicio
function abrirVerEjercicio(id) {
    const e = ejercicios.find(x => x.id === Number(id));
    if (!e) return;

    verNombre.textContent = e.nombre;
    verImagen.style.backgroundImage = e.imagen ? `url('${e.imagen}')` : "none";
    verDescripcion.textContent = e.descripcion || "";
    verCategorias.innerHTML = `<span class="pill">${e.categoria}</span>`;

    modalVer.style.zIndex = "9999";
    openModal(modalVer);
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* ========================================================
   MODAL CONFIRMACIÓN (GENÉRICO)
   ======================================================== */

function openConfirmModal(titulo, texto, callback) {
    if (!modalConfirm) return;
    if (confirmTitulo) confirmTitulo.textContent = titulo || "";
    if (confirmText) confirmText.textContent = texto || "";
    confirmCallback = typeof callback === "function" ? callback : null;
    openModal(modalConfirm);
}

function closeConfirmModal() {
    closeModal(modalConfirm);
    confirmCallback = null;
}

if (confirmOk) {
    confirmOk.addEventListener("click", () => {
        closeConfirmModal();

        if (typeof confirmCallback === "function") {
            const cb = confirmCallback;
            confirmCallback = null;
            cb();
        }
    });
}

setupModalBackdropClose(modalConfirm, closeConfirmModal);


/* ========================================================
   LISTA DE EJERCICIOS (MODAL CREAR)
   ======================================================== */

function renderEjercicios() {
    const q = (buscarInput?.value || "").toLowerCase().trim();

    const filtrados = ejercicios.filter(e =>
        e.nombre.toLowerCase().includes(q)
    );

    listaEjercicios.innerHTML = "";

    if (filtrados.length === 0) {
        listaEjercicios.innerHTML =
            `<div class="ejercicio">No se encontraron ejercicios</div>`;
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pagina = filtrados.slice(start, end);

    const idsSeleccionados = new Set(seleccionados.map(s => s.id));

    pagina.forEach(e => {
        const item = document.createElement("div");
        item.className = "ejercicio";

        const imagenBg = e.imagen ? `background-image:url('${e.imagen}')` : "";
        const yaSeleccionado = idsSeleccionados.has(e.id);

        item.innerHTML = `
          <div style="display:flex; align-items:center;">
            <div style="width:76px; height:56px; border-radius:8px; ${imagenBg};
                        background-size:cover; background-position:center;
                        border:1px solid var(--color-border);"></div>
            <div style="margin-left:.8rem">
              <div style="font-weight:700">${e.nombre}</div>
              <div class="meta">${e.categoria}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn-ver" data-id="${e.id}" title="Ver">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="icon-svg" aria-hidden="true">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696
                           10.75 10.75 0 0 1 19.876 0
                           1 1 0 0 1 0 .696
                           10.75 10.75 0 0 1-19.876 0"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>

            <button class="btn-add ${yaSeleccionado ? "selected" : ""}"
                    data-id="${e.id}"
                    ${yaSeleccionado ? "disabled" : ""}
                    title="${yaSeleccionado ? "Já agregado" : "Agregar"}">
              ${
            yaSeleccionado
                ? "✓"
                : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon-svg" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              `
        }
            </button>
          </div>
        `;

        listaEjercicios.appendChild(item);
    });

    // Eventos "Agregar" y "Ver"
    listaEjercicios.querySelectorAll(".btn-add:not(.selected)").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            agregarEjercicio(id);
            renderEjercicios();
        });
    });

    listaEjercicios.querySelectorAll(".btn-ver").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            abrirVerEjercicio(id);
        });
    });

    // Paginación
    renderPagination({
        container: listaEjercicios,
        totalPages,
        currentPage,
        onPageChange: (p) => {
            currentPage = p;
            renderEjercicios();
        }
    });
}

// Filtro grupo muscular
if (filtroGrupo) {
    filtroGrupo.addEventListener("change", async () => {
        currentPage = 1;
        await cargarEjerciciosDesdeBackend();
        renderEjercicios();
    });
}

// Búsqueda por nombre
if (buscarInput) {
    buscarInput.addEventListener("input", () => {
        currentPage = 1;
        renderEjercicios();
    });
}


/* ========================================================
   EJERCICIOS SELECCIONADOS (PANEL DERECHO)
   ======================================================== */

function agregarEjercicio(id) {
    if (seleccionados.some(s => s.id === id)) return;

    const e = ejercicios.find(x => x.id === id);
    if (!e) return;

    seleccionados.push({
        id: e.id,
        nombre: e.nombre,
        categoria: e.categoria,
        imagen: e.imagen,
        descripcion: e.descripcion,
        instrucciones: e.instrucciones
    });

    renderSeleccionados();
    updateCrearRutinaBtnState();
}

function renderSeleccionados() {
    seleccionadosCont.innerHTML = "";
    contadorSel.textContent = `(${seleccionados.length})`;

    if (seleccionados.length === 0) {
        seleccionadosCont.innerHTML =
            `<div class="ejercicio">
               No has agregado ejercicios<br>
               <span class="text-muted-foreground">Selecciona al menos uno</span>
             </div>`;
        return;
    }

    seleccionados.forEach(s => {
        const div = document.createElement("div");
        div.className = "sel-item";

        const imagenBg = s.imagen ? `background-image:url('${s.imagen}')` : "";

        div.innerHTML = `
          <div class="sel-left">
            <div style="width:96px; height:66px; border-radius:8px; ${imagenBg};
                        background-size:cover; background-position:center;
                        border:1px solid var(--color-border);"></div>
            <div>
              <div class="sel-name">${s.nombre}</div>
              <div class="sel-small">${s.categoria}</div>
            </div>
          </div>
          <div>
            <button class="btn-eliminar" data-id="${s.id}" title="Quitar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                   aria-hidden="true">
                <path d="M10 11v6"></path>
                <path d="M14 11v6"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M3 6h18"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        `;

        seleccionadosCont.appendChild(div);
    });

    // Quitar de seleccionados
    seleccionadosCont.querySelectorAll(".btn-eliminar").forEach(b => {
        b.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            seleccionados = seleccionados.filter(x => x.id !== id);
            renderSeleccionados();
            renderEjercicios(); // refresca la lista izquierda
        });
    });

    updateCrearRutinaBtnState();
}


/* ========================================================
   CREAR RUTINA (POST /api/rutinas)
   ======================================================== */

if (crearRutinaBtn) {
    crearRutinaBtn.addEventListener("click", () => {
        const nombreInput = document.getElementById("nombreRutina");
        const nombre = (nombreInput?.value || "").trim();

        if (!nombre || seleccionados.length === 0) return;

        borradorRutina = {
            nombre,
            ejercicios: [...seleccionados]
        };

        if (descripcionRutinaInput) {
            descripcionRutinaInput.value = "";
            actualizarContadorDescripcion();
        }
        if (modalDescripcion) {
            openModal(modalDescripcion);
        }
    });
}

// Cierre modal descripción
function closeDescripcionModal() {
    closeModal(modalDescripcion);
    if (descripcionRutinaInput) actualizarContadorDescripcion();
}

// Contador caracteres descripción
function actualizarContadorDescripcion() {
    if (!descripcionRutinaInput || !descripcionRutinaContador) return;

    const length = descripcionRutinaInput.value.length || 0;
    const max = 200;
    descripcionRutinaContador.textContent = `${length}/${max} caracteres`;
}

if (descripcionRutinaInput) {
    descripcionRutinaInput.addEventListener("input", actualizarContadorDescripcion);
}

if (cerrarDescripcion) {
    cerrarDescripcion.addEventListener("click", closeDescripcionModal);
}
if (cancelarDescripcion) {
    cancelarDescripcion.addEventListener("click", closeDescripcionModal);
}
setupModalBackdropClose(modalDescripcion, closeDescripcionModal);

// Botón "Hecho" → POST /api/rutinas
if (hechoDescripcion) {
    hechoDescripcion.addEventListener("click", async () => {
        if (!borradorRutina) {
            closeDescripcionModal();
            return;
        }

        const descripcion = (descripcionRutinaInput?.value || "").trim();

        const payload = {
            nombre: borradorRutina.nombre,
            descripcion,
            ejercicios: borradorRutina.ejercicios.map(s => ({ id: s.id }))
        };

        try {
            const resp = await fetch("/api/rutinas", {
                method: "POST",
                headers: buildHeaders(true),
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                console.error("Error al crear rutina:", resp.status);
                closeDescripcionModal();
                showToast("Error al crear rutina. Intenta de nuevo.");
                return;
            }

            await resp.json(); // si se necesita el id, está aquí

            closeDescripcionModal();
            closeCrearRutinaModal();
            showToast("Rutina creada con éxito");

            // Reset estado
            seleccionados = [];
            renderSeleccionados();
            const nombreInput = document.getElementById("nombreRutina");
            if (nombreInput) nombreInput.value = "";
            if (descripcionRutinaInput) descripcionRutinaInput.value = "";

            await cargarRutinasExistentes();

        } catch (err) {
            console.error("Error de red al crear rutina:", err);
            closeDescripcionModal();
            showToast("Error de conexión al crear rutina.");
        }
    });
}


/* ========================================================
   LISTA DE RUTINAS + BUSCADOR
   ======================================================== */

function renderRutinasLista(filtroNombre = "") {
    if (!contenedorRutinas) return;

    let lista = rutinasCache;
    const q = filtroNombre.toLowerCase().trim();

    if (q) {
        lista = rutinasCache.filter(r =>
            (r.nombre || "").toLowerCase().includes(q)
        );
    }

    contenedorRutinas.innerHTML = "";

    // Sin rutinas o sin resultados
    if (!lista || lista.length === 0) {
        if (!rutinasCache || rutinasCache.length === 0) {
            // Nunca ha creado rutinas
            contenedorRutinas.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 15s1.5-2 4-2 4 2 4 2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <h2>Sin rutinas aún</h2>
            <p>
              Cuando crees una rutina desde el botón <strong>“Crear”</strong>,
              aparecerá aquí para que puedas gestionarla.
            </p>
          </div>
        `;
        } else {
            // Hay rutinas, pero el filtro no encuentra ninguna
            contenedorRutinas.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m21 21-4.34-4.34"></path>
                <circle cx="11" cy="11" r="8"></circle>
              </svg>
            </div>
            <h2>Sin resultados</h2>
            <p>No se encontraron rutinas con ese nombre.</p>
          </div>
        `;
        }
        return;
    }

    // Banner IA
    const iaBanner = document.createElement("div");
    iaBanner.className = "alert alert-purple rutina-ia-banner";
    iaBanner.innerHTML = `
      <div class="icon-circle icon-circle-sm" aria-hidden="true">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      </div>
      <span class="text-sm font-medium">
        ¿Necesitas ayuda? Prueba nuestras rutinas generadas con IA basadas en tu objetivo
      </span>
    `;
    contenedorRutinas.appendChild(iaBanner);

    // Tarjetas de rutinas
    lista.forEach(r => {
        const card = document.createElement("div");
        card.className = "card rutina-card";

        const subtitulo =
            typeof r.numeroEjercicios === "number"
                ? `${r.numeroEjercicios} ejercicio${r.numeroEjercicios === 1 ? "" : "s"}`
                : "";

        const descripcionHtml = r.descripcion
            ? `
              <div class="rutina-body">
                <p class="rutina-description">${r.descripcion}</p>
              </div>
            `
            : "";

        const ejerciciosPreview = Array.isArray(r.ejerciciosPreview)
            ? r.ejerciciosPreview.slice(0, 3)
            : [];

        const previewLines = ejerciciosPreview
            .map(ej => `<div class="rutina-ej-row">${ej.nombre}</div>`)
            .join("");

        const restantes = typeof r.numeroEjercicios === "number"
            ? Math.max(0, r.numeroEjercicios - ejerciciosPreview.length)
            : 0;

        const previewBlock = ejerciciosPreview.length > 0
            ? `
              <div class="rutina-preview">
                <div class="rutina-preview-left">
                  ${previewLines}
                </div>
                ${
                restantes > 0
                    ? `<div class="rutina-preview-more">
                             +${restantes} ejercicio${restantes === 1 ? "" : "s"} más
                           </div>`
                    : ""
            }
              </div>
            `
            : "";

        card.innerHTML = `
          <div class="rutina-header">
            <div class="rutina-header-left">
              <div class="rutina-icon-circle" aria-hidden="true">🏋️</div>
              <div>
                <h2 class="rutina-title">${r.nombre}</h2>
                <p class="rutina-subtitle">${subtitulo}</p>
              </div>
            </div>
            <div class="rutina-icons">
              <button class="icon-btn btn-edit-rutina"
                      data-id="${r.id}" title="Editar rutina">
                ✏️
              </button>
              <button class="icon-btn btn-delete-rutina"
                      data-id="${r.id}" data-nombre="${r.nombre}" title="Eliminar rutina">
                🗑
              </button>
            </div>
          </div>

          ${descripcionHtml}
          ${previewBlock}

          <div class="rutina-footer">
            <button class="btn btn-primary btn-full" data-id="${r.id}">
              <span class="rutina-play-icon" aria-hidden="true">▶</span>
              <span>Empezar Rutina</span>
            </button>
          </div>
        `;

        contenedorRutinas.appendChild(card);
    });

    // Eventos en tarjetas
    contenedorRutinas.querySelectorAll(".btn-full").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idRutina = e.currentTarget.dataset.id;
            abrirRutinaEnVista(idRutina);
        });
    });

    contenedorRutinas.querySelectorAll(".btn-delete-rutina").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = e.currentTarget.dataset.id;
            const nombre = e.currentTarget.dataset.nombre;
            abrirModalEliminarRutina(id, nombre);
        });
    });

    contenedorRutinas.querySelectorAll(".btn-edit-rutina").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idRutina = e.currentTarget.dataset.id;
            abrirModalEditarRutinaDesdeCard(idRutina);
        });
    });
}

// Buscador de rutinas (header)
if (buscadorRutinas) {
    buscadorRutinas.addEventListener("input", () => {
        renderRutinasLista(buscadorRutinas.value || "");
    });
}


/* ========================================================
   ELIMINAR RUTINA (BANNER EN LA TARJETA)
   ======================================================== */

function abrirModalEliminarRutina(id, nombre) {
    const previo = document.querySelector(".rutina-delete-banner");
    if (previo) previo.remove();

    if (!contenedorRutinas) return;

    const deleteBtn = contenedorRutinas.querySelector(
        `.btn-delete-rutina[data-id="${id}"]`
    );
    if (!deleteBtn) return;

    const card = deleteBtn.closest(".rutina-card");
    if (!card) return;

    const banner = document.createElement("div");
    banner.className = "rutina-delete-banner";
    banner.innerHTML = `
        <div class="rutina-delete-text">
            ¿Estás seguro de que quieres eliminar la rutina
            <strong>${nombre}</strong>?<br/>
            Esta acción eliminará la rutina completamente.
        </div>
        <div class="rutina-delete-actions">
            <button type="button"
                    class="btn eliminar rutina-delete-confirm">
                Eliminar
            </button>
            <button type="button"
                    class="btn cancelar rutina-delete-cancel">
                Cancelar
            </button>
        </div>
    `;

    card.appendChild(banner);

    const btnCancelar = banner.querySelector(".rutina-delete-cancel");
    const btnConfirmar = banner.querySelector(".rutina-delete-confirm");

    if (btnCancelar) {
        btnCancelar.addEventListener("click", () => {
            banner.remove();
        });
    }

    if (btnConfirmar) {
        btnConfirmar.addEventListener("click", async () => {
            try {
                const resp = await fetch(`/api/rutinas/${id}`, {
                    method: "DELETE",
                    headers: buildHeaders(false)
                });

                if (!resp.ok && resp.status !== 204) {
                    console.error("Error al eliminar rutina:", resp.status);
                }

                banner.remove();
                await cargarRutinasExistentes();
            } catch (err) {
                console.error("Error de red al eliminar rutina:", err);
                banner.remove();
            }
        });
    }
}


/* ========================================================
   EDITAR RUTINA
   ======================================================== */

// Abre el modal de edición trayendo primero el detalle
function abrirModalEditarRutinaDesdeCard(idRutina) {
    cargarDetalleRutina(idRutina);
}

function mostrarModalEditar() {
    openModal(modalEditarRutina);
}

function cerrarModalEditar() {
    rutinaEditData = null;
    closeModal(modalEditarRutina);
}

if (cerrarEditarRutina) {
    cerrarEditarRutina.addEventListener("click", cerrarModalEditar);
}
if (cancelarEditarRutina) {
    cancelarEditarRutina.addEventListener("click", cerrarModalEditar);
}
setupModalBackdropClose(modalEditarRutina, cerrarModalEditar);

// Habilitar/deshabilitar botón "Guardar cambios"
function actualizarEstadoBotonGuardar() {
    if (!guardarEditarRutina) return;

    const n = (rutinaEditData && Array.isArray(rutinaEditData.ejercicios))
        ? rutinaEditData.ejercicios.length
        : 0;

    guardarEditarRutina.disabled = n === 0;
}

// GET /api/rutinas/{id} para editar
async function cargarDetalleRutina(idRutina) {
    try {
        const resp = await fetch(`/api/rutinas/${idRutina}`);
        if (!resp.ok) {
            console.error("Error al cargar detalle de rutina:", resp.status);
            return;
        }

        const data = await resp.json();

        const ejerciciosNormalizados = (data.ejercicios || []).map(e => ({
            id: e.id,
            nombre: e.nombre,
            tipoEjercicio: e.tipoEjercicio,
            categoria: formatearTipoEjercicio(e.tipoEjercicio),
            imagen: e.url || ""
        }));

        rutinaEditData = {
            id: data.id,
            nombre: data.nombre,
            descripcion: data.descripcion,
            ejercicios: ejerciciosNormalizados
        };

        if (editarNombreRutinaInput) {
            editarNombreRutinaInput.value = rutinaEditData.nombre || "";
        }

        if (editarDescripcionRutina) {
            editarDescripcionRutina.value = rutinaEditData.descripcion || "";
        }

        renderEjerciciosEditar();
        actualizarEstadoBotonGuardar();
        mostrarModalEditar();

    } catch (err) {
        console.error("Error de red al cargar detalle de rutina:", err);
    }
}

// Lista de ejercicios dentro del modal de edición
function renderEjerciciosEditar() {
    if (!listaEjerciciosEditar) return;

    listaEjerciciosEditar.innerHTML = "";

    if (!rutinaEditData || !rutinaEditData.ejercicios || rutinaEditData.ejercicios.length === 0) {
        listaEjerciciosEditar.innerHTML = `
          <div class="ejercicio">
            Esta rutina no tiene ejercicios aún.<br/>
            <span class="text-muted-foreground">Usa "Agregar Ejercicio" para añadir alguno.</span>
          </div>
        `;
        actualizarEstadoBotonGuardar();
        return;
    }

    rutinaEditData.ejercicios.forEach(ej => {
        const div = document.createElement("div");
        div.className = "edit-ej-item";

        const imagenBg = ej.imagen ? `background-image:url('${ej.imagen}')` : "";

        div.innerHTML = `
          <div class="edit-ej-left">
            <div style="width:76px; height:56px; border-radius:8px; ${imagenBg};
                        background-size:cover; background-position:center;
                        border:1px solid var(--color-border);"></div>
            <div>
              <div class="edit-ej-name">${ej.nombre}</div>
              <div class="edit-ej-meta">${ej.categoria || ""}</div>
            </div>
          </div>
          <div class="edit-ej-actions">
            <button class="btn-eliminar-ej" data-id="${ej.id}" title="Quitar de la rutina">
              🗑
            </button>
          </div>
        `;

        listaEjerciciosEditar.appendChild(div);
    });

    // Quitar ejercicio de la rutina en edición
    listaEjerciciosEditar.querySelectorAll(".btn-eliminar-ej").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idEj = Number(e.currentTarget.dataset.id);
            if (!rutinaEditData) return;
            rutinaEditData.ejercicios = rutinaEditData.ejercicios.filter(x => x.id !== idEj);
            renderEjerciciosEditar();
            actualizarEstadoBotonGuardar();
        });
    });

    actualizarEstadoBotonGuardar();
}

// Agregar ejercicio a rutina en edición desde listado global
function agregarEjercicioARutinaEdit(idEjercicio) {
    if (!rutinaEditData) return;
    if (rutinaEditData.ejercicios.some(e => e.id === idEjercicio)) return;

    const base = ejercicios.find(x => x.id === idEjercicio);
    if (!base) return;

    rutinaEditData.ejercicios.push({
        id: base.id,
        nombre: base.nombre,
        tipoEjercicio: base.tipoEjercicio,
        categoria: formatearTipoEjercicio(base.tipoEjercicio),
        imagen: base.imagen
    });

    renderEjerciciosEditar();
    actualizarEstadoBotonGuardar();
}

// Guardar cambios de la rutina editada (PUT)
if (guardarEditarRutina) {
    guardarEditarRutina.addEventListener("click", async () => {
        if (!rutinaEditData) return;

        const nuevoNombre = (editarNombreRutinaInput?.value || "").trim();
        const nuevaDescripcion = (editarDescripcionRutina?.value || "").trim();

        const numEj = rutinaEditData.ejercicios ? rutinaEditData.ejercicios.length : 0;
        if (numEj === 0) {
            alert("La rutina debe tener al menos un ejercicio.");
            return;
        }

        const payloadEdicion = {
            nombre: nuevoNombre || rutinaEditData.nombre,
            descripcion: nuevaDescripcion || rutinaEditData.descripcion,
            ejercicios: (rutinaEditData.ejercicios || []).map(e => ({ id: e.id }))
        };

        try {
            const resp = await fetch(`/api/rutinas/${rutinaEditData.id}`, {
                method: "PUT",
                headers: buildHeaders(true),
                body: JSON.stringify(payloadEdicion)
            });

            if (!resp.ok) {
                console.error("Error al actualizar rutina:", resp.status);
                alert("Ocurrió un error al guardar la rutina.");
                return;
            }

            cerrarModalEditar();
            await cargarRutinasExistentes();

        } catch (err) {
            console.error("Error de red al actualizar rutina:", err);
            alert("Error de conexión al guardar la rutina.");
        }
    });
}


/* ========================================================
   MODAL "AGREGAR EJERCICIOS" (DESDE EDICIÓN)
   ======================================================== */

function openModalAgregarEjercicios() {
    openModal(modalAgregarEjercicios);
    if (guardarAgregarEjerciciosBtn) guardarAgregarEjerciciosBtn.disabled = false;
}

function closeModalAgregarEjercicios() {
    closeModal(modalAgregarEjercicios);
}

if (cerrarAgregarEjercicios) {
    cerrarAgregarEjercicios.addEventListener("click", closeModalAgregarEjercicios);
}
if (cancelarAgregarEjercicios) {
    cancelarAgregarEjercicios.addEventListener("click", closeModalAgregarEjercicios);
}

// Botón "Agregar Cambios" solo cierra el modal
if (guardarAgregarEjerciciosBtn) {
    guardarAgregarEjerciciosBtn.addEventListener("click", closeModalAgregarEjercicios);
}

setupModalBackdropClose(modalAgregarEjercicios, closeModalAgregarEjercicios);

// Abrir modal "Agregar ejercicios" usando el filtro correspondiente
if (btnAgregarEjercicioEditar) {
    btnAgregarEjercicioEditar.addEventListener("click", async () => {
        const tipo = filtroGrupoAgregar ? filtroGrupoAgregar.value : "TODOS";
        await cargarEjerciciosDesdeBackend(tipo);
        currentPageAgregar = 1;
        renderEjerciciosAgregarEditar();
        openModalAgregarEjercicios();
    });
}

// Lista de ejercicios dentro del modal "Agregar ejercicios"
function renderEjerciciosAgregarEditar() {
    if (!listaEjerciciosAgregar) return;

    const q = (buscarEjercicioAgregar?.value || "").toLowerCase().trim();

    const filtrados = ejercicios.filter(e =>
        e.nombre.toLowerCase().includes(q)
    );

    listaEjerciciosAgregar.innerHTML = "";

    if (filtrados.length === 0) {
        listaEjerciciosAgregar.innerHTML =
            `<div class="ejercicio">No se encontraron ejercicios</div>`;
        return;
    }

    const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
    if (currentPageAgregar > totalPages) currentPageAgregar = totalPages;

    const start = (currentPageAgregar - 1) * pageSize;
    const end = start + pageSize;
    const pagina = filtrados.slice(start, end);

    const idsEnRutina = new Set(
        (rutinaEditData?.ejercicios || []).map(e => e.id)
    );

    pagina.forEach(e => {
        const item = document.createElement("div");
        item.className = "ejercicio";

        const imagenBg = e.imagen ? `background-image:url('${e.imagen}')` : "";
        const yaEnRutina = idsEnRutina.has(e.id);

        item.innerHTML = `
          <div style="display:flex; align-items:center;">
            <div style="width:76px; height:56px; border-radius:8px; ${imagenBg};
                        background-size:cover; background-position:center;
                        border:1px solid var(--color-border);"></div>
            <div style="margin-left:.8rem">
              <div style="font-weight:700">${e.nombre}</div>
              <div class="meta">${formatearTipoEjercicio(e.tipoEjercicio)}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn-ver" data-id="${e.id}" title="Ver">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="icon-svg" aria-hidden="true">
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696
                           10.75 10.75 0 0 1 19.876 0
                           1 1 0 0 1 0 .696
                           10.75 10.75 0 0 1-19.876 0"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
            </button>

            <button class="btn-add-edit ${yaEnRutina ? "selected" : ""}"
                    data-id="${e.id}"
                    ${yaEnRutina ? "disabled" : ""}
                    title="${yaEnRutina ? "Ya en la rutina" : "Agregar a la rutina"}">
              ${
            yaEnRutina
                ? "✓"
                : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon-svg" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              `
        }
            </button>
          </div>
        `;

        listaEjerciciosAgregar.appendChild(item);
    });

    // Ver ejercicio desde este modal
    listaEjerciciosAgregar.querySelectorAll(".btn-ver").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            abrirVerEjercicio(id);
        });
    });

    // Agregar a la rutina en edición
    listaEjerciciosAgregar.querySelectorAll(".btn-add-edit:not(.selected)").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            agregarEjercicioARutinaEdit(id);
            renderEjerciciosAgregarEditar();
        });
    });

    // Paginación
    renderPagination({
        container: listaEjerciciosAgregar,
        totalPages,
        currentPage: currentPageAgregar,
        onPageChange: (p) => {
            currentPageAgregar = p;
            renderEjerciciosAgregarEditar();
        }
    });
}

// Filtro y búsqueda dentro del modal "Agregar ejercicios"
if (filtroGrupoAgregar) {
    filtroGrupoAgregar.addEventListener("change", async () => {
        const tipo = filtroGrupoAgregar.value;
        await cargarEjerciciosDesdeBackend(tipo);
        currentPageAgregar = 1;
        renderEjerciciosAgregarEditar();
    });
}

if (buscarEjercicioAgregar) {
    buscarEjercicioAgregar.addEventListener("input", () => {
        currentPageAgregar = 1;
        renderEjerciciosAgregarEditar();
    });
}


/* ========================================================
   VER RUTINA + EMPEZAR RUTINA (sessionStorage)
   ======================================================== */

function openModalVerRutina() {
    openModal(modalVerRutina);
}

function closeModalVerRutina() {
    closeModal(modalVerRutina);
}

if (cerrarVerRutinaFooter) {
    cerrarVerRutinaFooter.addEventListener("click", closeModalVerRutina);
}
setupModalBackdropClose(modalVerRutina, closeModalVerRutina);

// Botón "Empezar rutina" dentro del modal
if (verRutinaEmpezarBtn) {
    verRutinaEmpezarBtn.addEventListener("click", () => {
        if (!rutinaVistaActual) {
            console.warn("No hay rutinaVistaActual al intentar empezar la rutina");
            return;
        }

        function iniciarRutinaSeleccionada() {
            const ahora = Date.now();

            const payload = {
                id: rutinaVistaActual.id,
                nombre: rutinaVistaActual.nombre,
                descripcion: rutinaVistaActual.descripcion || "",
                numeroEjercicios: rutinaVistaActual.numeroEjercicios || 0,
                ejerciciosCompletados: 0,
                startedAt: ahora,
                elapsedWhilePaused: 0,
                isPaused: false,
                defaultRestSeconds: 90
            };

            try {
                sessionStorage.setItem("rutinaEnCurso", JSON.stringify(payload));
                sessionStorage.setItem("rutinaEnCurso_abrirModal", "1");
            } catch (e) {
                console.error("Error guardando rutina en curso en sessionStorage", e);
            }

            window.location.href = "principal_home";
        }

        const actualRaw = sessionStorage.getItem("rutinaEnCurso");
        if (actualRaw) {
            try {
                const actual = JSON.parse(actualRaw);

                if (actual && actual.id === rutinaVistaActual.id) {
                    iniciarRutinaSeleccionada();
                    return;
                }

                openConfirmModal(
                    "Otra rutina en progreso",
                    "Ya tienes otra rutina en progreso. ¿Deseas reemplazarla?",
                    () => {
                        iniciarRutinaSeleccionada();
                    }
                );
                return;

            } catch (e) {
                console.error("Error leyendo rutinaEnCurso desde sessionStorage", e);
                iniciarRutinaSeleccionada();
                return;
            }
        }

        iniciarRutinaSeleccionada();
    });
}

// Lista de ejercicios dentro del modal "Ver rutina"
function renderEjerciciosVistaRutina(ejerciciosVista) {
    if (!verRutinaListaEjercicios) return;

    verRutinaListaEjercicios.innerHTML = "";

    if (!ejerciciosVista || ejerciciosVista.length === 0) {
        verRutinaListaEjercicios.innerHTML = `
          <div class="ejercicio">
            Esta rutina aún no tiene ejercicios.
          </div>
        `;
        return;
    }

    ejerciciosVista.forEach(ej => {
        const div = document.createElement("div");
        div.className = "edit-ej-item";

        const imagenBg = ej.url ? `background-image:url('${ej.url}')` : "";

        div.innerHTML = `
          <div class="edit-ej-left">
            <div style="width:76px; height:56px; border-radius:8px; ${imagenBg};
                        background-size:cover; background-position:center;
                        border:1px solid var(--color-border);"></div>
            <div>
              <div class="edit-ej-name">${ej.nombre}</div>
              <div class="edit-ej-meta">${formatearTipoEjercicio(ej.tipoEjercicio)}</div>
            </div>
          </div>
        `;

        verRutinaListaEjercicios.appendChild(div);
    });
}

// Abre modal "Ver rutina" cargando datos desde backend
async function abrirRutinaEnVista(idRutina) {
    try {
        const resp = await fetch(`/api/rutinas/${idRutina}`);
        if (!resp.ok) {
            console.error("Error al cargar detalle de rutina:", resp.status);
            return;
        }

        const data = await resp.json();
        const n = (data.ejercicios || []).length;

        if (verRutinaNombre) verRutinaNombre.textContent = data.nombre || "";
        if (verRutinaDescripcion) verRutinaDescripcion.textContent = data.descripcion || "";
        if (verRutinaResumen) verRutinaResumen.textContent = resumenEjercicios(n);

        rutinaVistaActual = {
            id: data.id,
            nombre: data.nombre,
            descripcion: data.descripcion,
            numeroEjercicios: n
        };

        renderEjerciciosVistaRutina(data.ejercicios || []);
        openModalVerRutina();

    } catch (err) {
        console.error("Error de red al cargar rutina para vista:", err);
    }
}


/* ========================================================
   INICIALIZACIÓN GENERAL
   ======================================================== */

// Panel derecho vacío por defecto + botón "Crear"
renderSeleccionados();
updateCrearRutinaBtnState();

// Cargar lista de rutinas del usuario al entrar
cargarRutinasExistentes();