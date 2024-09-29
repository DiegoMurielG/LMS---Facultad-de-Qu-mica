import axios from "axios";
import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function RegistrarUnUsuarioPermisoMaestro(props) {
  const { visibilidadRegistrarUnUsuario, warning } = props;
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = Navigate();

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });
  // let warning = null;

  const handleSubmitPermisoMaestro = (e) => {
    e.preventDefault();
    api
      .post("/registrar-usuario", {
        nombre,
        email,
        password,
      })
      .then((response) => {
        // alert(`${response.data.message}`);
        warning = response.data.message;
        console.log(response);
        if (response.data.status === 205) {
          navigate(0);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <>
      {/* Form con permisos de maestro */}
      <form
        onSubmit={handleSubmitPermisoMaestro}
        id="registrar-usuario"
        className={visibilidadRegistrarUnUsuario === "visible" ? "  w-50" : "collapse"}>
        {/* Nombre */}
        <div className="form-floating mb-3">
          <input
            type="text"
            name="nombre"
            className="form-control"
            id="floatingInput-nombre"
            autoComplete="on"
            placeholder="Tu nombre"
            onChange={(e) => {
              setNombre(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-nombre">Nombre</label>
        </div>
        {/* Correo */}
        <div className="form-floating mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            id="floatingInput-email"
            autoComplete="on"
            placeholder="tu@correo.com"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-email">Dirección de correo</label>
        </div>
        {/* Contraseña */}
        <div className="form-floating mb-3">
          <input
            type="password"
            name="passwprd"
            className="form-control"
            id="floatingInput-password"
            autoComplete="on"
            placeholder="Contraseña"
            minLength={6}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-password" className="important">
            Constraseña
          </label>
        </div>

        <button type="submit" className="btn btn-success w-100 rounded-50 mb-1">
          Registrar Usuario
        </button>
        {warning ? <span className="important text-danger">{warning}</span> : <></>}
      </form>
    </>
  );
}
