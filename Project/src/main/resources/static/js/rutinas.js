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
let borradorRutina = null;
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
const confirmTitulo = document.getElementById("confirmTitulo");
let ultimoTipoConfirm = "info";

// Modal descripción rutina
const modalDescripcion = document.getElementById("modalDescripcionRutina");
const cerrarDescripcion = document.getElementById("cerrarDescripcion");
const cancelarDescripcion = document.getElementById("cancelarDescripcion");
const hechoDescripcion = document.getElementById("hechoDescripcion");
const descripcionRutinaInput = document.getElementById("descripcionRutina");

// ====== CSRF (Spring Security) ======
const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
const csrfHeaderName = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

// ====== EDICIÓN DE RUTINA ======
let rutinaEditData = null;

const modalEditarRutina = document.getElementById("modalEditarRutina");
const editarNombreRutinaInput = document.getElementById("editarNombreRutina");
const editarResumenRutina = document.getElementById("editarResumenRutina");
const listaEjerciciosEditar = document.getElementById("listaEjerciciosEditar");
const cerrarEditarRutina = document.getElementById("cerrarEditarRutina");
const cancelarEditarRutina = document.getElementById("cancelarEditarRutina");
const guardarEditarRutina = document.getElementById("guardarEditarRutina");
const btnAgregarEjercicioEditar = document.getElementById("btnAgregarEjercicioEditar");

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
if (confirmOk) {
    confirmOk.addEventListener("click", () => {
        modalConfirm.classList.add("hidden");

        if (ultimoTipoConfirm === "success") {
            // Si fue un éxito, limpiamos campos pero NO cerramos la ventana de creación
            seleccionados = [];
            renderSeleccionados();

            const nombreInput = document.getElementById("nombreRutina");
            if (nombreInput) nombreInput.value = "";

            if (descripcionRutinaInput) descripcionRutinaInput.value = "";
            // IMPORTANTE: no llamamos a closeModal(), así la ventana de creación sigue abierta
        }
        // Si fue error, simplemente cerramos el aviso y dejamos todo como estaba
    });
}

if (modalConfirm) {
    modalConfirm.addEventListener("click", (e) => { if (e.target === modalConfirm) modalConfirm.classList.add("hidden"); });
}

/* =========================================================
   Renderizar lista de ejercicios (panel izquierdo)
   ========================================================= */
// PAGINACIÓN
const pageSize = 10;      // ejercicios por "subpestaña"
let currentPage = 1;      // página actual

