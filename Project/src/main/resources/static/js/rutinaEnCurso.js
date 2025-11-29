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

    // ---------- 2) Mostrar card con info básica ----------
    if (cardRutina) {
        cardRutina.style.display = "block";
    }
    if (nombreCard) {
        nombreCard.textContent = rutinaEnCurso.nombre || "Rutina en curso";
    }
    if (progresoCard) {
        const total = rutinaEnCurso.numeroEjercicios || 0;
        // Progreso real lo manejaremos luego; por ahora 0/x
        progresoCard.textContent = `0 de ${total} ejercicios completados`;
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

    // Aquí, por ahora, solo hacemos console.log cuando se pulsa “Empezar”
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
            const item = document.createElement("div");
            item.className = "ejercicio-run-item";

            const imagenBg = ej.url
                ? `background-image:url('${ej.url}');`
                : "";

            item.innerHTML = `
                <div class="ejercicio-run-main">
                    <div class="ejercicio-run-img"
                         style="${imagenBg} background-size:cover; background-position:center;"></div>
                    <div>
                        <p class="ejercicio-run-name">${ej.nombre}</p>
                        <p class="ejercicio-run-meta">${ej.tipoEjercicio || ""}</p>
                    </div>
                </div>
                <div class="ejercicio-run-extra">
                    <span class="badge">Ejercicio ${index + 1}</span>
                </div>
            `;

            listaEjerciciosModal.appendChild(item);
        });
    }
});

