// rutina-en-curso.js
// Gestiona el estado de "rutina en curso" entre /rutinas y /principal_home

// --- helpers generales ---

function setRutinaEnCurso(info) {
    sessionStorage.setItem("rutinaEnCurso", JSON.stringify(info));
}

function getRutinaEnCurso() {
    const raw = sessionStorage.getItem("rutinaEnCurso");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Error parseando rutinaEnCurso:", e);
        sessionStorage.removeItem("rutinaEnCurso");
        return null;
    }
}

function clearRutinaEnCurso() {
    sessionStorage.removeItem("rutinaEnCurso");
}

// --- lógica específica según la página ---

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname || "";

    if (path.includes("/rutinas")) {
        inicializarPaginaRutinas();
    } else if (path.includes("/principal_home")) {
        inicializarPaginaHome();
    }
});

// ====== RUTINAS: click en "Empezar Rutina" ======

function inicializarPaginaRutinas() {
    const botones = document.querySelectorAll(".btn-start-rutina");
    if (!botones || botones.length === 0) return;

    botones.forEach(btn => {
        btn.addEventListener("click", () => {
            const id          = btn.dataset.id;
            const nombre      = btn.dataset.nombre || "";
            const ejercicios  = parseInt(btn.dataset.ejercicios || "0", 10);

            // Guardamos en sessionStorage
            setRutinaEnCurso({
                id: id,
                nombre: nombre,
                numeroEjercicios: ejercicios
            });

            // Redirigimos a principal_home indicando que abra el modal
            window.location.href = "/principal_home?openRutina=1";
        });
    });
}

// ====== HOME: mostrar tarjeta y modal si hay rutina en curso ======

async function inicializarPaginaHome() {
    const info = getRutinaEnCurso();
    const card = document.getElementById("cardRutinaEnCurso");
    const nombreSpan = document.getElementById("nombreRutinaEnCurso");
    const progresoSpan = document.getElementById("progresoRutinaEnCurso");
    const btnContinuar = document.getElementById("btnContinuarRutina");

    // Si no hay info o no está la tarjeta, no hacemos nada
    if (!info || !card) {
        // Ocultamos por si acaso
        if (card) card.classList.add("hidden");
        return;
    }

    // Rellenamos la tarjeta con datos básicos
    card.classList.remove("hidden");
    if (nombreSpan) {
        nombreSpan.textContent = info.nombre || "Rutina en curso";
    }
    if (progresoSpan) {
        // de momento, sin progreso real: 0 de X
        const n = info.numeroEjercicios || 0;
        progresoSpan.textContent = `0 de ${n} ejercicios completados`;
    }

    // Botón "Continuar" abre el modal y carga los detalles
    if (btnContinuar) {
        btnContinuar.addEventListener("click", () => {
            abrirModalRutinaEnCurso(info.id);
        });
    }

    // Si venimos de /rutinas con ?openRutina=1, abrimos modal automáticamente
    const params = new URLSearchParams(window.location.search);
    if (params.get("openRutina") === "1") {
        abrirModalRutinaEnCurso(info.id);
    }
}

// ====== Modal "Rutina en Curso" en HOME ======

// Ajusta estos IDs/clases a tu HTML real de principal_home
const MODAL_RUTINA_ID         = "modalRutinaEnCurso";
const MODAL_CLOSE_BTN_ID      = "cerrarModalRutinaEnCurso";
const MODAL_LISTA_EJ_ID       = "listaEjerciciosRutinaEnCurso";
const MODAL_TITULO_ID         = "tituloRutinaEnCurso";
const MODAL_TOTAL_EJ_ID       = "totalEjerciciosRutinaEnCurso";
const MODAL_BTN_FINALIZAR_ID  = "btnFinalizarRutinaEnCurso";

function openModalRutina() {
    const modal = document.getElementById(MODAL_RUTINA_ID);
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
}

function closeModalRutina() {
    const modal = document.getElementById(MODAL_RUTINA_ID);
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

async function abrirModalRutinaEnCurso(rutinaId) {
    if (!rutinaId) return;

    const lista = document.getElementById(MODAL_LISTA_EJ_ID);
    const titulo = document.getElementById(MODAL_TITULO_ID);
    const totalEjSpan = document.getElementById(MODAL_TOTAL_EJ_ID);

    if (lista) {
        lista.innerHTML = "Cargando ejercicios...";
    }

    try {
        // Reutilizamos el mismo endpoint que usas en editar: GET /api/rutinas/{id}
        const resp = await fetch(`/api/rutinas/${rutinaId}`);
        if (!resp.ok) {
            console.error("Error al cargar rutina en curso:", resp.status);
            if (lista) lista.innerHTML = "No se pudo cargar la rutina.";
            return;
        }

        const data = await resp.json();
        const ejercicios = data.ejercicios || [];

        if (titulo) {
            titulo.textContent = data.nombre || "Rutina en Curso";
        }
        if (totalEjSpan) {
            totalEjSpan.textContent = `${ejercicios.length} ejercicios`;
        }

        if (lista) {
            lista.innerHTML = "";
            ejercicios.forEach((ej, idx) => {
                const item = document.createElement("div");
                item.className = "ej-item-en-curso";

                const imagenBg = ej.url
                    ? `background-image:url('${ej.url}')`
                    : "";

                item.innerHTML = `
                  <div class="ej-curso-left">
                    <div class="ej-curso-img" style="${imagenBg};
                                background-size:cover;
                                background-position:center;"></div>
                    <div>
                      <div class="ej-curso-nombre">${ej.nombre}</div>
                      <div class="ej-curso-meta">
                        Ejercicio ${idx + 1} • ${ej.tipoEjercicio || ""}
                      </div>
                    </div>
                  </div>
                  <div class="ej-curso-actions">
                    <!-- Aquí más adelante puedes poner check de completado, etc. -->
                  </div>
                `;
                lista.appendChild(item);
            });
        }

        // Abrimos el modal ya con la data
        openModalRutina();

        // Botones de cerrar / finalizar
        const btnCerrar = document.getElementById(MODAL_CLOSE_BTN_ID);
        if (btnCerrar) {
            btnCerrar.onclick = closeModalRutina;
        }

        const btnFinalizar = document.getElementById(MODAL_BTN_FINALIZAR_ID);
        if (btnFinalizar) {
            btnFinalizar.onclick = () => {
                // Por ahora: simplemente limpiar el estado en curso
                clearRutinaEnCurso();
                closeModalRutina();

                // Ocultamos la tarjeta de "Rutina en curso"
                const card = document.getElementById("cardRutinaEnCurso");
                if (card) card.classList.add("hidden");
            };
        }

    } catch (err) {
        console.error("Error de red al cargar rutina en curso:", err);
        if (lista) lista.innerHTML = "Error de conexión al cargar la rutina.";
    }
}
