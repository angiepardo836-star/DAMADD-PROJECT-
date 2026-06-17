  //Script para controlar el carrusel
  (function(){ // Inicio función autoejecutable
    const track = document.querySelector('.carousel-track'); // selecciona la pista del carrusel
    const slides = Array.from(document.querySelectorAll('.carousel-slide')); // array de las diapositivas
    const nextBtn = document.querySelector('.carousel-btn.next'); // botón siguiente
    const prevBtn = document.querySelector('.carousel-btn.prev'); // botón anterior
    const indicators = document.querySelector('.carousel-indicators'); // contenedor de puntos
    let current = 0; // índice actual
    const slideCount = slides.length; // total de diapositivas

    slides.forEach((_, i) => { // crea un indicador por cada slide
      const btn = document.createElement('button'); // crea el botón indicador
      btn.className = 'indicator'; // asigna clase
      btn.setAttribute('aria-label', 'Ir a ' + (i+1)); // etiqueta accesible
      btn.addEventListener('click', () => goTo(i)); // salta a la slide al click
      indicators.appendChild(btn); // añade el indicador al DOM
    }); // fin creación indicadores

    function goTo(index){ // mueve el carrusel a un índice dado
      current = (index + slideCount) % slideCount; // normaliza el índice dentro del rango
      track.style.transform = `translateX(-${current * 100}%)`; // desplaza la pista
      updateIndicators(); // actualiza los puntos activos
    } // fin goTo

    function updateIndicators(){ // marca el punto activo
      Array.from(indicators.children).forEach((b, i) => b.classList.toggle('active', i === current)); // alterna clase
    } // fin updateIndicators

    let timer = setInterval(()=> goTo(current + 1), 3000); // autoplay cada 3 segundos
    function resetTimer(){ clearInterval(timer); timer = setInterval(()=> goTo(current + 1), 4000); } // reinicia el timer

    nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); }); // evento siguiente
    prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); }); // evento anterior

    document.addEventListener('keydown', (e) => { // navegación por teclado
      if (e.key === 'ArrowRight') { goTo(current + 1); resetTimer(); } // flecha derecha
      if (e.key === 'ArrowLeft') { goTo(current - 1); resetTimer(); } // flecha izquierda
    }); // fin keydown

    goTo(0); // inicia en la primera slide
  })(); // fin función autoejecutable