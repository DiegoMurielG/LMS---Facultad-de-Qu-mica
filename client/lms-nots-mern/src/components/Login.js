import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [warning, setWarning] = useState(null);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/iniciar-sesion", { email, password })
      .then((response) => {
        setWarning(response.data.message);
        // console.log(response.data);

        if (response.data.Status === 200) {
          if (response.data.role === "admin") {
            // Si eres admin, navegamos a la ruta de localhost:3000/dashboard
            // Ya tenemos que tener creada la ruta en la App
            navigate("/admin-dashboard");
          } else if (response.data.role === "maestro") {
            navigate("/dashboard");
          } else {
            navigate("/home");
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-secondary vh-100">
      <div className="bg-dark p-3 rounded w-25 mb-3">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
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
            Iniciar sesión
          </button>
        </form>
        {warning ? <span className="important text-danger">{warning}</span> : <></>}
        {/* <Link
          to="/registrar-usuario"
          className="btn btn-dark btn-outline-light w-100 rounded-50 my-1">
          Registrarse
        </Link> */}
      </div>
      <div className="bg-body-tertiary p-3 rounded w-50">
        <p className="text-warning-emphasis">
          Para que la app funcione correctamente, configure su navegador para aceptar cookies de
          terceros.
        </p>
        <p className="text-info-emphasis">
          En su navegador vaya a configuración &gt; cookies &gt; cookies de terceros &gt; Permitir
          coockies de terceros
        </p>
      </div>
    </div>
  );
}
