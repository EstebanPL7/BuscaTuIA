/* =======================================================
    BUSCATUIA + TALLER
   ======================================================= */

// --- FUNCIONES GLOBALES ---

function mostrarMensaje() {
    const mensaje = document.getElementById("mensaje");
    if (mensaje) mensaje.style.display = "block";
}

function actualizarPromedio() {
    const edades = document.querySelectorAll(".dato-edad");
    let suma = 0;
    if (edades.length === 0) return;
    edades.forEach(celda => { suma += parseInt(celda.textContent); });
    const promedio = suma / edades.length;
    const txtPromedio = document.getElementById("txtPromedio");
    if (txtPromedio) txtPromedio.textContent = Math.round(promedio);
}

$(document).ready(function() {

    // ==========================================
    // 0. UTILIDADES (FECHA Y HEADER)
    // ==========================================
    
    // MOSTRAR FECHA ACTUAL (Footer)
    const fechaElemento = document.getElementById("fecha");
    if (fechaElemento) {
        const hoy = new Date();
        // Muestra la fecha en formato local (ej: 11/12/2025)
        fechaElemento.textContent = "Fecha actual: " + hoy.toLocaleDateString();
    }

    // SCROLL HEADER (Sombra al bajar)
    $(window).scroll(function() {
        if ($(this).scrollTop() > 50) {
            $("header").css("box-shadow", "0 4px 15px rgba(52, 46, 173, 0.15)");
        } else {
            $("header").css("box-shadow", "none"); 
        }
    });

    // ==========================================
    // 1. TALLER BOOTSTRAP 
    // ==========================================
    
    // Botón Generar Datos
    $("#btnGenerar").click(function() {
        const aleatorioNombre = Math.floor(Math.random() * 9) + 1;
        const dia = Math.floor(Math.random() * 28) + 1;
        const mes = Math.floor(Math.random() * 12) + 1;
        const anio = Math.floor(Math.random() * (2020 - 1980 + 1)) + 1980;

        $("#txtNombre").val("Persona" + aleatorioNombre);
        $("#txtDia").val(dia);
        $("#txtMes").val(mes);
        $("#txtAnio").val(anio);

        const anioActual = new Date().getFullYear();
        const edadCalculada = anioActual - anio;
        
        $("#imagen-edad").show();
        if (edadCalculada < 18) {
            $("#imagen-edad").attr("src", "Imagenes/jovenes.png");
        } else {
            $("#imagen-edad").attr("src", "Imagenes/adulto.png");
        }
    });

    // Botón Insertar en Tabla
    $("#btnInsertar").click(function() {
        const nombre = $("#txtNombre").val();
        const dia = $("#txtDia").val();
        const mes = $("#txtMes").val();
        const anio = $("#txtAnio").val();

        if (nombre === "") return alert("Genera los datos primero.");

        const anioActual = new Date().getFullYear();
        const edad = anioActual - anio;

        const fila = `
            <tr>
                <td>${nombre}</td>
                <td>${dia}-${mes}-${anio}</td>
                <td class="dato-edad">${edad}</td>
            </tr>
        `;
        $("#tablaCuerpo").append(fila);
        actualizarPromedio();
    });

    // Botón Resaltar Filas
    $("#btnResaltar").click(function() {
        const txtPromedio = document.getElementById("txtPromedio");
        if (!txtPromedio) return;

        const promedio = parseFloat(txtPromedio.textContent);
        
        $("#tablaCuerpo tr").each(function() {
            const edad = parseInt($(this).find(".dato-edad").text());
            
            // Reseteamos estilos primero
            $(this).css("background-color", "transparent").css("color", "inherit");

            if (edad > promedio) {
                $(this).css("background-color", "#d1e7dd").css("color", "#0f5132"); // Verde
            } else if (edad < promedio) {
                $(this).css("background-color", "#f8d7da").css("color", "#842029"); // Rojo
            }
        });
    });

    // ==========================================
    // 2. CONFIGURACIÓN GLOBAL (MODO OSCURO)
    // ==========================================
    if (localStorage.getItem("modoOscuro") === "activado") {
        $("body").addClass("dark-mode");
        $("#switchDarkMode").prop("checked", true); 
    }

    $("#switchDarkMode").change(function() {
        if ($(this).is(":checked")) {
            $("body").addClass("dark-mode");
            localStorage.setItem("modoOscuro", "activado"); 
        } else {
            $("body").removeClass("dark-mode");
            localStorage.setItem("modoOscuro", "desactivado"); 
        }
    });

    // Tamaño de Letra
    function aplicarTamano(nivel) {
        if(nivel == "1") $("html").css("font-size", "16px");
        if(nivel == "2") $("html").css("font-size", "18px");
        if(nivel == "3") $("html").css("font-size", "20px");
    }
    let tamanoGuardado = localStorage.getItem("tamanoLetra");
    if (tamanoGuardado) {
        $("#rangeFontSize").val(tamanoGuardado);
        aplicarTamano(tamanoGuardado);
    }
    $("#rangeFontSize").on("input change", function() {
        let valor = $(this).val();
        aplicarTamano(valor);
        localStorage.setItem("tamanoLetra", valor); 
    });

    // ==========================================
    // 3. GESTIÓN DE SESIÓN
    // ==========================================
    let usuario = localStorage.getItem("usuarioLogueado");
    let nombre = localStorage.getItem("nombreUsuario") || usuario; 
    let fotoKey = "foto_" + usuario; 
    let foto = localStorage.getItem(fotoKey);

    if (usuario) {
        $("a[href='login.html']").hide();
        $("#userDisplayLink").css("display", "flex");
        $("#btnLogout").show();

        if (foto) {
            $("#userAvatar").html(`<img src="${foto}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`);
            $("#userAvatar").css("background-color", "transparent"); 
            if ($("#imgPerfilPreview").length > 0) $("#imgPerfilPreview").attr("src", foto);
        } else {
            let inicial = nombre.charAt(0).toUpperCase(); 
            $("#userAvatar").text(inicial).css("background-color", "#e91e63");
            if ($("#imgPerfilPreview").length > 0) $("#imgPerfilPreview").attr("src", "https://via.placeholder.com/150"); 
        }
    }

    $("#btnLogout").click(function(e) {
        e.preventDefault();
        localStorage.removeItem("usuarioLogueado");
        window.location.href = "login.html";
    });

    // ==========================================
    // 4. LOGIN Y REGISTRO
    // ==========================================
    $("#formLogin").submit(function(e) {
        e.preventDefault(); 
        $("#loginErrorMsg").hide().text("");
        let inputEmail = $("#inputEmail").val().trim();
        let inputPass = $("#inputPassword").val().trim();

        if (inputEmail === "" || inputPass === "") return $("#loginErrorMsg").text("⚠️ Complete campos.").slideDown();

        let emailReal = localStorage.getItem("emailRegistrado");
        let passReal = localStorage.getItem("passRegistrado");
        let nombreReal = localStorage.getItem("nombreRegistrado");

        if (inputEmail === emailReal && inputPass === passReal) {
            localStorage.setItem("usuarioLogueado", inputEmail);
            localStorage.setItem("nombreUsuario", nombreReal);
            window.location.href = "index.html";
        } else {
            $("#loginErrorMsg").text("🔒 Datos incorrectos.").slideDown();
        }
    });

    $("#formRegister").submit(function(e) {
        e.preventDefault();
        $("#registerErrorMsg").hide().text("");
        let nombre = $("#regNombre").val().trim();
        let email = $("#regEmail").val().trim();
        let pass1 = $("#regPassword").val();
        let pass2 = $("#regConfirmPassword").val();

        if (pass1 !== pass2) return $("#registerErrorMsg").text("⚠️ Las contraseñas no coinciden.").slideDown();
        
        localStorage.setItem("emailRegistrado", email);
        localStorage.setItem("passRegistrado", pass1);
        localStorage.setItem("nombreRegistrado", nombre);
        localStorage.setItem("usuarioLogueado", email);
        localStorage.setItem("nombreUsuario", nombre);
        
        alert("¡Bienvenido, " + nombre + "!");
        window.location.href = "index.html";
    });

    // ==========================================
    // 5. PERFIL DE USUARIO
    // ==========================================
    if ($("#formPerfil").length > 0) {
        let usuarioActual = localStorage.getItem("usuarioLogueado");
        let fotoKey = "foto_" + usuarioActual;
        let nombreGuardado = localStorage.getItem("nombreUsuario");
        
        if (nombreGuardado) {
            $("#inputNombrePerfil").val(nombreGuardado);
            $("#lblNombrePerfil").text(nombreGuardado);
        }
        if (usuarioActual) {
            $("#inputEmailPerfil").val(usuarioActual);
            $("#lblEmailPerfil").text(usuarioActual);
        }
        let fotoGuardada = localStorage.getItem(fotoKey);
        if (fotoGuardada) $("#imgPerfilPreview").attr("src", fotoGuardada);
    }

    $("#inputFotoArchivo").change(function() {
        const archivo = this.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = function(e) { $("#imgPerfilPreview").attr("src", e.target.result); }
            lector.readAsDataURL(archivo);
        }
    });

    $("#formPerfil").submit(function(e) {
        e.preventDefault();
        let nuevoNombre = $("#inputNombrePerfil").val();
        let nuevaFotoSrc = $("#imgPerfilPreview").attr("src"); 

        if(nuevoNombre.trim() === "") return alert("Nombre obligatorio");

        let usuarioActual = localStorage.getItem("usuarioLogueado");
        let fotoKey = "foto_" + usuarioActual;

        localStorage.setItem("nombreUsuario", nuevoNombre);
        localStorage.setItem(fotoKey, nuevaFotoSrc); 
        
        $("#lblNombrePerfil").text(nuevoNombre);
        $("#userDisplay").text("Hola, " + nuevoNombre);
        alert("¡Perfil actualizado!");
        location.reload(); 
    });

    // ==========================================
    // 6. CARRITO DE COMPRAS
    // ==========================================
    let subtotalGlobal = 0;

    if ($(".btn-agregar").length > 0) {
        $(".btn-agregar").click(function() {
            let nombre = $(this).data("nombre");
            let precio = parseFloat($(this).data("precio"));
            let idInput = $(this).data("input");
            let cantidad = parseInt($("#" + idInput).val());

            if (cantidad <= 0 || isNaN(cantidad)) return alert("Cantidad inválida");

            let totalLicencia = precio * cantidad;
            let fila = `<tr><td>${nombre}</td><td>$${precio}</td><td>${cantidad}</td><td class="total-fila">$${totalLicencia.toFixed(2)}</td><td><button class="btn btn-danger btn-sm btn-eliminar-item">🗑️</button></td></tr>`;
            
            $("#tablaCarrito").append(fila);
            actualizarCalculos(totalLicencia);
        });

        $(document).on("click", ".btn-eliminar-item", function() {
            let fila = $(this).closest("tr");
            let textoValor = fila.find(".total-fila").text();
            let valorARestar = parseFloat(textoValor.replace('$', ''));
            actualizarCalculos(valorARestar * -1);
            fila.fadeOut(300, function() { $(this).remove(); });
        });

        function actualizarCalculos(monto) {
            subtotalGlobal += monto;
            if (subtotalGlobal < 0) subtotalGlobal = 0;
            let iva = subtotalGlobal * 0.19;
            let total = subtotalGlobal + iva;
            $("#txtSubtotal").text("$" + subtotalGlobal.toFixed(2));
            $("#txtIVA").text("$" + iva.toFixed(2));
            $("#txtTotal").text("$" + total.toFixed(2));
        }
    }

    // ==========================================
    // 7. CATÁLOGO DINÁMICO
    // ==========================================
    const baseDatosIAs = [
        // --- 1. ASISTENTES DE IA ---
        { nombre: "ChatGPT", categoria: "asistentes", imagen: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", desc: "El líder indiscutible en conversación natural.", precio: "Freemium" },
        { nombre: "Claude 3", categoria: "asistentes", imagen: "https://images.seeklogo.com/logo-png/55/2/claude-logo-png_seeklogo-554534.png", desc: "IA ética con enorme capacidad de lectura.", precio: "Freemium" },
        { nombre: "Gemini", categoria: "asistentes", imagen: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-gemini-icon.png", desc: "El ecosistema multimodal de Google.", precio: "Gratis" },
        { nombre: "Perplexity", categoria: "asistentes", imagen: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Perplexity_AI_logo.svg", desc: "Buscador inteligente con fuentes en tiempo real.", precio: "Gratis" },
        { nombre: "Copilot", categoria: "asistentes", imagen: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/copilot-color.png", desc: "Tu asistente integrado en Windows y Office.", precio: "Freemium" },

        // --- 2. GENERACIÓN DE VIDEO ---
        { nombre: "Synthesia", categoria: "video", imagen: "https://backend.aionlinecourse.com/uploads/ai_software/image/2023/10/synthesia.png", desc: "Presentadores virtuales hiperrealistas.", precio: "Pago" },
        { nombre: "OpusClip", categoria: "video", imagen: "https://asset.brandfetch.io/idMyFW0O1q/ide61u_rax.png", desc: "Convierte videos largos en TikToks virales.", precio: "Freemium" },
        { nombre: "Runway", categoria: "video", imagen: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/runway.png", desc: "Edición de video mágica y generación de cine.", precio: "Pago" },
        { nombre: "HeyGen", categoria: "video", imagen: "https://pnghdpro.com/wp-content/themes/pnghdpro/download/social-media-and-brands/heygen-ai-logo-hd.png", desc: "Traducción de video con doblaje de labios.", precio: "Pago" },
        { nombre: "Pika Labs", categoria: "video", imagen: "https://static.vecteezy.com/system/resources/previews/067/941/705/non_2x/pika-labs-symbol-rounded-hd-free-png.png", desc: "Anima cualquier imagen o texto a video.", precio: "Gratis" },

        // --- 3. GENERACIÓN DE IMÁGENES ---
        { nombre: "Midjourney", categoria: "imagenes", imagen: "https://upload.wikimedia.org/wikipedia/commons/2/24/Midjourney_Emblem.svg", desc: "La mejor calidad artística del mercado.", precio: "Pago" },
        { nombre: "DALL-E 3", categoria: "imagenes", imagen: "https://static.swiftask.ai/profiles/6ea5bbca-3061-4bb1-9cf8-495937188241/user_2403.png", desc: "Integrado en ChatGPT, fácil de usar.", precio: "Pago" },
        { nombre: "Leonardo.ai", categoria: "imagenes", imagen: "Imagenes/leonardo.png", desc: "Creación de assets para videojuegos.", precio: "Freemium" },
        { nombre: "Stable Diffusion", categoria: "imagenes", imagen: "https://avatars.githubusercontent.com/u/100950301?v=4", desc: "Potencia de código abierto en tu PC.", precio: "Gratis" },
        { nombre: "Adobe Firefly", categoria: "imagenes", imagen: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/adobe-firefly-ai-icon.png", desc: "Integrado en Photoshop, seguro para uso comercial.", precio: "Pago" },

        // --- 4. PROGRAMACIÓN ---
        { nombre: "GitHub Copilot", categoria: "programacion", imagen: "https://images.seeklogo.com/logo-png/42/2/github-copilot-logo-png_seeklogo-428029.png", desc: "El estándar de oro para autocompletado.", precio: "Pago" },
        { nombre: "Cursor", categoria: "programacion", imagen: "https://www.cursor.com/brand/icon.svg", desc: "Editor de código nativo con IA integrada.", precio: "Freemium" },
        { nombre: "Tabnine", categoria: "programacion", imagen: "https://tabnine.gallerycdn.vsassets.io/extensions/tabnine/tabnine-vscode/3.328.0/1764330874526/Microsoft.VisualStudio.Services.Icons.Default", desc: "Privacidad total y autocompletado local.", precio: "Freemium" },
        { nombre: "Amazon Q", categoria: "programacion", imagen: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", desc: "Asistente experto en AWS y nube.", precio: "Gratis" },
        { nombre: "Replit Ghost", categoria: "programacion", imagen: "https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/replit-color.png", desc: "Programa, colabora y despliega en el navegador.", precio: "Pago" },

        // --- 5. MARKETING ---
        { nombre: "AdCreative", categoria: "marketing", imagen: "https://storage.googleapis.com/swipe-insight/content/images/sources_logos/adcreative-ai.webp", desc: "Diseña banners que venden solos.", precio: "Pago" },
        { nombre: "Jasper", categoria: "marketing", imagen: "https://www.thetoolsverse.com/jasper.png", desc: "Redactor experto en tono de marca.", precio: "Pago" },
        { nombre: "Copy.ai", categoria: "marketing", imagen: "https://cdn.prod.website-files.com/628288c5cd3e8411b90a36a4/6797ee68ae7908e605a9a4d0_copy_logo-all-dark.svg", desc: "Genera correos y posts en segundos.", precio: "Freemium" },
        { nombre: "Writesonic", categoria: "marketing", imagen: "https://cdn.prod.website-files.com/6878d03e87d55da8b4937a86/6878d03e87d55da8b4937ab2_logo.svg", desc: "Artículos SEO optimizados al instante.", precio: "Freemium" },
        { nombre: "Anyword", categoria: "marketing", imagen: "https://cdn.prod.website-files.com/65a5365ee6f4219bc2d2f822/65ae548143e3b5eca08c4093_Logo.svg", desc: "Predice el rendimiento de tus textos.", precio: "Pago" }
    ];

    function mostrarIAs(filtro) {
        const contenedor = $("#contenedorIAs");
        if(contenedor.length === 0) return;
        contenedor.empty(); 
        const iasFiltradas = baseDatosIAs.filter(ia => filtro === "todas" ? true : ia.categoria === filtro);

        iasFiltradas.forEach(ia => {
            let colorPrecio = ia.precio === "Gratis" || ia.precio === "Freemium" ? "success" : "danger";
            let imagenSrc = ia.imagen.length > 10 ? ia.imagen : "Imagenes/logo.jpg";
            let tarjetaHTML = `
                <div class="col fade-in">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body text-center">
                            <img src="${imagenSrc}" alt="${ia.nombre}" style="height: 60px; margin-bottom: 15px;">
                            <h5 class="card-title">${ia.nombre}</h5>
                            <p class="card-text small text-muted">${ia.desc}</p>
                            <span class="badge bg-${colorPrecio}">${ia.precio}</span>
                        </div>
                        <div class="card-footer bg-transparent border-0 pb-3">
                             <button class="btn btn-primary btn-sm w-100 btn-abrir-modal" data-nombre="${ia.nombre}">⭐ Calificar</button>
                        </div>
                    </div>
                </div>`;
            contenedor.append(tarjetaHTML);
        });
        if (iasFiltradas.length === 0) contenedor.append(`<p class="text-center text-muted w-100">No hay resultados.</p>`);
    }

    if ($("#contenedorIAs").length > 0) {
        mostrarIAs("todas");
        $("#listaCategorias .list-group-item").click(function() {
            $("#listaCategorias .list-group-item").removeClass("active");
            $(this).addClass("active");
            mostrarIAs($(this).data("filtro"));
        });
    }

    // Modal Calificar
    $(document).on("click", ".btn-abrir-modal", function() {
        let nombreIA = $(this).data("nombre");
        $("#nombreIAEnModal").text(nombreIA);
        $("#inputIANombreOculto").val(nombreIA);
        $("#modalCalificar").modal("show");
    });

    $("#formModalComentario").submit(function(e) {
        e.preventDefault();
        let ia = $("#inputIANombreOculto").val();
        let calificacion = $("#selectModalCalificacion").val();
        let comentario = $("#txtModalComentario").val();
        let estrellas = "⭐".repeat(calificacion);
        
        $("#tablaComentarios").append(`<tr><td><strong>${ia}</strong></td><td>${estrellas}</td><td>${comentario}</td><td><button class='btn btn-danger btn-sm btn-borrar'>Eliminar</button></td></tr>`);
        
        $("#formModalComentario")[0].reset();
        $("#modalCalificar").modal("hide");
        $("#mensajeExitoCalificacion").text("✅ Reseña publicada.").fadeIn().delay(3000).fadeOut();
    });
    
    $("#tablaComentarios").on("click", ".btn-borrar", function() { $(this).closest("tr").remove(); });

    // ==========================================
    // 8. MÓDULO DE PAGOS
    // ==========================================
    // Abrir Modal (Solo si hay dinero)
    $("#btnIrAPagar").click(function() {
        let totalTexto = $("#txtTotal").text(); 
        // Convertimos el texto a número para verificar
        let totalNumero = parseFloat(totalTexto.replace('$', '').replace(',', '').trim());

        if (totalNumero === 0 || isNaN(totalNumero)) {
            return alert("El carrito está vacío. Agrega productos primero.");
        }

        // Si pasó la validación, cargamos datos y ABRIMOS la ventana manualmente
        $("#txtTotalModal").text(totalTexto);
        $("#inputNombreTitular").val(""); 
        $("#modalPago").modal("show"); // 
    });

    $("#inputTarjeta").on("input", function() {
        let numero = $(this).val();
        let numeroLimpio = numero.replace(/\D/g, '').substring(0, 16);
        let numeroFormateado = numeroLimpio.match(/.{1,4}/g)?.join(' ') || numeroLimpio;
        $(this).val(numeroFormateado);

        let primerDigito = numeroLimpio.charAt(0);
        let logo = "";
        if (primerDigito === "4") logo = "🔵 VISA";
        else if (primerDigito === "5") logo = "🔴 MASTERCARD";
        else if (primerDigito === "3") logo = "🟢 AMEX";
        else if (primerDigito === "7") logo = "🟠 DINERS";
        $("#logoMarca").text(logo);
    });

    $("#inputVencimiento").on("input", function() {
        let input = $(this).val().replace(/\D/g, '').substring(0, 4);
        if (input.length >= 3) $(this).val(input.substring(0, 2) + '/' + input.substring(2));
        else $(this).val(input);
    });

    $("#selectCuotas").change(function() {
        let cuotas = parseInt($(this).val());
        let textoPrecio = $("#txtTotalModal").text();
        let totalNumero = parseFloat(textoPrecio.replace('$', '').trim());
        if (totalNumero > 0) {
            let valorCuota = totalNumero / cuotas;
            $("#valorCuota").text(valorCuota.toLocaleString('en-US', { style: 'currency', currency: 'USD' }));
            $("#infoCuotas").slideDown(); 
        }
    });

    $("#formPago").on("submit", function(e) {
        e.preventDefault(); 
        let btn = $(this).find("button[type='submit']");
        let textoOriginal = btn.text();
        btn.prop("disabled", true).text("🔄 Procesando...");

        setTimeout(function() {
            alert("✅ ¡PAGO APROBADO!\n\nGracias por tu compra.");
            $("#modalPago").modal("hide");
            btn.prop("disabled", false).text(textoOriginal);
            $("#tablaCarrito").empty();
            $("#txtSubtotal").text("$0.00");
            $("#txtIVA").text("$0.00");
            $("#txtTotal").text("$0.00");
            $(".input-cantidad").val(1);
            subtotalGlobal = 0;
            window.location.href = "catalogo.html";
        }, 2000);
    });

    // ==========================================
    // 9. FORMULARIO DE CONTACTO
    // ==========================================
    $("#formulario-contacto form").submit(function(e) {
        e.preventDefault(); 
        alert("✅ ¡Mensaje enviado correctamente!");
        $(this)[0].reset();
    });

});