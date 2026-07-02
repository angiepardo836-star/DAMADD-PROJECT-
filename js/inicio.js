(function(){ 
  const slides = Array.from(document.querySelectorAll('.carousel-slide')); 
  const nextBtn = document.querySelector('.carousel-btn.next'); 
  const prevBtn = document.querySelector('.carousel-btn.prev'); 
  const indicators = document.querySelector('.carousel-indicators'); 
  const textBlocks = document.querySelectorAll('.carousel-text-block');
  
  let current = 0; 
  const slideCount = slides.length; 
  let isAnimating = false; 

  // Generador de indicadores circulares nativo
  slides.forEach((_, i) => { 
    const btn = document.createElement('button'); 
    btn.className = 'indicator'; 
    btn.setAttribute('aria-label', 'Ir a ' + (i+1)); 
    btn.addEventListener('click', () => {
      if (i !== current) { goTo(i); resetTimer(); }
    }); 
    indicators.appendChild(btn); 
  }); 

  function goTo(index){ 
    if (isAnimating) return; 
    
    const nextIndex = (index + slideCount) % slideCount; 
    
    if (typeof gsap === "undefined") {
      slides[current].classList.remove('active');
      slides[nextIndex].classList.add('active');
      textBlocks[current].classList.remove('active');
      textBlocks[nextIndex].classList.add('active');
      current = nextIndex;
      updateIndicators();
      return;
    }

    isAnimating = true;
    
    const currentSlide = slides[current];
    const nextSlide = slides[nextIndex];
    const currentText = textBlocks[current];
    const nextText = textBlocks[nextIndex];

    // Colocamos la capa de la nueva imagen de fondo justo arriba de la anterior pero bajo el canvas
    gsap.set(nextSlide, { 
      className: "carousel-slide active",
      clipPath: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)", 
      opacity: 1,
      zIndex: 2
    });
    gsap.set(currentSlide, { zIndex: 1 });

    // Preparar el nuevo bloque de texto
    gsap.set(nextText, { className: "carousel-text-block active", opacity: 0, y: 15 });

    const tl = gsap.timeline({
      onComplete: () => {
        currentSlide.classList.remove('active');
        currentText.classList.remove('active');
        gsap.set(currentSlide, { opacity: 0, clipPath: "none" });
        current = nextIndex;
        updateIndicators();
        isAnimating = false; 
      }
    });

    // 1. ANIMACIÓN DE IMAGEN: Abre la máscara diagonal en el fondo
    tl.to(nextSlide, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 0.75,
      ease: "power3.inOut"
    });

    // 2. ANIMACIÓN DE TEXTO VIEJO: Fade-out rápido
    tl.to(currentText, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.in"
    }, "0");

    // 3. ANIMACIÓN DE TEXTO NUEVO: Desplazamiento sutil hacia arriba
    tl.to(nextText, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      ease: "power2.out"
    }, "-=0.3");
  } 

  function updateIndicators(){ 
    Array.from(indicators.children).forEach((b, i) => b.classList.toggle('active', i === current)); 
  } 

  // Autoplay
  let timer = setInterval(()=> goTo(current + 1), 3500); 
  function resetTimer(){ 
    clearInterval(timer); 
    timer = setInterval(()=> goTo(current + 1), 4500); 
  } 

  // Eventos de botones
  nextBtn.addEventListener('click', () => { goTo(current + 1); resetTimer(); }); 
  prevBtn.addEventListener('click', () => { goTo(current - 1); resetTimer(); }); 

  document.addEventListener('keydown', (e) => { 
    if (e.key === 'ArrowRight') { goTo(current + 1); resetTimer(); } 
    if (e.key === 'ArrowLeft') { goTo(current - 1); resetTimer(); } 
  }); 

  // Forzar inicio limpio sin tocar el canvas
  if(slides[0]) gsap.set(slides[0], { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", opacity: 1, zIndex: 2 });
  if(textBlocks[0]) gsap.set(textBlocks[0], { opacity: 1, y: 0 });
  updateIndicators();
})();