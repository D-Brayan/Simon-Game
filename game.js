const game = () => {
  // Espera unos segundos para ejecutar deteminada cosa, pero no bloquea el hilo principal.
  const sleep = m => new Promise(r => setTimeout(r, m)); 
  // La fuente sera el source del audio y va a trabajar con elementos de audio.
  const cargarSonido = function (fuente) {
    const sonido = document.createElement("audio");
    sonido.src = fuente;
    sonido.setAttribute("preload", "auto");
    sonido.setAttribute("controls", "none");
    sonido.style.display = "none";
    document.body.appendChild(sonido);
    return sonido;
  }
  // CIRCULO DEL SIMON
  const partidoEn16 = (Math.PI * 2) / 16;
  const centroX = 200, centroY = 200;
  const radioCirculo = 200;
  const radioCuarto = 170;
  const radioCirculoCentral = 80;
  const distancia = 10;
  const gamma = 2;
  // QUE ESPERA PARA LA SECUENCIA || EL RANGO DE TIEMPO ENTRE CLICK DEL USUARIO
  const milisegCpu = 200, milisegUsuario = 150; 
  const sonidoSupIzq = cargarSonido("audio/verde.mp3"), 
    sonidoSupDer = cargarSonido("audio/rojo.mp3"), 
    sonidoInfIzq = cargarSonido("audio/amarillo.mp3"), 
    sonidoInfDer = cargarSonido("audio/azul.mp3");
  
  let puedeJugar = false;
  let contador = 0;
  let puntaje = 0;
  let secuencia = []; // CONTIENE LA SENCUENCIA DE LOS COLORES

  const verde = d3.color("#1b5e20"),
    rojo = d3.color("#b71c1c"),
    amarillo = d3.color("#f9a825"),
    azul = d3.color("#0d47a1"),
    negro = d3.color("#212121");
  
  const circuloFondo = d3.arc()
    .innerRadius(0)
    .outerRadius(radioCirculo)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const circuloCentral = d3.arc()
    .innerRadius(0)
    .outerRadius(radioCirculoCentral)
    .startAngle(0)
    .endAngle(Math.PI * 2);

  const $svg = d3.select("#contenedorJuego")
    .append("svg")
    .attr('width', 400)
    .attr('height', 400);

  // CIRCULO NEGRO

  $svg.append("g")
    .attr("transform", `translate(${centroX}, ${centroY})`)
    .append("path")
    .attr("d", circuloFondo)
    .attr("fill", negro);

  // CIRCULO VERDE

  const supIzq = $svg.append("g")
    .attr("transform", `translate(${centroX - distancia}, ${centroY - distancia})`)
    .attr("class", "boton")
    .append("path")
    .attr("d",
      d3.arc()
        .innerRadius(0)
        .outerRadius(radioCuarto)
        .startAngle(partidoEn16 * 12)
        .endAngle(partidoEn16 * 16)
    )
    .attr("fill", verde);

  // CIRCULO ROJO

  const supDer = $svg.append("g")
    .attr("transform", `translate(${centroX + distancia}, ${centroY - distancia})`)
    .attr("class", "boton")
    .append("path")
    .attr("d",
      d3.arc()
        .innerRadius(0)
        .outerRadius(radioCuarto)
        .startAngle(0)
        .endAngle(partidoEn16 * 4)
    )
    .attr("fill", rojo);

  // CIRCULO AMARILLO 

  const infIzq = $svg.append("g")
    .attr("transform", `translate(${centroX - distancia}, ${centroY + distancia})`)
    .attr("class", "boton")
    .append("path")
    .attr("d",
      d3.arc()
        .innerRadius(0)
        .outerRadius(radioCuarto)
        .startAngle(partidoEn16 * 8)
        .endAngle(partidoEn16 * 12)
    )
    .attr("fill", amarillo);

  // CIRCULO AZUL

  const infDer = $svg.append("g")
    .attr("transform", `translate(${centroX + distancia}, ${centroY + distancia})`)
    .attr("class", "boton")
    .append("path")
    .attr("d",
      d3.arc()
        .innerRadius(0)
        .outerRadius(radioCuarto)
        .startAngle(partidoEn16 * 4)
        .endAngle(partidoEn16 * 8)
    )
    .attr("fill", azul);

  // ENCIMA DE LOS DEMAS CIRCULOS (EL CIRCULO CENTRAL)
  
  $svg.append("g")
    .attr("transform", `translate(${centroX}, ${centroY})`)
    .append("path")
    .attr("d", circuloCentral)
    .attr("fill", negro);

  const textoPuntaje = $svg.append("text")
    .attr("transform", `translate(${centroX}, ${centroY})`)
    .attr("fill", "#ffffff")
    .attr("font-size", 30)
    .attr("font-weight", "bold")
    .attr("font-weight", "Courier")
    .style("text-anchor", "middle")
    .style("dominant-baseline", "central")
    .text("0")

  const onYOffBoton = async (boton, duracion) => {
    puedeJugar = false;
    const colorActual = boton.attr("fill");
    let reproducirSonido;
    if (compararBotones(boton, supIzq)) {
      reproducirSonido = sonidoSupIzq;
    } else if (compararBotones(boton, supDer)) {
      reproducirSonido = sonidoSupDer;
    } else if (compararBotones(boton, infIzq)) {
      reproducirSonido = sonidoInfIzq;
    } else {
      reproducirSonido = sonidoInfDer;
    }
    reproducirSonido.currentTime = 0;
    await reproducirSonido.play();
    boton.attr("fill", d3.color(colorActual).brighter(gamma))
    await sleep(duracion);
    boton.attr("fill", d3.color(colorActual));
    await sleep(duracion);
    await reproducirSonido.pause();
    puedeJugar = true;
  };

  const reproducirSecuencia = async secuencia => {
    for (const boton of secuencia) {
      await onYOffBoton(boton, milisegCpu);
    }
  };

  const botones = [supIzq, supDer, infIzq, infDer];
  const aleatorioDeArreglo = arreglo => arreglo[Math.floor(Math.random() * arreglo.length)];
  const agregarBotonAleatorioSecuencia = secuencia => secuencia.push(aleatorioDeArreglo(botones));
  const compararBotones = (boton, otroBoton) => {
    return boton.attr("fill") === otroBoton.attr("fill");
  };

  const compararSecuenciaDeUsuarioConOriginal = (secuenciaOriginal, botonDeUsuario, indice) => {
    return compararBotones(secuenciaOriginal[indice], botonDeUsuario);
  };

  const refrescarPuntaje = puntaje => textoPuntaje.text(puntaje.toString());
  const reiniciar = () => {
    secuencia = [];
    puedeJugar = false;
    contador = puntaje = 0;
    refrescarPuntaje(puntaje);
  }

  botones.forEach(boton => {
    boton.on("click", async () => {
      if (!puedeJugar) {
        console.log("NO PUEDES JUGAR");
        return;
      }
      puedeJugar = false;
      const ok = compararSecuenciaDeUsuarioConOriginal(secuencia, boton, contador);
      if (ok) {
        await onYOffBoton(boton, milisegUsuario);
        if (contador >= secuencia.length - 1) {
          puntaje++;
          refrescarPuntaje(puntaje);
          await sleep(500);
          await turnoDelCpu();
        } else {
          contador++;
        }
        puedeJugar = true;
      } else {
        $btnComenzar.disabled = false;
        Swal.fire("Perdiste", `Has perdido. Tu puntaje fue de ${puntaje}. Puedes jugar de nuevo cuando quieras`);
      }
    });
  });

  const turnoDelCpu = async () => {
    puedeJugar = false;
    agregarBotonAleatorioSecuencia(secuencia);
    await reproducirSecuencia(secuencia);
    contador = 0;
    puedeJugar = true;
  }

  const $btnComenzar = document.querySelector("#comenzar");
  $btnComenzar.addEventListener("click", () => {
    $btnComenzar.disabled = true;
    reiniciar();
    turnoDelCpu();
  });

}

Swal.fire("Bienvenido", `Comienza a jugar, mira la secuencia e imítala (cuando hagas click, espera a que el botón se apague para hacer el siguiente click). <br> <br>
  Ganas cuando se desborde la memoria del programa u ocurra un fallo, aunque probablemente pierdas antes de que eso ocurra. <br>`)
  .then(game)

