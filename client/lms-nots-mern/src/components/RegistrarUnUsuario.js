import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import RegistrarUnUsuarioPermisoAdmin from "./RegistrarUnUsuarioPermisoAdmin";
import RegistrarUnUsuarioPermisoMaestro from "./RegistrarUnUsuarioPermisoMaestro";

export default function RegistrarUnUsuario() {
  const [warning, setWarning] = useState(null);
  const [visibilidadRegistrarUnUsuario, setVisibilidadRegistrarUnUsuario] = useState("visible");
  const [visibilidadRegistrarMuchosUsuarios, setVisibilidadRegistrarMuchosUsuarios] =
    useState("oculto");
  const [roleSesionUsuario, setRoleSesionUsuario] = useState("alumno");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .post("http://localhost:5000/api/obtener-role-usuario")
      .then((response) => {
        if (response.data.Status === 220) {
          setRoleSesionUsuario("admin");
        } else if (response.data.Status === 221) {
          setRoleSesionUsuario("maestro");
        } else {
          // response.data.Status === 222
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleSignupForm = () => {
    if (roleSesionUsuario === "admin") {
      return (
        <RegistrarUnUsuarioPermisoAdmin
          visibilidadRegistrarUnUsuario={visibilidadRegistrarUnUsuario}
          warning={warning}
        />
      );
    } else {
      // roleSesionUsuario === "maestro";
      // return (
      //   <RegistrarUnUsuarioPermisoMaestro
      //     visibilidadRegistrarUnUsuario={visibilidadRegistrarUnUsuario}
      //     warning={warning}
      //   />
      // );
    }
  };
  // const handleSignupForm = () => {
  //   if (roleSesionUsuario === "admin") {
  //     return class SignupForm extends React.Component {
  //       render() {
  //         return (
  //           <>
  //             <RegistrarUnUsuarioPermisoAdmin
  //               visibilidadRegistrarUnUsuario={visibilidadRegistrarUnUsuario}
  //               warning={warning}
  //             />
  //           </>
  //         );
  //       }
  //     };
  //   } else {
  //     // roleSesionUsuario === "maestro";
  //     return class extends React.Component {
  //       render() {
  //         return (
  //           <>
  //             <RegistrarUnUsuarioPermisoMaestro
  //               visibilidadRegistrarUnUsuario={visibilidadRegistrarUnUsuario}
  //               warning={warning}
  //             />
  //           </>
  //         );
  //       }
  //     };
  //   }
  // };

  // const handleSignupFormComponent = handleSignupForm();

  const toggleTipoRegistro = () => {
    // Al hacer click en el switch de registrar usuario cambiamos la visibilidad de cada elemento
    if (visibilidadRegistrarUnUsuario === "visible") {
      setVisibilidadRegistrarUnUsuario("oculto");
      setVisibilidadRegistrarMuchosUsuarios("visible");
    } else {
      setVisibilidadRegistrarUnUsuario("visible");
      setVisibilidadRegistrarMuchosUsuarios("oculto");
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center">
      {/* <div className=""></div> */}
      <h1 className="mb-3">Registrar usuarios</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="form-check form-switch d-flex justify-content-evenly align-items-center position-relative bg-body-tertiary rounded-3 border-light-subtle border py-3 w-100">
          <label className="form-check-label me-5" htmlFor="flexSwitchCheckDefault">
            Registrar Usuario
          </label>
          &nbsp;
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="flexSwitchCheckDefault"
            onClick={toggleTipoRegistro}
          />
          <label className="form-check-label ms-3 me-4" htmlFor="flexSwitchCheckDefault">
            Registrar Usuarios
          </label>
        </div>
        {/* <button
          className="btn btn-primary mx-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#registrar-usuario"
          aria-expanded="false"
          aria-controls="collapseExample">
          Registrar usuario
        </button>
        &nbsp;
        <button
          className="btn btn-primary"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#registrar-varios-usuarios"
          aria-expanded="false"
          aria-controls="collapseExample">
          Registrar varios usuarios
        </button> */}
      </div>
      {/* <div className="collapse" id="collapseExample">
        <div className="card card-body">
          Some placeholder content for the collapse component. This panel is hidden by default but
          revealed when the user activates the relevant trigger.
        </div>
      </div> */}
      {/* {handleSignupFormComponent} */}
      {handleSignupForm()}

      {/* <Link to="/" className="btn btn-dark btn-outline-light w-100 rounded-50 my-1">
        Iniciar sesión
      </Link> */}
      <div
        className={visibilidadRegistrarMuchosUsuarios === "visible" ? "w-100" : "collapse w-100"}
        id="registrar-varios-usuarios">
        <div className="d-flex flex-column bg-body-tertiary rounded-3 border-dark-subtle">
          <div className="h-25 bg-body-secondary rounded-3 border-dark-subtle">
            <p>Guía</p>
          </div>
          <div className="h-25 bg-body-secondary rounded-3 border-dark-subtle">
            <p>Guía</p>
          </div>
          <div className="h-25 bg-body-secondary rounded-3 border-dark-subtle">
            <p>Guía</p>
          </div>
          <div className="h-25 bg-body-secondary rounded-3 border-dark-subtle">
            <p>Guía</p>
          </div>
          <div className="h-25 bg-body-secondary rounded-3 border-dark-subtle">
            <p>Guía</p>
          </div>
        </div>
      </div>
    </div>
  );
}
