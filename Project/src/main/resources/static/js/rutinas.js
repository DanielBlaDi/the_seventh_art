/* =========================================================
   rutinas.js – Gestión de rutinas
   - Carga ejercicios desde /api/ejercicios
   - Crea / lista / elimina / edita rutinas
   - Busca rutinas por nombre
   - Muestra detalle de rutina (Empezar Rutina)
   ========================================================= */

/* ---------- Estado global ---------- */

// Ejercicios disponibles (crear / agregar)
let ejercicios = [];

// Ejercicios seleccionados al CREAR rutina (panel derecho)
let seleccionados = [];

// Borrador cuando creamos una rutina (antes del POST)
let borradorRutina = null;

// Datos de la rutina que se está editando
let rutinaEditData = null;

// Cache de rutinas del usuario (para buscador)
let rutinasCache = [];

// Id de rutina a eliminar
let rutinaIdAEliminar = null;

// Rutina que se está viendo en el modal "Ver Rutina" (para Empezar)
let rutinaVistaActual = null;

// Paginación
const pageSize = 10;
let currentPage = 1;            // crear rutina
let currentPageAgregar = 1;     // modal agregar ejercicios (editar)

// Tipo de último mensaje mostrado en modalConfirm
let ultimoTipoConfirm = "info";

/* ---------- DOM refs generales ---------- */
const modal = document.getElementById("modalCrearRutina");
const btnAbrir = document.getElementById("btnAbrirModal");
const cerrarModalBtn = document.getElementById("cerrarModal");
const cancelar = document.getElementById("cancelar");

const listaEjercicios = document.getElementById("listaEjercicios");
const filtros = document.getElementById("filtros");
const filtroGrupo = document.getElementById("filtroGrupo");
const buscarInput = document.getElementById("buscarEjercicio");
const seleccionadosCont = document.getElementById("seleccionados");
const contadorSel = document.getElementById("contadorSel");
const crearRutinaBtn = document.getElementById("crearRutina");
const contenedorRutinas = document.getElementById("rutinasExistentes");

// Buscador de rutinas (input de arriba)
const buscadorRutinas = document.querySelector(
    'input.search-input[placeholder^="Buscar rutinas"]'
);

/* ---------- Modal VER EJERCICIO ---------- */
const modalVer = document.getElementById("modalVerEjercicio");
const cerrarVer = document.getElementById("cerrarVer");
const cerrarVerFooter = document.getElementById("cerrarVerFooter");
const verNombre = document.getElementById("verNombre");
const verImagen = document.getElementById("verImagen");
const verDescripcion = document.getElementById("verDescripcion");
const verInstrucciones = document.getElementById("verInstrucciones");
const verCategorias = document.getElementById("verCategorias");

/* ---------- Modal CONFIRMACIÓN ---------- */
const modalConfirm = document.getElementById("modalConfirm");
const cerrarConfirm = document.getElementById("cerrarConfirm");
const confirmOk = document.getElementById("confirmOk");
const confirmText = document.getElementById("confirmText");
const confirmTitulo = document.getElementById("confirmTitulo");

let confirmCallback = null;

/* ---------- Modal DESCRIPCIÓN RUTINA (crear) ---------- */
const modalDescripcion = document.getElementById("modalDescripcionRutina");
const cerrarDescripcion = document.getElementById("cerrarDescripcion");
const cancelarDescripcion = document.getElementById("cancelarDescripcion");
const hechoDescripcion = document.getElementById("hechoDescripcion");
const descripcionRutinaInput = document.getElementById("descripcionRutina");

/* ---------- Modal ELIMINAR RUTINA ---------- */
const modalEliminarRutina = document.getElementById("modalEliminarRutina");
const nombreRutinaEliminar = document.getElementById("nombreRutinaEliminar");
const cerrarEliminarRutina = document.getElementById("cerrarEliminarRutina");
const cancelarEliminarRutina = document.getElementById("cancelarEliminarRutina");
const confirmarEliminarRutina = document.getElementById("confirmarEliminarRutina");

/* ---------- Modal EDITAR RUTINA ---------- */
const modalEditarRutina = document.getElementById("modalEditarRutina");
const editarNombreRutinaInput = document.getElementById("editarNombreRutina");
const editarDescripcionRutina = document.getElementById("editarDescripcionRutina");
const editarResumenRutina = document.getElementById("editarResumenRutina");
const listaEjerciciosEditar = document.getElementById("listaEjerciciosEditar");
const cerrarEditarRutina = document.getElementById("cerrarEditarRutina");
const cancelarEditarRutina = document.getElementById("cancelarEditarRutina");
const guardarEditarRutina = document.getElementById("guardarEditarRutina");
const btnAgregarEjercicioEditar = document.getElementById("btnAgregarEjercicioEditar");

