/* ---------- Datos de ejemplo (reemplaza por fetch si quieres) ---------- */
const ejercicios = [
  { id:1, nombre:"Sentadillas", categoria:"Piernas", imagen:"https://images.unsplash.com/photo-1554285306-1971a3a8b6f9?w=800&q=60", descripcion:"Ejercicio para piernas.", instrucciones:["Coloca los pies al ancho de hombros.","Baja con control.","Sube empujando con talones."] },
  { id:2, nombre:"Press de banca", categoria:"Pectorales", imagen:"https://images.unsplash.com/photo-1554284126-6f14f4b62b7f?w=800&q=60", descripcion:"Ejercicio para pecho.", instrucciones:["Acuéstate en el banco.","Baja la barra hasta el pecho.","Empuja hacia arriba."] },
  { id:3, nombre:"Dominada", categoria:"Espalda", imagen:"https://images.unsplash.com/photo-1526403224742-3da2f3b8e8f7?w=800&q=60", descripcion:"Ejercicio de tracción.", instrucciones:["Agarra la barra.","Tira hasta pasar la barbilla.","Baja controlado."] },
  { id:4, nombre:"Curl de bíceps", categoria:"Bíceps", imagen:"https://images.unsplash.com/photo-1594737625785-45c66f5ad6a8?w=800&q=60", descripcion:"Aislamiento de bíceps.", instrucciones:["Sujeta mancuerna.","Flexiona el codo.","Baja controlado."] },
  { id:5, nombre:"Fondos en paralelas", categoria:"Tríceps", imagen:"https://images.unsplash.com/photo-1546484959-fb9b7c2f5b16?w=800&q=60", descripcion:"Trabaja tríceps.", instrucciones:["Apóyate en paralelas.","Baja hasta 90°.","Empuja hasta extender."] }
];

let seleccionados = [];

/* ---------- DOM refs ---------- */
const modal = document.getElementById("modalCrearRutina");
const btnAbrir = document.getElementById("btnAbrirModal");
const cerrarModal = document.getElementById("cerrarModal");
const cancelar = document.getElementById("cancelar");
const listaEjercicios = document.getElementById("listaEjercicios");
const filtros = document.getElementById("filtros");
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

/* abrir/cerrar modal crear */
btnAbrir.addEventListener("click", () => {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  renderEjercicios();
  renderSeleccionados();
});
cerrarModal.addEventListener("click", closeModal);
cancelar.addEventListener("click", closeModal);
function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
}

/* cerrar clicking fuera */
modal.addEventListener("click",(e)=>{ if(e.target===modal) closeModal(); });

/* abrir/cerrar view modal */
if(cerrarVer) cerrarVer.addEventListener("click", ()=> modalVer.classList.add("hidden"));
if(cerrarVerFooter) cerrarVerFooter.addEventListener("click", ()=> modalVer.classList.add("hidden"));
modalVer.addEventListener("click",(e)=>{ if(e.target===modalVer) modalVer.classList.add("hidden"); });

/* abrir/cerrar confirm modal */
if(cerrarConfirm) cerrarConfirm.addEventListener("click", ()=> modalConfirm.classList.add("hidden"));
if(confirmOk) confirmOk.addEventListener("click", ()=> {
  modalConfirm.classList.add("hidden");
  // limpiar y cerrar modal main
  seleccionados = [];
  renderSeleccionados();
  document.getElementById("nombreRutina").value = "";
  closeModal();
});
modalConfirm.addEventListener("click",(e)=>{ if(e.target===modalConfirm) modalConfirm.classList.add("hidden"); });

