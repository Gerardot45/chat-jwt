const url = window.location.hostname.includes("localhost")
  ? "http://localhost:8080/api/auth/"
  : "https://restserver-curso-fher.herokuapp.com/api/auth/";
let usuario = null;
let socket = null;

//referencias HTML
const txtUid = document.querySelector("#txtUid");
const txtMensaje = document.querySelector("#txtMensaje");
const ulUsuarios = document.querySelector("#ulUsuarios");
const ulMensajes = document.querySelector("#ulMensajes");
const btnSalir = document.querySelector("#btnSalir");

const validarJWT = async () => {
  //
  const token = localStorage.getItem("token");
  if (token.length <= 10) {
    window.location = "index.html";
    return new Error("No hay token en la petición");
  }

  const respuesta = await fetch(url, {
    headers: { "x-token": token },
  });

  const { usuario: userDB, token: tokenDB } = await respuesta.json();
  localStorage.setItem("token", tokenDB);
  usuario = userDB;
  document.title = usuario.nombre;

  await conectarSocket();
};

const conectarSocket = async () => {
  socket = io({
    extraHeaders: {
      "x-token": localStorage.getItem("token"),
    },
  });

  socket.on("connect", () => {
    console.log("Socket Online");
  });

  socket.on("disconnect", () => {
    console.log("Socket Offline");
  });

  socket.on("recibir-mensajes", dibujarMensajes);
  socket.on("usuarios-activos", dibujarUsuarios);

  socket.on("mensaje-privado", (payload) => {
    //TODO: recibir losm mensajes
    console.log("Privado: ", payload);
  });
};

const dibujarUsuarios = (usuarios = []) => {
  let usershtml = "";
  usuarios.forEach(({ nombre, uid }) => {
    usershtml += `
        <li>
            <p>
                <h5 class="text-success">${nombre}</h5>
                <span class="fs-6" text-muted>${uid}</span>
            </p>
        </li>
        `;
  });

  ulUsuarios.innerHTML = usershtml;
};

const dibujarMensajes = (mensajes = []) => {
    let mensajesHtml = "";
    mensajes.forEach(({ nombre, mensaje }) => {
      mensajesHtml += `
          <li>
              <p>
                  <span class="text-primary">${nombre}</span>
                  <span>${mensaje}</span>
              </p>
          </li>
          `;
    });
  
    ulMensajes.innerHTML = mensajesHtml;
  };

txtMensaje.addEventListener("keyup", ({ keyCode }) => {
  const mensaje = txtMensaje.value;
  const uid = txtUid.value;
  if (keyCode !== 13) {
    return;
  }
  if (mensaje.length === 0) {
    return;
  }

  socket.emit("enviar-mensaje", { mensaje, uid });
  txtMensaje.value = "";
});

const main = async () => {
  await validarJWT();
};

main();