/* ---------- Modal AGREGAR EJERCICIOS (desde EDITAR) ---------- */
const modalAgregarEjercicios = document.getElementById("modalAgregarEjercicios");
const cerrarAgregarEjercicios = document.getElementById("cerrarAgregarEjercicios");
const cancelarAgregarEjercicios = document.getElementById("cancelarAgregarEjercicios");
const guardarAgregarEjerciciosBtn = document.getElementById("guardarAgregarEjercicios");

const listaEjerciciosAgregar = document.getElementById("listaEjerciciosAgregar");
const buscarEjercicioAgregar = document.getElementById("buscarEjercicioAgregar");
const filtroGrupoAgregar = document.getElementById("filtroGrupoAgregar");

/* ---------- Modal VER RUTINA (Empezar Rutina) ---------- */
const modalVerRutina = document.getElementById("modalVerRutina");
const cerrarVerRutina = document.getElementById("cerrarVerRutina");
const cerrarVerRutinaFooter = document.getElementById("cerrarVerRutinaFooter");
const verRutinaNombre = document.getElementById("verRutinaNombre");
const verRutinaResumen = document.getElementById("verRutinaResumen");
const verRutinaDescripcion = document.getElementById("verRutinaDescripcion");
const verRutinaListaEjercicios = document.getElementById("verRutinaListaEjercicios");
const verRutinaEmpezarBtn = document.getElementById("verRutinaEmpezarBtn");

/* ---------- CSRF (Spring Security) ---------- */
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
const csrfHeaderName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

function buildHeaders(json = false) {
    const headers = {};
    if (json) {
        headers["Content-Type"] = "application/json";
    }
    if (csrfToken && csrfHeaderName) {
        headers[csrfHeaderName] = csrfToken;
    }
    return headers;
}

/* =========================================================
   Helpers
   ========================================================= */

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

/* =========================================================
   Carga de ejercicios desde backend
   ========================================================= */

/**
 * Carga ejercicios.
 *  - Sin parámetro: usa el select #filtroGrupo (crear rutina)
 *  - Con tipoOverride: usa ese tipo (modal agregar ejercicios)
 */
async function cargarEjerciciosDesdeBackend(tipoOverride) {
    const tipoBase = filtroGrupo ? filtroGrupo.value : "TODOS";
    const tipo = (typeof tipoOverride === "string" && tipoOverride.length > 0)
        ? tipoOverride
        : tipoBase;

    const params = (tipo && tipo !== "TODOS")
        ? ('?tipo=' + encodeURIComponent(tipo))
        : '';

    const resp = await fetch('/api/ejercicios' + params);
    if (!resp.ok) {
        console.error('Error al cargar ejercicios:', resp.status);
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
        instrucciones: []  // reservado
    }));
}

/* =========================================================
   Modal CREAR RUTINA: abrir / cerrar
   ========================================================= */

function openCrearRutinaModal() {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function closeCrearRutinaModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

if (btnAbrir) {
    btnAbrir.addEventListener("click", async () => {
        openCrearRutinaModal();
        await cargarEjerciciosDesdeBackend();
        currentPage = 1;
        renderEjercicios();
        renderSeleccionados();
    });
}

if (cerrarModalBtn) cerrarModalBtn.addEventListener("click", closeCrearRutinaModal);
if (cancelar) cancelar.addEventListener("click", closeCrearRutinaModal);

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeCrearRutinaModal();
    });
}

/* =========================================================
   Modal VER EJERCICIO
   ========================================================= */

function closeVerEjercicioModal() {
    if (!modalVer) return;
    modalVer.classList.add("hidden");
    modalVer.setAttribute("aria-hidden", "true");
}