/* render lista izquierda */
function renderEjercicios(){
  const active = document.querySelector(".filter.active");
  const cat = active ? active.dataset.cat : "Todos";
  const q = (buscarInput.value || "").toLowerCase().trim();

  listaEjercicios.innerHTML = "";
  const filtrados = ejercicios.filter(e => (cat === "Todos" || e.categoria === cat) && e.nombre.toLowerCase().includes(q));

  if(filtrados.length === 0){
    listaEjercicios.innerHTML = `<div class="ejercicio">No se encontraron ejercicios</div>`;
    return;
  }

  filtrados.forEach(e => {
    const item = document.createElement("div");
    item.className = "ejercicio";
    item.innerHTML = `
      <div style="display:flex; align-items:center;">
        <div style="width:76px; height:56px; border-radius:8px; background-image:url('${e.imagen}'); background-size:cover; background-position:center; border:1px solid var(--color-border);"></div>
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

  // event listeners delegados
  listaEjercicios.querySelectorAll(".btn-add").forEach(b => b.addEventListener("click", e => {
    const id = Number(e.currentTarget.dataset.id);
    agregarEjercicio(id);
  }));

  listaEjercicios.querySelectorAll(".btn-ver").forEach(b => b.addEventListener("click", e => {
    const id = Number(e.currentTarget.dataset.id);
    abrirVerEjercicio(id);
  }));
}

/* filtros */
filtros.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    filtros.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    renderEjercicios();
  });
});

/* búsqueda */
buscarInput.addEventListener("input", renderEjercicios);

/* agregar ejercicio (evita duplicados) */
function agregarEjercicio(id){
  if(seleccionados.some(s => s.id === id)) return;
  const e = ejercicios.find(x => x.id === id);
  if(!e) return;
  // añadimos campos por defecto (series, reps, peso)
  seleccionados.push({ ...e, series: 3, repeticiones: 10, peso: "" });
  renderSeleccionados();
}

/* render seleccionados (incluye inputs para series/reps/peso y botón eliminar) */
function renderSeleccionados(){
  seleccionadosCont.innerHTML = "";
  contadorSel.textContent = `(${seleccionados.length})`;

  if(seleccionados.length === 0){
    seleccionadosCont.innerHTML = `<div class="ejercicio">No has agregado ejercicios<br><span class="text-muted-foreground">Selecciona al menos uno</span></div>`;
    return;
  }

  seleccionados.forEach(s => {
    const div = document.createElement("div");
    div.className = "sel-item";
    div.innerHTML = `
      <div class="sel-left">
        <div style="width:96px; height:66px; border-radius:8px; background-image:url('${s.imagen}'); background-size:cover; background-position:center; border:1px solid var(--color-border);"></div>
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
        <!-- trash SVG (eliminar) sin borde -->
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
      if(prop === "peso" && val === "") { val = ""; } else { val = Number(val) || 0; }
      seleccionados = seleccionados.map(s => s.id === id ? { ...s, [prop]: val } : s);
    });
  });
}

/* abrir modal ver ejercicio */
function abrirVerEjercicio(id){
  const e = ejercicios.find(x => x.id === Number(id));
  if(!e) return;
  verNombre.textContent = e.nombre;
  verImagen.style.backgroundImage = `url('${e.imagen}')`;
  verDescripcion.textContent = e.descripcion;
  verInstrucciones.innerHTML = e.instrucciones.map(i => `<li>${i}</li>`).join("");
  verCategorias.innerHTML = `<span class="pill">${e.categoria}</span>`;
  modalVer.classList.remove("hidden");
}

/* crear rutina (muestra modal de confirmación en lugar de alert) */
crearRutinaBtn.addEventListener("click", () => {
  const nombre = document.getElementById("nombreRutina").value.trim() || "Rutina sin nombre";
  if(seleccionados.length === 0){
    // si no hay ejercicios, mostramos confirm pequeño con mensaje de error
    confirmText.textContent = "Agrega al menos un ejercicio antes de crear la rutina.";
    // cambiar estilo para error (opcional)
    modalConfirm.classList.remove("hidden");
    return;
  }
  // construir payload
  const payload = {
    nombre,
    ejercicios: seleccionados.map(s => ({ id:s.id, nombre:s.nombre, categoria:s.categoria, series:s.series, repeticiones:s.repeticiones, peso:s.peso }))
  };
  console.log("Payload crear rutina:", payload);

  // mostrar modal de confirmación con resumen
  confirmText.innerHTML = `<strong>${nombre}</strong><br/>Rutina creada con ${seleccionados.length} ejercicio(s).`;
  modalConfirm.classList.remove("hidden");

  // aquí podrías enviar payload al backend con fetch()
});

/* inicializa */
renderEjercicios();
renderSeleccionados();
