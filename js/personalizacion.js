// APLICAR FUENTE
const btnFuente = document.getElementById("btnFuente");
if (btnFuente) {
    btnFuente.addEventListener("click", () => {
        const fuente = document.getElementById("selectFuente").value;
        localStorage.setItem("fuente", fuente);
        document.documentElement.style.setProperty("--fuente-global", fuente);
    });
}

// APLICAR COLOR DE TEXTO
const btnColor = document.getElementById("btnColor");
if (btnColor) {
    btnColor.addEventListener("click", () => {
        const color = document.getElementById("selectColor").value;
        localStorage.setItem("color", color);
        document.documentElement.style.setProperty("--color-global", color);
    });
}

// APLICAR TAMAÑO
const btnTamano = document.getElementById("btnTamano");
if (btnTamano) {
    btnTamano.addEventListener("click", () => {
        const tamano = document.getElementById("selectTamano").value + "px";
        localStorage.setItem("tamano", tamano);
        document.documentElement.style.setProperty("--tamano-global", tamano);
    });
}

const btnMas = document.getElementById("mas");
if (btnMas) {
    btnMas.addEventListener("click", () => {
        let actual = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tamano-global"));
        actual += 1;
        localStorage.setItem("tamano", actual + "px");
        document.documentElement.style.setProperty("--tamano-global", actual + "px");
    });
}

const btnMenos = document.getElementById("menos");
if (btnMenos) {
    btnMenos.addEventListener("click", () => {
        let actual = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tamano-global"));
        if (actual > 8) actual -= 1;
        localStorage.setItem("tamano", actual + "px");
        document.documentElement.style.setProperty("--tamano-global", actual + "px");
    });
}

function cambiarTema(color) {
    document.body.classList.remove("tema-rojo", "tema-morado", "tema-azul", "tema-verde");
    document.body.classList.add("tema-" + color);
    localStorage.setItem("tema", color);

    const imgMesas = document.querySelector(".img-mesas");
    if (imgMesas) {
        if (color === "morado") imgMesas.src = "imagenes/mesa-morada.png";
        else if (color === "rojo") imgMesas.src = "imagenes/mesa-roja.png";
        else if (color === "azul") imgMesas.src = "imagenes/mesa-azul.png";
        else if (color === "verde") imgMesas.src = "imagenes/mesa-verde.png";
        else imgMesas.src = "imagenes/mesa-verde.png";
    }

    // 🔥 SELECTOR SEGURO: Seleccionamos las imágenes de las mesas SOLO dentro del contenedor de billar
    const mesasFotosBillar = document.querySelectorAll("#contenedor-mesas-billar .mesa-foto");

    const imagenesMesa = {
        morado: "imagenes/mesa-morada.png",
        rojo: "imagenes/mesa-roja.png",
        azul: "imagenes/mesa-azul.png",
        verde: "imagenes/mesa-verde.png"
    };

    // Recorremos solo las mesas de billar y cambiamos su imagen
    mesasFotosBillar.forEach(mesaFoto => {
        mesaFoto.src = imagenesMesa[color] || "imagenes/mesa-verde.png";
    });

    // 🪑 ASEGURAR MESAS NORMALES: Evitamos que cambien con el tema
    const mesasNormales = document.querySelectorAll("#mesas_normales .mesa-foto");
    mesasNormales.forEach(mesa => {
        mesa.src = "imagenes/mesa_centarse.png";
    });

    // 🐸 ASEGURAR BOLIRANAS: Obligamos a que mantengan su imagen original
    const boliranas = document.querySelectorAll("#bolirana-unica .mesa-foto");
    boliranas.forEach(bolirana => {
        bolirana.src = "imagenes/bolirana.png";
    });

    const fondo = document.getElementById("fondo-img");
    if (fondo) {
        fondo.classList.add("cambio-fondo");
        setTimeout(() => {
            if (color === "morado") fondo.src = "imagenes/fondo_morado.png";
            else if (color === "rojo") fondo.src = "imagenes/fondo_rojo.png";
            else if (color === "azul") fondo.src = "imagenes/fondo_azul.png";
            else fondo.src = "imagenes/fondo.png";
            fondo.classList.remove("cambio-fondo");
        }, 300);
    }

    const login = document.querySelector(".mesa-usuario");
    if (login) {
        login.classList.add("animar-login");
        setTimeout(() => login.classList.remove("animar-login"), 500);
    }
}