if (cerrarVer) cerrarVer.addEventListener("click", closeVerEjercicioModal);
if (cerrarVerFooter) cerrarVerFooter.addEventListener("click", closeVerEjercicioModal);
if (modalVer) {
    modalVer.addEventListener("click", (e) => {
        if (e.target === modalVer) closeVerEjercicioModal();
    });
}

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

    modalVer.style.zIndex = "9999";
    modalVer.classList.remove("hidden");
    modalVer.setAttribute("aria-hidden", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================================
   Modal CONFIRMACIÓN
   ========================================================= */
function openConfirmModal(titulo, texto, callback) {
    if (!modalConfirm) return;
    if (confirmTitulo) confirmTitulo.textContent = titulo || "";
    if (confirmText)  confirmText.textContent  = texto  || "";
    confirmCallback = (typeof callback === "function") ? callback : null;

    modalConfirm.classList.remove("hidden");
    modalConfirm.setAttribute("aria-hidden", "false");
}

function closeConfirmModal() {
    if (!modalConfirm) return;
    modalConfirm.classList.add("hidden");
    modalConfirm.setAttribute("aria-hidden", "true");
    // limpiamos referencia para siguientes usos
    confirmCallback = null;
}

if (cerrarConfirm) {
    cerrarConfirm.addEventListener("click", () => {
        closeConfirmModal();
    });
}

if (confirmOk) {
    confirmOk.addEventListener("click", () => {
        // Guardamos el callback ANTES de cerrar
        const cb = confirmCallback;

        // Cerrar el modal (esto pone confirmCallback = null)
        closeConfirmModal();

        // Ejecutar el callback si existía
        if (typeof cb === "function") {
            cb();
        }
    });
}

if (modalConfirm) {
    modalConfirm.addEventListener("click", (e) => {
        if (e.target === modalConfirm) {
            closeConfirmModal();
        }
    });
}
/* =========================================================
   Render lista de EJERCICIOS (crear rutina) + paginación
   ========================================================= */

function renderEjercicios() {
    const q = (buscarInput?.value || "").toLowerCase().trim();

    const filtrados = ejercicios.filter(e =>
        e.nombre.toLowerCase().includes(q)
    );

    listaEjercicios.innerHTML = "";

    if (filtrados.length === 0) {
        listaEjercicios.innerHTML = `<div class="ejercicio">No se encontraron ejercicios</div>`;
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
        const imagenBg = e.imagen ? `background-image:url('${e.imagen}')` : '';

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
              ${yaSeleccionado ? "✓" : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon-svg" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              `}
            </button>
          </div>
        `;
        listaEjercicios.appendChild(item);
    });

    listaEjercicios.querySelectorAll(".btn-add:not(.selected)").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            agregarEjercicio(id);
            renderEjercicios(); // refresco para marcar como seleccionado
        });
    });

    listaEjercicios.querySelectorAll(".btn-ver").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            abrirVerEjercicio(id);
        });
    });

    renderPaginacion(totalPages);
}

function renderPaginacion(totalPages) {
    if (totalPages <= 1) return;

    const pag = document.createElement('div');
    pag.className = 'pagination';

    const prev = document.createElement('button');
    prev.textContent = '‹';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderEjercicios();
        }
    });
    pag.appendChild(prev);

    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
        btn.addEventListener('click', () => {
            currentPage = p;
            renderEjercicios();
        });
        pag.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = '›';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderEjercicios();
        }
    });
    pag.appendChild(next);

    listaEjercicios.appendChild(pag);
}

/* ------- Filtros y búsqueda de ejercicios (crear) ------- */

if (filtroGrupo) {
    filtroGrupo.addEventListener("change", async () => {
        currentPage = 1;
        await cargarEjerciciosDesdeBackend();
        renderEjercicios();
    });
}

if (buscarInput) {
    buscarInput.addEventListener("input", () => {
        currentPage = 1;
        renderEjercicios();
    });
}

/* =========================================================
   Panel derecho: EJERCICIOS SELECCIONADOS (crear)
   ========================================================= */

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
        const imagenBg = s.imagen ? `background-image:url('${s.imagen}')` : '';

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

    seleccionadosCont.querySelectorAll(".btn-eliminar").forEach(b => {
        b.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            seleccionados = seleccionados.filter(x => x.id !== id);
            renderSeleccionados();
            renderEjercicios(); // refresco botones "+"
        });
    });
}

/* =========================================================
   Crear RUTINA (POST /api/rutinas)
   ========================================================= */

if (crearRutinaBtn) {
    crearRutinaBtn.addEventListener("click", () => {
        const nombreInput = document.getElementById("nombreRutina");
        const nombre = (nombreInput?.value || "").trim();

        if (!nombre) {
            confirmTitulo.textContent = "Nombre requerido";
            confirmText.textContent = "Ingresa un nombre para la rutina antes de crearla.";
            ultimoTipoConfirm = "error";
            modalConfirm.classList.remove("hidden");
            modalConfirm.setAttribute("aria-hidden", "false");
            return;
        }

        if (seleccionados.length === 0) {
            confirmTitulo.textContent = "Ejercicios requeridos";
            confirmText.textContent = "Agrega al menos un ejercicio antes de crear la rutina.";
            ultimoTipoConfirm = "error";
            modalConfirm.classList.remove("hidden");
            modalConfirm.setAttribute("aria-hidden", "false");
            return;
        }

        borradorRutina = {
            nombre,
            ejercicios: [...seleccionados]
        };

        if (descripcionRutinaInput) descripcionRutinaInput.value = "";
        if (modalDescripcion) {
            modalDescripcion.classList.remove("hidden");
            modalDescripcion.setAttribute("aria-hidden", "false");
        }
    });
}

function closeDescripcionModal() {
    if (!modalDescripcion) return;
    modalDescripcion.classList.add("hidden");
    modalDescripcion.setAttribute("aria-hidden", "true");
}

if (cerrarDescripcion) cerrarDescripcion.addEventListener("click", closeDescripcionModal);
if (cancelarDescripcion) cancelarDescripcion.addEventListener("click", closeDescripcionModal);
if (modalDescripcion) {
    modalDescripcion.addEventListener("click", (e) => {
        if (e.target === modalDescripcion) closeDescripcionModal();
    });
}

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
                confirmTitulo.textContent = "Error al crear rutina";
                confirmText.textContent = "Ocurrió un error al guardar la rutina. Inténtalo de nuevo.";
                ultimoTipoConfirm = "error";
                closeDescripcionModal();
                modalConfirm.classList.remove("hidden");
                modalConfirm.setAttribute("aria-hidden", "false");
                return;
            }

            await resp.json(); // id, si lo necesitas

            closeDescripcionModal();
            closeCrearRutinaModal();

            confirmTitulo.textContent = "Rutina creada";
            confirmText.innerHTML =
                `<strong>${borradorRutina.nombre}</strong><br/>Rutina creada con ${borradorRutina.ejercicios.length} ejercicio(s).`;
            ultimoTipoConfirm = "success";
            modalConfirm.classList.remove("hidden");
            modalConfirm.setAttribute("aria-hidden", "false");

            // limpiar estado
            seleccionados = [];
            renderSeleccionados();
            const nombreInput = document.getElementById("nombreRutina");
            if (nombreInput) nombreInput.value = "";
            if (descripcionRutinaInput) descripcionRutinaInput.value = "";

            await cargarRutinasExistentes();

        } catch (err) {
            console.error("Error de red al crear rutina:", err);
            confirmTitulo.textContent = "Error de conexión";
            confirmText.textContent = "No se pudo conectar con el servidor. Revisa tu conexión.";
            ultimoTipoConfirm = "error";
            closeDescripcionModal();
            modalConfirm.classList.remove("hidden");
            modalConfirm.setAttribute("aria-hidden", "false");
        }
    });
}

/* =========================================================
   Listar RUTINAS existentes (/api/rutinas/mias)
   + buscador por nombre
   ========================================================= */

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

    if (!lista || lista.length === 0) {
        // Si no hay rutinas en absoluto
        if (!rutinasCache || rutinasCache.length === 0) {
            contenedorRutinas.innerHTML = `
              <div class="ejercicio">
                Aún no tienes rutinas creadas.<br/>
                <span class="text-muted-foreground">Usa el botón "Crear" para empezar.</span>
              </div>
            `;
        } else {
            // Sí hay rutinas, pero el filtro no encontró nada
            contenedorRutinas.innerHTML = `
              <div class="ejercicio">
                No se encontraron rutinas con ese nombre.
              </div>
            `;
        }
        return;
    }

    lista.forEach(r => {
        const card = document.createElement("div");
        card.className = "card rutina-card";

        card.innerHTML = `
          <div class="rutina-header">
            <div>
              <h2 class="rutina-title">${r.nombre}</h2>
              <p class="rutina-subtitle">
                ${r.numeroEjercicios} ejercicio${r.numeroEjercicios === 1 ? "" : "s"}
              </p>
            </div>
            <div class="rutina-icons">
              <button class="icon-btn btn-edit-rutina" data-id="${r.id}" title="Editar rutina">
                ✏️
              </button>
              <button class="icon-btn btn-delete-rutina" data-id="${r.id}" data-nombre="${r.nombre}" title="Eliminar rutina">
                🗑
              </button>
            </div>
          </div>

          <div class="rutina-body">
            <p class="rutina-description">${r.descripcion || ""}</p>
          </div>

          <div class="rutina-footer">
            <button class="btn btn-primary btn-full" data-id="${r.id}">
              Empezar Rutina
            </button>
          </div>
        `;

        contenedorRutinas.appendChild(card);
    });

    // Listeners
    contenedorRutinas.querySelectorAll(".btn-full").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idRutina = e.currentTarget.dataset.id;
            abrirRutinaEnVista(idRutina); // abre el modal
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

// Buscador de rutinas por nombre
if (buscadorRutinas) {
    buscadorRutinas.addEventListener("input", () => {
        renderRutinasLista(buscadorRutinas.value || "");
    });
}

/* =========================================================
   ELIMINAR RUTINA (DELETE /api/rutinas/{id})
   ========================================================= */

function abrirModalEliminarRutina(id, nombre) {
    rutinaIdAEliminar = id;
    if (nombreRutinaEliminar) {
        nombreRutinaEliminar.textContent = nombre;
    }
    if (modalEliminarRutina) {
        modalEliminarRutina.classList.remove("hidden");
        modalEliminarRutina.setAttribute("aria-hidden", "false");
    }
}

function cerrarModalEliminar() {
    rutinaIdAEliminar = null;
    if (modalEliminarRutina) {
        modalEliminarRutina.classList.add("hidden");
        modalEliminarRutina.setAttribute("aria-hidden", "true");
    }
}

if (cerrarEliminarRutina) cerrarEliminarRutina.addEventListener("click", cerrarModalEliminar);
if (cancelarEliminarRutina) cancelarEliminarRutina.addEventListener("click", cerrarModalEliminar);
if (modalEliminarRutina) {
    modalEliminarRutina.addEventListener("click", (e) => {
        if (e.target === modalEliminarRutina) cerrarModalEliminar();
    });
}

if (confirmarEliminarRutina) {
    confirmarEliminarRutina.addEventListener("click", async () => {
        if (!rutinaIdAEliminar) {
            cerrarModalEliminar();
            return;
        }

        try {
            const resp = await fetch(`/api/rutinas/${rutinaIdAEliminar}`, {
                method: "DELETE",
                headers: buildHeaders(false)
            });

            if (!resp.ok && resp.status !== 204) {
                console.error("Error al eliminar rutina:", resp.status);
            }

            cerrarModalEliminar();
            await cargarRutinasExistentes();

        } catch (err) {
            console.error("Error de red al eliminar rutina:", err);
            cerrarModalEliminar();
        }
    });
}

/* =========================================================
   EDITAR RUTINA
   ========================================================= */

function abrirModalEditarRutinaDesdeCard(idRutina) {
    cargarDetalleRutina(idRutina);
}

function mostrarModalEditar() {
    if (!modalEditarRutina) return;
    modalEditarRutina.classList.remove("hidden");
    modalEditarRutina.setAttribute("aria-hidden", "false");
}

function cerrarModalEditar() {
    rutinaEditData = null;
    if (modalEditarRutina) {
        modalEditarRutina.classList.add("hidden");
        modalEditarRutina.setAttribute("aria-hidden", "true");
    }
}

if (cerrarEditarRutina) cerrarEditarRutina.addEventListener("click", cerrarModalEditar);
if (cancelarEditarRutina) cancelarEditarRutina.addEventListener("click", cerrarModalEditar);
if (modalEditarRutina) {
    modalEditarRutina.addEventListener("click", (e) => {
        if (e.target === modalEditarRutina) cerrarModalEditar();
    });
}

function actualizarEstadoBotonGuardar() {
    if (!guardarEditarRutina) return;

    const n = (rutinaEditData && Array.isArray(rutinaEditData.ejercicios))
        ? rutinaEditData.ejercicios.length
        : 0;

    guardarEditarRutina.disabled = (n === 0);
}

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

        if (editarResumenRutina) {
            const n = rutinaEditData.ejercicios.length;
            editarResumenRutina.textContent =
                `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
        }

        renderEjerciciosEditar();
        actualizarEstadoBotonGuardar();
        mostrarModalEditar();

    } catch (err) {
        console.error("Error de red al cargar detalle de rutina:", err);
    }
}

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

    listaEjerciciosEditar.querySelectorAll(".btn-eliminar-ej").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idEj = Number(e.currentTarget.dataset.id);
            if (!rutinaEditData) return;
            rutinaEditData.ejercicios = rutinaEditData.ejercicios.filter(x => x.id !== idEj);
            renderEjerciciosEditar();

            if (editarResumenRutina) {
                const n = rutinaEditData.ejercicios.length;
                editarResumenRutina.textContent =
                    `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
            }
        });
    });

    actualizarEstadoBotonGuardar();
}

/* ====== AGREGAR EJERCICIOS a rutina en edición ====== */

function agregarEjercicioARutinaEdit(idEjercicio) {
    if (!rutinaEditData) return;

    if (rutinaEditData.ejercicios.some(e => e.id === idEjercicio)) {
        return;
    }

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

    if (editarResumenRutina) {
        const n = rutinaEditData.ejercicios.length;
        editarResumenRutina.textContent =
            `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
    }
}

