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

        // 🎱 CORRECCIÓN: Cambiar la imagen SOLO a las mesas que están dentro del contenedor de billar
        const mesasBillar = document.querySelectorAll("#contenedor-mesas-billar .mesa-foto");
        mesasBillar.forEach(mesaFoto => {
            if (tema === "morado") mesaFoto.src = "imagenes/mesa-morada.png";
            else if (tema === "rojo") mesaFoto.src = "imagenes/mesa-roja.png";
            else if (tema === "azul") mesaFoto.src = "imagenes/mesa-azul.png";
            else if (tema === "verde") mesaFoto.src = "imagenes/mesa-verde.png";
        });

        // 🪑 ASEGURAR MESAS NORMALES: Que mantengan siempre su imagen original
        const mesasNormales = document.querySelectorAll("#mesas_normales .mesa-foto");
        mesasNormales.forEach(mesa => {
            mesa.src = "imagenes/mesa_centarse.png";
        });

        // 🐸 ASEGURAR BOLIRANAS: Que mantengan siempre su imagen original
        const boliranas = document.querySelectorAll("#bolirana-unica .mesa-foto");
        boliranas.forEach(bolirana => {
            bolirana.src = "imagenes/bolirana.png";
        });

        const fondo = document.getElementById("fondo-img");
        if (fondo) {
            if (tema === "morado") fondo.src = "imagenes/fondo_morado.png";
            else if (tema === "rojo") fondo.src = "imagenes/fondo_rojo.png";
            else if (tema === "azul") fondo.src = "imagenes/fondo_azul.png";
        }
    } else {
        // 🔥 SOLUCIÓN AL REINICIO SIN TEMA GUARDADO:
        const imgMesas = document.querySelector(".img-mesas");
        if (imgMesas) imgMesas.src = "imagenes/mesa-verde.png";

        // Solo restablece a verde las de billar
        const mesasBillar = document.querySelectorAll("#contenedor-mesas-billar .mesa-foto");
        mesasBillar.forEach(mesaFoto => {
            mesaFoto.src = "imagenes/mesa-verde.png";
        });

        // Mantiene intactas las mesas normales y boliranas
        const mesasNormales = document.querySelectorAll("#mesas_normales .mesa-foto");
        mesasNormales.forEach(mesa => mesa.src = "imagenes/mesa_centarse.png");

        const boliranas = document.querySelectorAll("#bolirana-unica .mesa-foto");
        boliranas.forEach(bolirana => bolirana.src = "imagenes/bolirana.png");
    }
});                     