// 🔥 CORREGIDO: Centraliza la limpieza de imágenes al estado verde por defecto
function restablecerTema() {
    document.body.classList.remove("tema-rojo", "tema-morado", "tema-azul", "tema-verde");
    localStorage.removeItem("tema");

    const imgMesas = document.querySelector(".img-mesas");
    if (imgMesas) imgMesas.src = "imagenes/mesa-verde.png";

    const mesasFotos = document.querySelectorAll(".mesa-foto");
    mesasFotos.forEach(mesaFoto => {
        mesaFoto.src = "imagenes/mesa-verde.png";
    });

    const fondo = document.getElementById("fondo-img");
    if (fondo) fondo.src = "imagenes/fondo.png";
}

const btnRestablecer = document.getElementById("btnRestablecer");
if (btnRestablecer) {
    btnRestablecer.addEventListener("click", () => {
        localStorage.removeItem("fuente");
        localStorage.removeItem("color");
        localStorage.removeItem("tamano");
        
        document.documentElement.style.setProperty("--fuente-global", "Arial");
        document.documentElement.style.setProperty("--color-global", "white");
        document.documentElement.style.setProperty("--tamano-global", "16px");

        // Llama a la función que limpia los temas e imágenes correctamente
        restablecerTema();
    });
}

// 🔥 MEMORIA GLOBAL DE PERSONALIZACIÓN (AL REINICIAR LA PÁGINA)
window.addEventListener("load", () => {
    const fuente = localStorage.getItem("fuente");
    const color = localStorage.getItem("color");
    const tamano = localStorage.getItem("tamano");
    const tema = localStorage.getItem("tema");

    if (fuente) document.documentElement.style.setProperty("--fuente-global", fuente);
    if (color) document.documentElement.style.setProperty("--color-global", color);
    if (tamano) document.documentElement.style.setProperty("--tamano-global", tamano);

    if (tema) {
        document.body.classList.remove("tema-rojo", "tema-morado", "tema-azul", "tema-verde");
        document.body.classList.add("tema-" + tema);

        const imgMesas = document.querySelector(".img-mesas");
        if (imgMesas) {
            if (tema === "morado") imgMesas.src = "imagenes/mesa-morada.png";
            else if (tema === "rojo") imgMesas.src = "imagenes/mesa-roja.png";
            else if (tema === "azul") imgMesas.src = "imagenes/mesa-azul.png";
            else if (tema === "verde") imgMesas.src = "imagenes/mesa-verde.png";
        }

        const mesasFotos = document.querySelectorAll(".mesa-foto");
        mesasFotos.forEach(mesaFoto => {
            if (tema === "morado") mesaFoto.src = "imagenes/mesa-morada.png";
            else if (tema === "rojo") mesaFoto.src = "imagenes/mesa-roja.png";
            else if (tema === "azul") mesaFoto.src = "imagenes/mesa-azul.png";
            else if (tema === "verde") mesaFoto.src = "imagenes/mesa-verde.png";
        });

        const fondo = document.getElementById("fondo-img");
        if (fondo) {
            if (tema === "morado") fondo.src = "imagenes/fondo_morado.png";
            else if (tema === "rojo") fondo.src = "imagenes/fondo_rojo.png";
            else if (tema === "azul") fondo.src = "imagenes/fondo_azul.png";
        }
    } else {
        // 🔥 SOLUCIÓN AL REINICIO: Si no hay tema guardado en localStorage, fuerza la mesa verde por defecto
        const imgMesas = document.querySelector(".img-mesas");
        if (imgMesas) imgMesas.src = "imagenes/mesa-verde.png";

        const mesasFotos = document.querySelectorAll(".mesa-foto");
        mesasFotos.forEach(mesaFoto => {
            mesaFoto.src = "imagenes/mesa-verde.png";
        });
    }
});