/* ================= MODAL AGREGAR EJERCICIOS ================= */

function openModalAgregarEjercicios() {
    if (!modalAgregarEjercicios) return;
    modalAgregarEjercicios.classList.remove("hidden");
    modalAgregarEjercicios.setAttribute("aria-hidden", "false");
    if (guardarAgregarEjerciciosBtn) guardarAgregarEjerciciosBtn.disabled = false;
}

function closeModalAgregarEjercicios() {
    if (!modalAgregarEjercicios) return;
    modalAgregarEjercicios.classList.add("hidden");
    modalAgregarEjercicios.setAttribute("aria-hidden", "true");
}

if (cerrarAgregarEjercicios) cerrarAgregarEjercicios.addEventListener("click", closeModalAgregarEjercicios);
if (cancelarAgregarEjercicios) cancelarAgregarEjercicios.addEventListener("click", closeModalAgregarEjercicios);
if (guardarAgregarEjerciciosBtn) {
    // Solo cierra; los "+" ya fueron agregando ejercicios a la rutina
    guardarAgregarEjerciciosBtn.addEventListener("click", closeModalAgregarEjercicios);
}
if (modalAgregarEjercicios) {
    modalAgregarEjercicios.addEventListener("click", (e) => {
        if (e.target === modalAgregarEjercicios) {
            closeModalAgregarEjercicios();
        }
    });
}

