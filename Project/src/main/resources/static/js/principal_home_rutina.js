// js/principal_home_rutina.js

document.addEventListener("DOMContentLoaded", () => {
    const cardRutina = document.getElementById("cardRutinaEnCurso");
    const nombreCard = document.getElementById("rutinaEnCursoNombre");
    const progresoCard = document.getElementById("rutinaEnCursoProgreso");
    const btnContinuar = document.getElementById("btnContinuarRutina");

    const modal = document.getElementById("modalRutinaEnCurso");
    const cerrarModalBtn = document.getElementById("cerrarModalRutina");
    const btnCerrarRutina = document.getElementById("btnCerrarRutina");
    const btnEmpezarDesdeModal = document.getElementById("btnEmpezarDesdeModal");

    const modalTitulo = document.getElementById("modalRutinaTitulo");
    const modalSubtitulo = document.getElementById("modalRutinaSubtitulo");
    const listaEjerciciosModal = document.getElementById("listaEjerciciosRutinaModal");

    // ---------- 1) Leer rutina en curso desde sessionStorage ----------
    const raw = sessionStorage.getItem("rutinaEnCurso");
    if (!raw) {
        // No hay rutina en curso -> ocultamos la card y salimos
        if (cardRutina) cardRutina.style.display = "none";
        return;
    }

    let rutinaEnCurso;
    try {
        rutinaEnCurso = JSON.parse(raw);
    } catch (err) {
        console.error("Error parseando rutinaEnCurso:", err);
        sessionStorage.removeItem("rutinaEnCurso");
        if (cardRutina) cardRutina.style.display = "none";
        return;
    }

    if (!rutinaEnCurso || !rutinaEnCurso.id) {
        if (cardRutina) cardRutina.style.display = "none";
        return;
    }

    // ❗ NUEVO: leer si debemos abrir el modal automáticamente
    const debeAbrirModal =
        sessionStorage.getItem("rutinaEnCurso_abrirModal") === "1";

    // ---------- 2) Mostrar card con info básica ----------
    if (cardRutina) {
        cardRutina.style.display = "block";
    }
    if (nombreCard) {
        nombreCard.textContent = rutinaEnCurso.nombre || "Rutina en curso";
    }
    if (progresoCard) {
        const total = rutinaEnCurso.numeroEjercicios || 0;
        const completados = rutinaEnCurso.ejerciciosCompletados || 0;
        progresoCard.textContent =
            `${completados} de ${total} ejercicios completados`;
    }

    // ---------- 3) Manejo de modal ----------
    let detalleCargado = false;

    function abrirModalRutina() {
        if (!modal) return;

        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (!detalleCargado) {
            cargarDetalleRutinaEnCurso();
        }
    }

    function cerrarModalRutina() {
        if (!modal) return;
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    }

    if (btnContinuar) {
        btnContinuar.addEventListener("click", (e) => {
            e.preventDefault();
            abrirModalRutina();
        });
    }
    if (cerrarModalBtn) cerrarModalBtn.addEventListener("click", cerrarModalRutina);
    if (btnCerrarRutina) btnCerrarRutina.addEventListener("click", cerrarModalRutina);
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) cerrarModalRutina();
        });
    }

    if (btnEmpezarDesdeModal) {
        btnEmpezarDesdeModal.addEventListener("click", () => {
            console.log("Aquí iría la lógica de cronómetro / marcar completados.");
        });
    }

    // ---------- 4) Cargar detalles de la rutina desde /api/rutinas/{id} ----------
    async function cargarDetalleRutinaEnCurso() {
        try {
            const resp = await fetch(`/api/rutinas/${rutinaEnCurso.id}`);
            if (!resp.ok) {
                console.error("Error al cargar detalle de rutina en curso:", resp.status);
                return;
            }

            const data = await resp.json();
            pintarModalConDetalle(data);
            detalleCargado = true;

        } catch (err) {
            console.error("Error de red al cargar rutina en curso:", err);
        }
    }

    function pintarModalConDetalle(data) {
        const nombre = data.nombre || "Rutina en curso";
        const ejercicios = data.ejercicios || [];
        const total = ejercicios.length;

        if (modalTitulo) modalTitulo.textContent = nombre;
        if (modalSubtitulo) modalSubtitulo.textContent = `0 de ${total} ejercicios`;

        if (!listaEjerciciosModal) return;

        listaEjerciciosModal.innerHTML = "";

        if (total === 0) {
            listaEjerciciosModal.innerHTML =
                `<p class="text-muted-foreground">Esta rutina no tiene ejercicios.</p>`;
            return;
        }

        ejercicios.forEach((ej, index) => {
            const card = document.createElement("div");
            card.className = "ejercicio-card";

            const imagenBg = ej.url
                ? `background-image:url('${ej.url}');`
                : "";

            card.innerHTML = `
          <div class="ejercicio-header">
            <div class="ejercicio-header-main">
              <div class="ejercicio-run-img"
                   style="${imagenBg} background-size:cover; background-position:center;"></div>
              <div>
                <p class="ejercicio-nombre">${ej.nombre}</p>
                <p class="ejercicio-musculo">${ej.tipoEjercicio || ""}</p>
              </div>
            </div>
            <span class="badge badge-ejercicio">
              Ejercicio ${index + 1} / ${total}
            </span>
          </div>

          <div class="series-container" data-ejercicio-id="${ej.id || index}">
            <!-- Aquí se insertan las filas de series -->
          </div>

          <button type="button" class="btn btn-outline btn-agregar-serie">
            + Agregar serie
          </button>
        `;

            const seriesContainer = card.querySelector(".series-container");

            // Helper para crear una fila de serie
            function crearFilaSerie(num) {
                const row = document.createElement("div");
                row.className = "serie-row";
                row.innerHTML = `
              <div class="serie-num">${num}</div>
              <div class="serie-inputs">
                <label>
                  Repeticiones
                  <input type="number" min="1" value="12" class="serie-input serie-reps">
                </label>
                <label>
                  Peso (kg)
                  <input type="number" min="0" step="0.5" value="0" class="serie-input serie-peso">
                </label>
              </div>
              <button type="button" class="btn btn-ghost btn-borrar-serie" title="Eliminar serie">
                🗑
              </button>
            `;
                return row;
            }

            // Creamos 3 series por defecto (solo UI por ahora)
            for (let i = 1; i <= 3; i++) {
                seriesContainer.appendChild(crearFilaSerie(i));
            }

            // Botón "Agregar serie"
            const btnAgregarSerie = card.querySelector(".btn-agregar-serie");
            btnAgregarSerie.addEventListener("click", () => {
                const numActual = seriesContainer.querySelectorAll(".serie-row").length;
                seriesContainer.appendChild(crearFilaSerie(numActual + 1));
            });

            // Eliminar series (event delegation)
            seriesContainer.addEventListener("click", (ev) => {
                const btn = ev.target.closest(".btn-borrar-serie");
                if (!btn) return;

                const row = btn.closest(".serie-row");
                if (row) {
                    row.remove();
                    // Re-enumerar las series
                    seriesContainer.querySelectorAll(".serie-row").forEach((r, idx) => {
                        const num = r.querySelector(".serie-num");
                        if (num) num.textContent = idx + 1;
                    });
                }
            });

            listaEjerciciosModal.appendChild(card);
        });
    }

    if (debeAbrirModal) {
        abrirModalRutina();
        sessionStorage.removeItem("rutinaEnCurso_abrirModal");
    }
});