function renderEjercicios() {
    const q = (buscarInput.value || "").toLowerCase().trim();

    // filtramos por nombre
    const filtrados = ejercicios.filter(e =>
        e.nombre.toLowerCase().includes(q)
    );

    listaEjercicios.innerHTML = "";

    if (filtrados.length === 0) {
        listaEjercicios.innerHTML = `<div class="ejercicio">No se encontraron ejercicios</div>`;
        return;
    }

    // --- PAGINACIÓN ---
    const totalPages = Math.max(1, Math.ceil(filtrados.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pagina = filtrados.slice(start, end);

    // Pintar solo la página actual
    pagina.forEach(e => {
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
        <button class="btn-ver" data-id="${e.id}" title="Ver">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </button>

        <button class="btn-add" data-id="${e.id}" title="Agregar">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-svg" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
        </button>
      </div>
    `;
        listaEjercicios.appendChild(item);
    });

    // listeners de los botones dentro de la página actual
    listaEjercicios.querySelectorAll(".btn-add").forEach(b => b.addEventListener("click", e => {
        const id = Number(e.currentTarget.dataset.id);
        agregarEjercicio(id);
    }));

    listaEjercicios.querySelectorAll(".btn-ver").forEach(b => b.addEventListener("click", e => {
        const id = Number(e.currentTarget.dataset.id);
        abrirVerEjercicio(id);
    }));

    // --- RENDER BARRA DE PAGINACIÓN ---
    renderPaginacion(totalPages);
}

function renderPaginacion(totalPages) {
    if (totalPages <= 1) return; // si solo hay una página, no mostramos nada

    const pag = document.createElement('div');
    pag.className = 'pagination';

    // Botón anterior
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

    // Botones numéricos
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

    // Botón siguiente
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

    // Lo añadimos al final de la lista
    listaEjercicios.appendChild(pag);
}


/* =========================================================
   Filtro por grupo muscular (select) y búsqueda
   ========================================================= */
// Filtro grupo muscular
if (filtroGrupo) {
    filtroGrupo.addEventListener("change", async () => {
        currentPage = 1;                       // 👈 agregar
        await cargarEjerciciosDesdeBackend();
        renderEjercicios();
    });
}

// Búsqueda
if (buscarInput) {
    buscarInput.addEventListener("input", () => {
        currentPage = 1;                       // 👈 agregar
        renderEjercicios();
    });
}


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
    seleccionadosCont.querySelectorAll(".btn-eliminar").forEach(b =>
        b.addEventListener("click", (e) => {
            const id = Number(e.currentTarget.dataset.id);
            seleccionados = seleccionados.filter(x => x.id !== id);
            renderSeleccionados();
        })
    );
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
   Crear rutina
   ========================================================= */
if (crearRutinaBtn) {
    crearRutinaBtn.addEventListener("click", () => {
        const nombreInput = document.getElementById("nombreRutina");
        const nombre = (nombreInput?.value || "").trim();

        // 1) Validar nombre vacío
        if (!nombre) {
            confirmTitulo.textContent = "Nombre requerido";   // 👈 título acorde
            confirmText.textContent = "Ingresa un nombre para la rutina antes de crearla.";
            ultimoTipoConfirm = "error";
            modalConfirm.classList.remove("hidden");
            return;
        }

        // 2) Validar que haya al menos un ejercicio
        if (seleccionados.length === 0) {
            confirmTitulo.textContent = "Ejercicios requeridos";  // 👈 otro título
            confirmText.textContent = "Agrega al menos un ejercicio antes de crear la rutina.";
            ultimoTipoConfirm = "error";
            modalConfirm.classList.remove("hidden");
            return;
        }

        // 3) Si pasa validaciones, guardamos borrador y abrimos modal de descripción
        borradorRutina = {
            nombre,
            ejercicios: [...seleccionados]
        };

        if (descripcionRutinaInput) descripcionRutinaInput.value = "";
        modalDescripcion.classList.remove("hidden");
    });
}


if (hechoDescripcion) {
    hechoDescripcion.addEventListener("click", async () => {
        if (!borradorRutina) {
            modalDescripcion.classList.add("hidden");
            return;
        }

        const descripcion = (descripcionRutinaInput?.value || "").trim();

        const payload = {
            nombre: borradorRutina.nombre,
            descripcion,
            ejercicios: borradorRutina.ejercicios.map(s => ({
                id: s.id
            }))
        };

        console.log("Payload final para backend (rutina):", payload);

        try {
            const resp = await fetch("/api/rutinas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                    // aquí luego podemos añadir CSRF si lo tienes activo
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                console.error("Error al crear rutina:", resp.status);
                confirmTitulo.textContent = "Error al crear rutina";
                confirmText.textContent = "Ocurrió un error al guardar la rutina. Inténtalo de nuevo.";
                ultimoTipoConfirm = "error";
                modalDescripcion.classList.add("hidden");
                modalConfirm.classList.remove("hidden");
                return;
            }

            // Si tu controller devuelve solo el id:
            const rutinaId = await resp.json();
            console.log("Rutina creada en backend con id:", rutinaId);

            // Cerramos modal de descripción y el de creación
            modalDescripcion.classList.add("hidden");
            closeModal();

            // Mostramos confirmación de éxito
            confirmTitulo.textContent = "Rutina creada";
            confirmText.innerHTML =
                `<strong>${borradorRutina.nombre}</strong><br/>Rutina creada con ${borradorRutina.ejercicios.length} ejercicio(s).`;
            ultimoTipoConfirm = "success";
            modalConfirm.classList.remove("hidden");

            // limpiamos estado en front
            seleccionados = [];
            renderSeleccionados();
            const nombreInput = document.getElementById("nombreRutina");
            if (nombreInput) nombreInput.value = "";
            if (descripcionRutinaInput) descripcionRutinaInput.value = "";

        } catch (err) {
            console.error("Error de red al crear rutina:", err);
            confirmTitulo.textContent = "Error de conexión";
            confirmText.textContent = "No se pudo conectar con el servidor. Revisa tu conexión.";
            ultimoTipoConfirm = "error";
            modalDescripcion.classList.add("hidden");
            modalConfirm.classList.remove("hidden");
        }
    });
}

if (cerrarDescripcion) {
    cerrarDescripcion.addEventListener("click", () => {
        modalDescripcion.classList.add("hidden");
    });
}
if (cancelarDescripcion) {
    cancelarDescripcion.addEventListener("click", () => {
        modalDescripcion.classList.add("hidden");
    });
}
if (modalDescripcion) {
    modalDescripcion.addEventListener("click", (e) => {
        if (e.target === modalDescripcion) {
            modalDescripcion.classList.add("hidden");
        }
    });
}




/* =========================================================
   Inicialización
   (cargamos seleccionados vacíos; los ejercicios se cargan al abrir modal)
   ========================================================= */
renderSeleccionados();

const contenedorRutinas = document.getElementById("rutinasExistentes");

async function cargarRutinasExistentes() {
    if (!contenedorRutinas) return;

    contenedorRutinas.innerHTML = `
      <div class="ejercicio">Cargando tus rutinas...</div>
    `;

    try {
        const resp = await fetch("/api/rutinas/mias");
        if (!resp.ok) {
            console.error("Error al cargar rutinas:", resp.status);
            contenedorRutinas.innerHTML = `
              <div class="ejercicio">No se pudieron cargar tus rutinas.</div>
            `;
            return;
        }

        const rutinas = await resp.json();

        if (!rutinas || rutinas.length === 0) {
            contenedorRutinas.innerHTML = `
              <div class="ejercicio">
                Aún no tienes rutinas creadas.<br/>
                <span class="text-muted-foreground">Usa el botón "Crear" para empezar.</span>
              </div>
            `;
            return;
        }

        contenedorRutinas.innerHTML = "";

        rutinas.forEach(r => {
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
        <p class="rutina-description">${r.descripcion}</p>
      </div>

      <div class="rutina-footer">
        <button class="btn btn-primary btn-full" data-id="${r.id}">
          Empezar Rutina
        </button>
      </div>
    `;

            contenedorRutinas.appendChild(card);
        });


        // Aquí luego podrás enganchar el botón "Empezar Rutina"
        contenedorRutinas.querySelectorAll(".btn-full").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idRutina = e.currentTarget.dataset.id;
                console.log("Empezar rutina id:", idRutina);
                // Aquí más adelante abrimos la vista de ejecución de rutina
            });
        });

        contenedorRutinas.querySelectorAll(".btn-delete-rutina").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.currentTarget.dataset.id;
                const nombre = e.currentTarget.dataset.nombre;
                abrirModalEliminarRutina(id, nombre);
            });
        });

    } catch (err) {
        console.error("Error de red al cargar rutinas:", err);
        contenedorRutinas.innerHTML = `
          <div class="ejercicio">Error de conexión al cargar tus rutinas.</div>
        `;
    }

    contenedorRutinas.querySelectorAll(".btn-edit-rutina").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idRutina = e.currentTarget.dataset.id;
            abrirModalEditarRutinaDesdeCard(idRutina);
        });
    });

}

