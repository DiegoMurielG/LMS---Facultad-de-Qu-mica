const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
// Para mandar archivos desde el servidor al front-end
const path = require("path");
const UserModel = require("./models/User.js");
const rutaUsuarios = require("./rutas/usuario.js");
const rutaCursos = require("./rutas/curso.js");

// Configurar la app
const PORT = 5000;
const app = express();
// Configuramos a express para que convierta los datos que recive a formato json
// app.use(
//   cors({
//     origin: ["https://lms-facultad-de-quimica-frontend-t7ra.onrender.com", "http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
// Configura CORS para tu dominio frontend
app.use(
  cors({
    origin: ["https://lms-facultad-de-quimica-frontend-t7ra.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Configura los encabezados permitidos
    credentials: true, // Si es necesario, habilita las credenciales
  })
);

// Configura las preflight requests explícitamente
// app.options("*", cors()); // Esto permite que todas las rutas respondan a preflight

// app.options("/api/*", (req, res) => {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "https://lms-facultad-de-quimica-frontend-t7ra.onrender.com"
//   );
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   res.setHeader("Access-Control-Allow-Credentials", "true"); // Si es necesario
//   res.sendStatus(204); // Sin contenido
// });

// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
app.use(express.json());
app.use(cookieParser());

// Para mandar archivos desde el servidor al front-end
// De esta forma configuramos el servidor para servir archivos estáticos desde la carpeta "public"
app.use("/public", express.static(path.join(__dirname, "public")));

mongoose.connect("mongodb://127.0.0.1:27017/lmsquimica");
// Creamos una conexión y la guardamos en el 'objetodb'
const objetodb = mongoose.connection;

// Hacemos que el la DB 'objetodb' escuche al evento 'connected', y que en caso de ocurrir ejecuta la función que tiene a continuación
objetodb.on("connected", () => {
  console.log("Conexión correcta a MongoDB");
});

// Hacemos que el la DB 'objetodb' escuche al evento 'error', y que en caso de ocurrir ejecuta la función que tiene a continuación
objetodb.on("error", () => {
  console.log("Error en la conexión  a MongoDB");
});

app.use("/api", rutaUsuarios);
app.use("/api", rutaCursos);

// Así probamos la conexión al servidor, entramos a la URL: localhost:5000/api
app.get("/api", (request, response) => {
  // con response.end("Mensaje") mandamos información desde el backend (Generamos una respuesta)
  response.end("Bienvenido al servidor backend con Node.js");
});

app.listen(PORT, () => {
  console.log(`Server is runing in port ${PORT}`);
});