if (btnAgregarEjercicioEditar) {
    btnAgregarEjercicioEditar.addEventListener("click", async () => {
        const tipo = filtroGrupoAgregar ? filtroGrupoAgregar.value : "TODOS";
        await cargarEjerciciosDesdeBackend(tipo);
        currentPageAgregar = 1;
        renderEjerciciosAgregarEditar();
        openModalAgregarEjercicios();
    });
}

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
        const imagenBg = e.imagen ? `background-image:url('${e.imagen}')` : '';

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
              ${yaEnRutina ? "✓" : `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     class="icon-svg" aria-hidden="true">
                  <path d="M5 12h14"></path>
                  <path d="M12 5v14"></path>
                </svg>
              `}
            </button>
          </div>
        `;

        listaEjerciciosAgregar.appendChild(item);
    });

    listaEjerciciosAgregar.querySelectorAll(".btn-ver").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            abrirVerEjercicio(id);
        });
    });

    listaEjerciciosAgregar.querySelectorAll(".btn-add-edit:not(.selected)").forEach(b => {
        b.addEventListener("click", e => {
            const id = Number(e.currentTarget.dataset.id);
            agregarEjercicioARutinaEdit(id);
            renderEjerciciosAgregarEditar();
        });
    });

    renderPaginacionAgregarEditar(totalPages);
}

function renderPaginacionAgregarEditar(totalPages) {
    if (totalPages <= 1) return;

    const pag = document.createElement('div');
    pag.className = 'pagination';

    const prev = document.createElement('button');
    prev.textContent = '‹';
    prev.disabled = currentPageAgregar === 1;
    prev.addEventListener('click', () => {
        if (currentPageAgregar > 1) {
            currentPageAgregar--;
            renderEjerciciosAgregarEditar();
        }
    });
    pag.appendChild(prev);

    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement('button');
        btn.textContent = p;
        btn.className = 'page-btn' + (p === currentPageAgregar ? ' active' : '');
        btn.addEventListener('click', () => {
            currentPageAgregar = p;
            renderEjerciciosAgregarEditar();
        });
        pag.appendChild(btn);
    }

    const next = document.createElement('button');
    next.textContent = '›';
    next.disabled = currentPageAgregar === totalPages;
    next.addEventListener('click', () => {
        if (currentPageAgregar < totalPages) {
            currentPageAgregar++;
            renderEjerciciosAgregarEditar();
        }
    });
    pag.appendChild(next);

    listaEjerciciosAgregar.appendChild(pag);
}

/* ===== Guardar cambios de edición (PUT /api/rutinas/{id}) ===== */

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

// Filtros y búsqueda dentro de modal AGREGAR
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

/* =========================================================
   VER RUTINA (Empezar Rutina)
   ========================================================= */

function openModalVerRutina() {
    if (!modalVerRutina) return;
    modalVerRutina.classList.remove("hidden");
    modalVerRutina.setAttribute("aria-hidden", "false");
}

function closeModalVerRutina() {
    if (!modalVerRutina) return;
    modalVerRutina.classList.add("hidden");
    modalVerRutina.setAttribute("aria-hidden", "true");
}

if (cerrarVerRutina) cerrarVerRutina.addEventListener("click", closeModalVerRutina);
if (cerrarVerRutinaFooter) cerrarVerRutinaFooter.addEventListener("click", closeModalVerRutina);
if (modalVerRutina) {
    modalVerRutina.addEventListener("click", (e) => {
        if (e.target === modalVerRutina) closeModalVerRutina();
    });
}

// >>> AQUÍ ES DONDE CAMBIA LA LÓGICA DEL BOTÓN EMPEZAR RUTINA (MODAL) <<<
// >>> AQUÍ ES DONDE CAMBIA LA LÓGICA DEL BOTÓN EMPEZAR RUTINA (MODAL) <<<
if (verRutinaEmpezarBtn) {
    verRutinaEmpezarBtn.addEventListener("click", () => {
        if (!rutinaVistaActual) {
            console.warn("No hay rutinaVistaActual al intentar empezar la rutina");
            return;
        }

        // Función que realmente inicia la rutina:
        function iniciarRutinaSeleccionada() {
            const payload = {
                id: rutinaVistaActual.id,
                nombre: rutinaVistaActual.nombre,
                descripcion: rutinaVistaActual.descripcion || "",
                numeroEjercicios: rutinaVistaActual.numeroEjercicios || 0,
                ejerciciosCompletados: 0
            };

            try {
                sessionStorage.setItem("rutinaEnCurso", JSON.stringify(payload));
                sessionStorage.setItem("rutinaEnCurso_abrirModal", "1");
            } catch (e) {
                console.error("Error guardando rutina en curso en sessionStorage", e);
            }

            // Redirigimos a principal_home para que allí se active la card/modal
            window.location.href = "principal_home";
        }

        // 1) Revisar si ya hay una rutina en curso en sessionStorage
        const actualRaw = sessionStorage.getItem("rutinaEnCurso");
        if (actualRaw) {
            try {
                const actual = JSON.parse(actualRaw);

                // Si es la misma rutina, iniciarla sin preguntar otra vez
                if (actual && actual.id === rutinaVistaActual.id) {
                    iniciarRutinaSeleccionada();
                    return;
                }

                // Si es otra distinta → mostramos modal bonito de confirmación
                openConfirmModal(
                    "Otra rutina en progreso",
                    "Ya tienes otra rutina en progreso. ¿Deseas reemplazarla?",
                    () => {
                        // Si el usuario pulsa "Aceptar", iniciamos la nueva rutina
                        iniciarRutinaSeleccionada();
                    }
                );
                return;

            } catch (e) {
                console.error("Error leyendo rutinaEnCurso desde sessionStorage", e);
                // Si algo falla leyendo, por seguridad: iniciar directo
                iniciarRutinaSeleccionada();
                return;
            }
        }

        // 2) Si no había ninguna rutina en curso, simplemente la iniciamos
        iniciarRutinaSeleccionada();
    });
}

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
        if (verRutinaResumen) {
            verRutinaResumen.textContent =
                `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
        }

        // Guardamos la rutina que está en vista para que el botón "Empezar rutina"
        // pueda usar esta info y mandarla a principal_home
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


/* =========================================================
   Inicialización
   ========================================================= */

renderSeleccionados();
cargarRutinasExistentes();