// Llamar al cargar la página
cargarRutinasExistentes();

// ======= ELIMINAR RUTINA (front) =======
let rutinaIdAEliminar = null;

const modalEliminarRutina = document.getElementById("modalEliminarRutina");
const nombreRutinaEliminar = document.getElementById("nombreRutinaEliminar");
const cerrarEliminarRutina = document.getElementById("cerrarEliminarRutina");
const cancelarEliminarRutina = document.getElementById("cancelarEliminarRutina");
const confirmarEliminarRutina = document.getElementById("confirmarEliminarRutina");

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

if (cerrarEliminarRutina) {
    cerrarEliminarRutina.addEventListener("click", cerrarModalEliminar);
}
if (cancelarEliminarRutina) {
    cancelarEliminarRutina.addEventListener("click", cerrarModalEliminar);
}
if (modalEliminarRutina) {
    modalEliminarRutina.addEventListener("click", (e) => {
        if (e.target === modalEliminarRutina) {
            cerrarModalEliminar();
        }
    });
}

if (confirmarEliminarRutina) {
    confirmarEliminarRutina.addEventListener("click", async () => {
        if (!rutinaIdAEliminar) {
            cerrarModalEliminar();
            return;
        }

        try {
            // 1) Construimos las cabeceras
            const headers = {};
            if (csrfToken && csrfHeaderName) {
                headers[csrfHeaderName] = csrfToken;   // ej: headers["X-CSRF-TOKEN"] = "abc123..."
            }

            console.log("Eliminando rutina id:", rutinaIdAEliminar);

            // 2) Usamos headers dentro del fetch
            const resp = await fetch(`/api/rutinas/${rutinaIdAEliminar}`, {
                method: "DELETE",
                headers
            });

            console.log("Respuesta DELETE:", resp.status);

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

function abrirModalEditarRutinaDesdeCard(idRutina) {
    // Aquí pedimos al backend los datos de la rutina
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

// listeners de cerrar
if (cerrarEditarRutina) cerrarEditarRutina.addEventListener("click", cerrarModalEditar);
if (cancelarEditarRutina) cancelarEditarRutina.addEventListener("click", cerrarModalEditar);
if (modalEditarRutina) {
    modalEditarRutina.addEventListener("click", (e) => {
        if (e.target === modalEditarRutina) cerrarModalEditar();
    });
}

async function cargarDetalleRutina(idRutina) {
    try {
        const resp = await fetch(`/api/rutinas/${idRutina}`);
        if (!resp.ok) {
            console.error("Error al cargar detalle de rutina:", resp.status);
            return;
        }

        const data = await resp.json();

        // 🔹 EXPECTATIVA DE RESPUESTA DEL BACKEND:
        // {
        //   id: number,
        //   nombre: string,
        //   descripcion: string,
        //   ejercicios: [
        //     { id, nombre, categoria, imagen, ... }
        //   ]
        // }

        rutinaEditData = {
            id: data.id,
            nombre: data.nombre,
            descripcion: data.descripcion,
            ejercicios: data.ejercicios || []
        };

        // Rellenar campos de la UI
        if (editarNombreRutinaInput) {
            editarNombreRutinaInput.value = rutinaEditData.nombre || "";
        }

        if (editarResumenRutina) {
            const n = rutinaEditData.ejercicios.length;
            editarResumenRutina.textContent = `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
            // luego puedes cambiar "45-60 min" por un valor real
        }

        renderEjerciciosEditar();

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
        return;
    }

    rutinaEditData.ejercicios.forEach(ej => {
        const div = document.createElement("div");
        div.className = "edit-ej-item";

        const imagenBg = ej.imagen ? `background-image:url('${ej.imagen}')` : "";

        div.innerHTML = `
          <div class="edit-ej-left">
            <div style="width:76px; height:56px; border-radius:8px; ${imagenBg}; background-size:cover; background-position:center; border:1px solid var(--color-border);"></div>
            <div>
              <div class="edit-ej-name">${ej.nombre}</div>
              <div class="edit-ej-meta">${ej.categoria || ""}</div>
            </div>
          </div>
          <div class="edit-ej-actions">
            <!-- Aquí podrías poner un botón "ver" si quieres -->
            <button class="btn-eliminar-ej" data-id="${ej.id}" title="Quitar de la rutina">
              🗑
            </button>
          </div>
        `;

        listaEjerciciosEditar.appendChild(div);
    });

    // manejar "quitar ejercicio de la rutina" en memoria (solo front)
    listaEjerciciosEditar.querySelectorAll(".btn-eliminar-ej").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idEj = Number(e.currentTarget.dataset.id);
            if (!rutinaEditData) return;
            rutinaEditData.ejercicios = rutinaEditData.ejercicios.filter(x => x.id !== idEj);
            renderEjerciciosEditar();

            // actualizar resumen
            if (editarResumenRutina) {
                const n = rutinaEditData.ejercicios.length;
                editarResumenRutina.textContent = `${n} ejercicio${n === 1 ? "" : "s"} • 45-60 min`;
            }
        });
    });
}

if (guardarEditarRutina) {
    guardarEditarRutina.addEventListener("click", () => {
        if (!rutinaEditData) return;

        const nuevoNombre = (editarNombreRutinaInput?.value || "").trim();

        const payloadEdicion = {
            nombre: nuevoNombre || rutinaEditData.nombre,
            descripcion: rutinaEditData.descripcion, // luego puedes editarla también
            ejercicios: (rutinaEditData.ejercicios || []).map(e => ({ id: e.id }))
        };

        console.log("Payload edición rutina (listo para backend):", payloadEdicion);

        // 🔜 Aquí tú implementarás:
        // fetch(`/api/rutinas/${rutinaEditData.id}`, { method: "PUT", body: JSON.stringify(payloadEdicion), ... })

        // Por ahora solo cerramos el modal y refrescamos la lista en pantalla
        cerrarModalEditar();
        cargarRutinasExistentes();
    });
}

