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

    // Cronómetro principal
    const tiempoTotalSpan = document.getElementById("rutinaTiempoTotal");
    const btnToggleTimer = document.getElementById("btnToggleTimerRutina");
    let rutinaTimerInterval = null;
    let rutinaEstado = null; // copia en memoria del objeto de sessionStorage

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

    rutinaEstado = rutinaEnCurso;

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

    // ==== Helpers de tiempo total de rutina ====

    function formatearSegundosCorto(seg) {
        const total = Math.max(0, Math.floor(seg || 0));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;

        const mm = (h > 0 ? String(m).padStart(2, "0") : String(m));
        const ss = String(s).padStart(2, "0");

        if (h > 0) {
            return `${h}:${mm}:${ss}`;
        }
        return `${m}:${ss}`;
    }

    function obtenerSegundosTranscurridos(rut) {
        if (!rut) return 0;
        const base = Number(rut.elapsedWhilePaused || 0);
        if (rut.isPaused || !rut.startedAt) {
            return base;
        }
        const diff = (Date.now() - Number(rut.startedAt)) / 1000;
        return base + Math.max(0, diff);
    }

    function actualizarTiempoTotalUI() {
        if (!tiempoTotalSpan || !rutinaEstado) return;
        const seg = obtenerSegundosTranscurridos(rutinaEstado);
        tiempoTotalSpan.textContent = formatearSegundosCorto(seg);
    }

    function iniciarTimerTotalSiCorresponde() {
        if (!rutinaEstado) return;

        // Siempre refrescamos una vez
        actualizarTiempoTotalUI();

        // Si está pausado, solo mostramos el valor acumulado
        if (rutinaEstado.isPaused) {
            if (rutinaTimerInterval) {
                clearInterval(rutinaTimerInterval);
                rutinaTimerInterval = null;
            }
            return;
        }

        // Si está corriendo, lanzamos intervalo de 1s
        if (rutinaTimerInterval) clearInterval(rutinaTimerInterval);
        rutinaTimerInterval = setInterval(() => {
            actualizarTiempoTotalUI();
        }, 1000);
    }

    function detenerTimerTotal() {
        if (rutinaTimerInterval) {
            clearInterval(rutinaTimerInterval);
            rutinaTimerInterval = null;
        }
    }

    // Inicializamos cronómetro al cargar la página
    iniciarTimerTotalSiCorresponde();

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

    // Botón de Pausar / Reanudar cronómetro
    if (btnToggleTimer) {
        btnToggleTimer.addEventListener("click", () => {
            if (!rutinaEstado) return;

            if (rutinaEstado.isPaused) {
                // Reanudar
                rutinaEstado.startedAt = Date.now();
                rutinaEstado.isPaused = false;
                try {
                    sessionStorage.setItem("rutinaEnCurso", JSON.stringify(rutinaEstado));
                } catch (e) {
                    console.error("Error actualizando rutinaEnCurso al reanudar", e);
                }
                btnToggleTimer.textContent = "▌▌"; // icono de pausa
                iniciarTimerTotalSiCorresponde();
            } else {
                // Pausar
                const total = obtenerSegundosTranscurridos(rutinaEstado);
                rutinaEstado.elapsedWhilePaused = total;
                rutinaEstado.isPaused = true;
                rutinaEstado.startedAt = null;

                try {
                    sessionStorage.setItem("rutinaEnCurso", JSON.stringify(rutinaEstado));
                } catch (e) {
                    console.error("Error actualizando rutinaEnCurso al pausar", e);
                }

                detenerTimerTotal();
                actualizarTiempoTotalUI();
                btnToggleTimer.textContent = "▶"; // icono de play
            }
        });

        // Estado inicial del botón según lo que venga de sessionStorage
        if (rutinaEstado?.isPaused) {
            btnToggleTimer.textContent = "▶";
        } else {
            btnToggleTimer.textContent = "▌▌";
        }
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

        // Descanso por defecto (90 s si no hay nada en rutinaEstado)
        const defaultRest = Number(rutinaEstado?.defaultRestSeconds || 90);

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

            <div class="ejercicio-header-right">
              <!-- Badge de descanso (editable) -->
              <button type="button"
                      class="rest-timer"
                      data-index="${index}">
                <span class="rest-timer-icon">⏱</span>
                <span class="rest-timer-label">
                  ${formatearSegundosCorto(defaultRest)}
                </span>
              </button>

              <!-- Badge de número de ejercicio -->
              <span class="badge badge-ejercicio">
                Ejercicio ${index + 1} / ${total}
              </span>

              <!-- Editor pequeño para cambiar el descanso -->
              <div class="rest-editor hidden">
                <input type="number"
                       min="0"
                       step="5"
                       class="rest-editor-input"
                       value="${defaultRest}">
                <button type="button" class="rest-editor-btn">✓</button>
              </div>
            </div>
          </div>

          <div class="series-container" data-ejercicio-id="${ej.id || index}">
            <!-- Aquí se insertan las filas de series -->
          </div>

          <button type="button" class="btn btn-outline btn-agregar-serie">
            + Agregar serie
          </button>
        `;

            const seriesContainer = card.querySelector(".series-container");
            if (!seriesContainer) {
                listaEjerciciosModal.appendChild(card);
                return;
            }

            // ==== Series (filas con repeticiones y peso) ====

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

            // 3 series por defecto
            for (let i = 1; i <= 3; i++) {
                seriesContainer.appendChild(crearFilaSerie(i));
            }

            // Botón "Agregar serie"
            const btnAgregarSerie = card.querySelector(".btn-agregar-serie");
            if (btnAgregarSerie) {
                btnAgregarSerie.addEventListener("click", () => {
                    const numActual = seriesContainer.querySelectorAll(".serie-row").length;
                    seriesContainer.appendChild(crearFilaSerie(numActual + 1));
                });
            }

            // Eliminar series (delegación de eventos)
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

            // ==== Descanso por ejercicio (badge + mini editor) ====
            const restBtn    = card.querySelector(".rest-timer");
            const restEditor = card.querySelector(".rest-editor");
            const restInput  = restEditor?.querySelector(".rest-editor-input");
            const restOk     = restEditor?.querySelector(".rest-editor-btn");
            const restLabel  = card.querySelector(".rest-timer-label");

            if (restBtn && restEditor && restInput && restOk && restLabel) {
                // Mostrar / ocultar popover
                restBtn.addEventListener("click", () => {
                    restEditor.classList.toggle("hidden");
                    if (!restEditor.classList.contains("hidden")) {
                        restInput.focus();
                        restInput.select();
                    }
                });

                // Guardar nuevo valor
                restOk.addEventListener("click", () => {
                    const valor = parseInt(restInput.value, 10);
                    const segundos = Number.isFinite(valor) && valor >= 0 ? valor : defaultRest;
                    restLabel.textContent = formatearSegundosCorto(segundos);
                    restEditor.classList.add("hidden");
                    // Nota: este valor es solo visual, no lo enviamos al backend
                });
            }

            listaEjerciciosModal.appendChild(card);
        });
    }

    if (debeAbrirModal) {
        abrirModalRutina();
        sessionStorage.removeItem("rutinaEnCurso_abrirModal");
    }
});
