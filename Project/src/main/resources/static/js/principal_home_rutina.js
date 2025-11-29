document.addEventListener("DOMContentLoaded", () => {
    /* ==============================
       1. REFERENCIAS DOM Y ESTADO
       ============================== */
    const cardRutina           = document.getElementById("cardRutinaEnCurso");
    const nombreCard           = document.getElementById("rutinaEnCursoNombre");
    const progresoCard         = document.getElementById("rutinaEnCursoProgreso");
    const btnContinuar         = document.getElementById("btnContinuarRutina");

    const modal                = document.getElementById("modalRutinaEnCurso");
    const cerrarModalBtn       = document.getElementById("cerrarModalRutina");
    const btnCerrarRutina      = document.getElementById("btnCerrarRutina");
    const btnFinalizarModal    = document.getElementById("btnEmpezarDesdeModal"); // ahora Finalizar

    const modalTitulo          = document.getElementById("modalRutinaTitulo");
    const modalSubtitulo       = document.getElementById("modalRutinaSubtitulo");
    const listaEjerciciosModal = document.getElementById("listaEjerciciosRutinaModal");

    const tiempoTotalSpan      = document.getElementById("rutinaTiempoTotal");
    const btnToggleTimer       = document.getElementById("btnToggleTimerRutina");

    const DEFAULT_REST_SECONDS = 90;

    let rutinaTimerInterval = null;
    let rutinaEstado        = null;
    let detalleCargado      = false;

    if (btnFinalizarModal) {
        btnFinalizarModal.textContent = "Finalizar Rutina";
    }

    /* ==============================
       2. HELPERS GENERALES
       ============================== */
    function formatearSegundosCorto(seg) {
        const total = Math.max(0, Math.floor(seg || 0));
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;

        const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
        const ss = String(s).padStart(2, "0");

        if (h > 0) return `${h}:${mm}:${ss}`;
        return `${m}:${ss}`;
    }

    function showToast(titulo, mensaje) {
        let contenedor = document.querySelector(".toast-container");
        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.className = "toast-container";
            document.body.appendChild(contenedor);
        }

        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerHTML = `
            <div class="toast-icon">⏱</div>
            <div>
              <p class="toast-title">${titulo}</p>
              <p class="toast-message">${mensaje}</p>
            </div>
        `;

        contenedor.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 200);
        }, 3500);
    }

    function obtenerSegundosTranscurridos(rut) {
        if (!rut) return 0;
        const base = Number(rut.elapsedWhilePaused || 0);
        if (rut.isPaused || !rut.startedAt) return base;

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

        actualizarTiempoTotalUI();

        if (rutinaEstado.isPaused) {
            if (rutinaTimerInterval) {
                clearInterval(rutinaTimerInterval);
                rutinaTimerInterval = null;
            }
            return;
        }

        if (rutinaTimerInterval) clearInterval(rutinaTimerInterval);
        rutinaTimerInterval = setInterval(actualizarTiempoTotalUI, 1000);
    }

    function detenerTimerTotal() {
        if (rutinaTimerInterval) {
            clearInterval(rutinaTimerInterval);
            rutinaTimerInterval = null;
        }
    }

    function aplicarEstadoPausaUI() {
        if (!modal || !rutinaEstado) return;
        const paused = !!rutinaEstado.isPaused;

        const selectores = [
            "input.serie-input",
            ".btn-check-serie",
            ".btn-borrar-serie",
            ".btn-agregar-serie",
            ".rest-timer",
            ".rest-editor-input",
            ".rest-editor-btn"
        ];

        const elementos = modal.querySelectorAll(selectores.join(","));
        elementos.forEach(el => {
            if (el.tagName === "INPUT") {
                el.disabled = paused;
            } else {
                if (paused) {
                    el.classList.add("is-paused-disabled");
                    el.setAttribute("aria-disabled", "true");
                } else {
                    el.classList.remove("is-paused-disabled");
                    el.removeAttribute("aria-disabled");
                }
            }
        });
    }

    function recalcularYActualizarProgreso() {
        if (!listaEjerciciosModal || !rutinaEstado) return;

        const cards = listaEjerciciosModal.querySelectorAll(".ejercicio-card");
        let completados = 0;

        cards.forEach(card => {
            const filas = card.querySelectorAll(".serie-row");
            if (!filas.length) return;

            const hayIncompletas = Array.from(filas).some(
                row => !row.classList.contains("serie-completada")
            );
            if (!hayIncompletas) completados++;
        });

        rutinaEstado.ejerciciosCompletados = completados;

        try {
            sessionStorage.setItem("rutinaEnCurso", JSON.stringify(rutinaEstado));
        } catch (e) {
            console.error("Error guardando progreso de rutinaEnCurso", e);
        }

        const total = rutinaEstado.numeroEjercicios || cards.length;

        if (progresoCard) {
            progresoCard.textContent = `${completados} de ${total} ejercicios completados`;
        }
        if (modalSubtitulo) {
            modalSubtitulo.textContent = `${completados} de ${total} ejercicios`;
        }
    }

    function iniciarDescansoEjercicio(card, segundosIniciales) {
        if (!card) return;

        const bloque = card.querySelector(".rest-countdown");
        if (!bloque) return;

        bloque.innerHTML = `
            <span class="rest-countdown-prefix">Descanso:</span>
            <span class="rest-countdown-label"></span>
            <button type="button" class="rest-skip-btn">Omitir</button>
        `;

        const label  = bloque.querySelector(".rest-countdown-label");
        const btnSkip = bloque.querySelector(".rest-skip-btn");
        if (!label || !btnSkip) return;

        if (card._restTimerId) {
            clearInterval(card._restTimerId);
            card._restTimerId = null;
        }

        let restantes = Number.isFinite(segundosIniciales)
            ? segundosIniciales
            : DEFAULT_REST_SECONDS;

        label.textContent = formatearSegundosCorto(restantes);
        bloque.classList.remove("hidden");

        card._restTimerId = setInterval(() => {
            if (!rutinaEstado || rutinaEstado.isPaused) return;

            restantes -= 1;

            if (restantes <= 0) {
                clearInterval(card._restTimerId);
                card._restTimerId = null;
                bloque.classList.add("hidden");
                showToast("Descanso terminado", "Continúa con el siguiente ejercicio.");
            } else {
                label.textContent = formatearSegundosCorto(restantes);
            }
        }, 1000);

        btnSkip.onclick = () => {
            if (card._restTimerId) {
                clearInterval(card._restTimerId);
                card._restTimerId = null;
            }
            bloque.classList.add("hidden");
        };
    }

    function recolectarSetsCompletados() {
        const sets = [];
        if (!listaEjerciciosModal) return sets;

        const cards = listaEjerciciosModal.querySelectorAll(".ejercicio-card");

        cards.forEach(card => {
            const container = card.querySelector(".series-container");
            if (!container) return;

            const ejercicioId = container.dataset.ejercicioId;
            if (!ejercicioId) return;

            const filas = container.querySelectorAll(".serie-row.serie-completada");
            filas.forEach(row => {
                const repsInput = row.querySelector(".serie-reps");
                const pesoInput = row.querySelector(".serie-peso");

                const reps = parseInt(repsInput?.value, 10) || 1;
                const peso = parseFloat(pesoInput?.value) || 0;

                sets.push({
                    ejercicioId: Number(ejercicioId),
                    peso: peso,
                    repeticiones: reps
                });
            });
        });

        return sets;
    }

    /* ==============================
       3. CARGA INICIAL DESDE SESSION
       ============================== */
    const raw = sessionStorage.getItem("rutinaEnCurso");
    if (!raw) {
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

    const debeAbrirModal =
        sessionStorage.getItem("rutinaEnCurso_abrirModal") === "1";

    if (cardRutina) cardRutina.style.display = "block";
    if (nombreCard) nombreCard.textContent = rutinaEnCurso.nombre || "Rutina en curso";

    if (progresoCard) {
        const total       = rutinaEnCurso.numeroEjercicios || 0;
        const completados = rutinaEnCurso.ejerciciosCompletados || 0;
        progresoCard.textContent = `${completados} de ${total} ejercicios completados`;
    }

    iniciarTimerTotalSiCorresponde();

    /* ==============================
       4. MODAL: ABRIR / CERRAR
       ============================== */
    function abrirModalRutina() {
        if (!modal) return;

        modal.classList.remove("hidden");
        modal.setAttribute("aria-hidden", "false");
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (!detalleCargado) {
            cargarDetalleRutinaEnCurso();
        } else {
            aplicarEstadoPausaUI();
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

    /* ==============================
       5. BOTÓN PAUSA / REANUDAR
       ============================== */
    if (btnToggleTimer) {
        btnToggleTimer.addEventListener("click", () => {
            if (!rutinaEstado) return;

            if (rutinaEstado.isPaused) {
                rutinaEstado.startedAt = Date.now();
                rutinaEstado.isPaused = false;

                try {
                    sessionStorage.setItem("rutinaEnCurso", JSON.stringify(rutinaEstado));
                } catch (e) {
                    console.error("Error actualizando rutinaEnCurso al reanudar", e);
                }

                btnToggleTimer.textContent = "▌▌";
                iniciarTimerTotalSiCorresponde();
            } else {
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
                btnToggleTimer.textContent = "▶";
            }

            aplicarEstadoPausaUI();
        });

        if (rutinaEstado?.isPaused) {
            btnToggleTimer.textContent = "▶";
        } else {
            btnToggleTimer.textContent = "▌▌";
        }
    }

    /* ==============================
       6. CARGAR DETALLE DESDE API
       ============================== */
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

    /* ==============================
       7. PINTAR MODAL CON DETALLE
       ============================== */
    function pintarModalConDetalle(data) {
        const nombre     = data.nombre || "Rutina en curso";
        const ejercicios = data.ejercicios || [];
        const total      = ejercicios.length;

        if (modalTitulo)     modalTitulo.textContent = nombre;
        if (modalSubtitulo)  modalSubtitulo.textContent = `0 de ${total} ejercicios`;
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

            const imagenBg        = ej.url ? `background-image:url('${ej.url}');` : "";
            const descansoInicial = DEFAULT_REST_SECONDS;

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
                  <button type="button"
                          class="rest-timer"
                          data-index="${index}"
                          data-seconds="${descansoInicial}">
                    <span class="rest-timer-icon">⏱</span>
                    <span class="rest-timer-label">
                      ${formatearSegundosCorto(descansoInicial)}
                    </span>
                  </button>

                  <div class="rest-editor hidden">
                    <input type="number"
                           min="0"
                           step="5"
                           class="rest-editor-input"
                           value="${descansoInicial}">
                    <button type="button" class="rest-editor-btn">✓</button>
                  </div>

                  <span class="badge badge-ejercicio">
                    Ejercicio ${index + 1} / ${total}
                  </span>
                </div>
              </div>

              <div class="rest-countdown hidden"></div>

              <div class="series-container" data-ejercicio-id="${ej.id || index}"></div>

              <button type="button" class="btn btn-outline btn-agregar-serie">
                + Agregar serie
              </button>
            `;

            const seriesContainer = card.querySelector(".series-container");
            if (!seriesContainer) {
                listaEjerciciosModal.appendChild(card);
                return;
            }

            function crearFilaSerie(num) {
                const row = document.createElement("div");
                row.className = "serie-row";

                row.innerHTML = `
                  <div class="serie-num">${num}</div>
                  <div class="serie-inputs">
                    <label>
                      Repeticiones
                      <input
                        type="number"
                        min="1"
                        value="12"
                        class="serie-input serie-reps">
                    </label>
                    <label>
                      Peso (kg)
                      <input
                        type="number"
                        min="1"
                        step="0.5"
                        value="1"
                        class="serie-input serie-peso">
                    </label>
                  </div>
                  <div class="serie-actions">
                    <button type="button"
                            class="btn btn-check-serie"
                            title="Marcar serie como completada">
                      ✓
                    </button>
                    <button type="button"
                            class="btn btn-ghost btn-borrar-serie"
                            title="Eliminar serie">
                      🗑
                    </button>
                  </div>
                `;

                const repsInput = row.querySelector(".serie-reps");
                const pesoInput = row.querySelector(".serie-peso");

                [repsInput, pesoInput].forEach((input) => {
                    if (!input) return;
                    input.addEventListener("blur", () => {
                        const min = Number(input.getAttribute("min")) || 1;
                        let v = parseFloat(input.value);
                        if (!Number.isFinite(v) || v < min) {
                            input.value = String(min);
                        }
                    });
                });

                return row;
            }

            for (let i = 1; i <= 3; i++) {
                seriesContainer.appendChild(crearFilaSerie(i));
            }

            const btnAgregarSerie = card.querySelector(".btn-agregar-serie");
            if (btnAgregarSerie) {
                btnAgregarSerie.addEventListener("click", () => {
                    if (rutinaEstado?.isPaused) return;
                    const numActual = seriesContainer.querySelectorAll(".serie-row").length;
                    seriesContainer.appendChild(crearFilaSerie(numActual + 1));
                    recalcularYActualizarProgreso();
                });
            }

            const restBtn    = card.querySelector(".rest-timer");
            const restEditor = card.querySelector(".rest-editor");
            const restInput  = restEditor?.querySelector(".rest-editor-input");
            const restOk     = restEditor?.querySelector(".rest-editor-btn");
            const restLabel  = card.querySelector(".rest-timer-label");

            if (restBtn && restEditor && restInput && restOk && restLabel) {
                restBtn.addEventListener("click", () => {
                    if (rutinaEstado?.isPaused) return;
                    restEditor.classList.toggle("hidden");
                    if (!restEditor.classList.contains("hidden")) {
                        restInput.focus();
                        restInput.select();
                    }
                });

                restOk.addEventListener("click", () => {
                    if (rutinaEstado?.isPaused) return;

                    const val      = parseInt(restInput.value, 10);
                    const segundos = Number.isFinite(val) && val >= 0
                        ? val
                        : DEFAULT_REST_SECONDS;

                    restBtn.dataset.seconds = segundos;
                    restLabel.textContent   = formatearSegundosCorto(segundos);
                    restEditor.classList.add("hidden");
                });
            }

            seriesContainer.addEventListener("click", (ev) => {
                if (rutinaEstado?.isPaused) return;

                const btnDelete = ev.target.closest(".btn-borrar-serie");
                if (btnDelete) {
                    const row = btnDelete.closest(".serie-row");
                    if (row) {
                        row.remove();
                        seriesContainer.querySelectorAll(".serie-row").forEach((r, idx) => {
                            const num = r.querySelector(".serie-num");
                            if (num) num.textContent = idx + 1;
                        });
                        recalcularYActualizarProgreso();
                    }
                    return;
                }

                const btnCheck = ev.target.closest(".btn-check-serie");
                if (btnCheck) {
                    const row = btnCheck.closest(".serie-row");
                    if (!row) return;

                    const inputs     = row.querySelectorAll(".serie-input");
                    const yaCompleta = row.classList.contains("serie-completada");

                    if (yaCompleta) {
                        row.classList.remove("serie-completada");
                        btnCheck.classList.remove("btn-check-serie-active");
                        inputs.forEach(inp => inp.disabled = false);
                    } else {
                        row.classList.add("serie-completada");
                        btnCheck.classList.add("btn-check-serie-active");
                        inputs.forEach(inp => inp.disabled = true);

                        const segundosDescanso =
                            parseInt(restBtn?.dataset.seconds, 10) || DEFAULT_REST_SECONDS;
                        iniciarDescansoEjercicio(card, segundosDescanso);
                    }

                    recalcularYActualizarProgreso();
                }
            });

            listaEjerciciosModal.appendChild(card);
        });

        aplicarEstadoPausaUI();
        recalcularYActualizarProgreso();
    }

    /* ==============================
       8. ABRIR MODAL AUTOMÁTICO
       ============================== */
    if (debeAbrirModal) {
        abrirModalRutina();
        sessionStorage.removeItem("rutinaEnCurso_abrirModal");
    }

    // ==== Finalizar rutina: enviar payload al backend ====
    if (btnFinalizarModal) {
        btnFinalizarModal.addEventListener("click", async () => {
            if (!rutinaEstado || !rutinaEstado.id) {
                showToast("Error", "No hay rutina en curso para guardar.");
                return;
            }
            if (!listaEjerciciosModal) {
                showToast("Error", "No se pudo leer el detalle de la rutina.");
                return;
            }

            // 1) Tiempo total en segundos (forzando mínimo 1)
            let segundos = obtenerSegundosTranscurridos(rutinaEstado);
            if (!Number.isFinite(segundos)) {
                segundos = 0;
            }
            const tiempoSegundos = Math.max(1, Math.round(segundos));

            // 2) Construir lista de sets
            const sets = [];
            const cards = listaEjerciciosModal.querySelectorAll(".ejercicio-card");

            cards.forEach((card) => {
                const seriesContainer = card.querySelector(".series-container");
                if (!seriesContainer) return;

                const ejercicioIdAttr = seriesContainer.getAttribute("data-ejercicio-id");
                if (!ejercicioIdAttr) return;

                const ejercicioId = Number(ejercicioIdAttr);
                if (!Number.isFinite(ejercicioId)) return;

                const filas = seriesContainer.querySelectorAll(".serie-row");

                filas.forEach((row) => {
                    const repsInput = row.querySelector(".serie-reps");
                    const pesoInput = row.querySelector(".serie-peso");
                    if (!repsInput || !pesoInput) return;

                    let repeticiones = parseInt(repsInput.value, 10);
                    if (!Number.isFinite(repeticiones) || repeticiones <= 0) {
                        repeticiones = 1;
                    }

                    let peso = parseFloat(pesoInput.value);
                    if (!Number.isFinite(peso) || peso <= 0) {
                        peso = 1;
                    }

                    sets.push({
                        ejercicioId,
                        repeticiones,
                        peso
                    });
                });
            });

            if (sets.length === 0) {
                showToast("Error", "Debes tener al menos una serie para guardar la rutina.");
                return;
            }

            // El DTO en backend: Long tiempo; List<SetEjercicioDTO> sets;
            const payload = {
                tiempo: tiempoSegundos,
                sets: sets
            };

            console.log("Payload que se envía al backend:", payload);

            try {
                const resp = await fetch(`/api/rutinas/${rutinaEstado.id}/finalizar`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                if (!resp.ok) {
                    const text = await resp.text();
                    console.error("Error al registrar ejecución:", resp.status, text);
                    showToast("Error", "No se pudo guardar la rutina. Intenta de nuevo.");
                    return;
                }

                showToast("Rutina guardada", "Se registró tu entrenamiento correctamente.");

                // Limpiar estado local
                sessionStorage.removeItem("rutinaEnCurso");

                setTimeout(() => {
                    window.location.href = "principal_home";
                }, 800);

            } catch (e) {
                console.error("Error de red al registrar ejecución:", e);
                showToast("Error", "Ocurrió un problema de conexión.");
            }
        });
    }
});

