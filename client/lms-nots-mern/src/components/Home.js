import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ExplorarCursos from "./ExplorarCursos";
import EditarPerfil from "./EditarPerfil";
import CerrarSesion from "./CerrarSesion";
import RenderCurso from "./RenderCurso";
import Swal from "sweetalert2";

export default function Home() {
  const params = useParams();
  const { opcion_navbar } = params;

  const [loginSuccessful, setLoginSuccessful] = useState();
  const navigate = useNavigate();
  const location = useLocation();

  // Acceder al estado creado por navigate() en RenderCurso al guardar correctamente las respuestas, este estado está en location.state
  const respuesta_contestar_curso = location.state?.response_data;
  axios.defaults.withCredentials = true;
  const [navbar_visibility_clases, setNavbar_visibility_clases] = useState(
    "nav nav-underline flex-column w-25 d-lg-block fs-3 d-none"
  );
  const visibility_on_clases = "position-absolute top-50 start-0 translate-middle-y";
  const height_navbar_percentage = 8;

  useEffect(() => {
    axios
      .get("https://lms-facultad-de-quimica.onrender.com/api/home")
      .then((response) => {
        console.log(response.data);
        // alert(`${response.data.message}`);
        // State is used to tell if we succeeded (200) or not (other)
        if (response.data.Status === 200) {
          setLoginSuccessful("Login succeeded");
        } else {
          // If not succeeded with correct login, go back to login page
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const handleNavbar = () => {
    if (navbar_visibility_clases.includes(visibility_on_clases)) {
      setNavbar_visibility_clases(
        navbar_visibility_clases.replace(visibility_on_clases, "") + "d-none"
      );
    } else {
      setNavbar_visibility_clases(
        (navbar_visibility_clases + visibility_on_clases).replace("d-none", "")
      );
    }
  };

  let urlsDict = {
    // "Editar Usuario": [/\/admin-dashboard\/editar-usuario\/.+/, { component: <EditarUsuario /> }],
    // "Crear Curso": [
    //   /\/admin-dashboard\/administrar-cursos\/crear-curso/,
    //   { component: <CrearUnCurso /> },
    // ],
    // "Editar Curso": [/\/admin-dashboard\/editar-curso\/.+/, { component: <EditarCurso /> }],
    // "Explorar Cursos": [/\/home\/cursos/, { component: <ContestarCurso /> }],
    // "Editar Perfil": [/\/home\/editar-perfil/, { component: <EditarPerfil /> }],
    "Contestar Curso": [/\/cursos\/contestar-curso\/.+/, { component: <RenderCurso /> }],
  };

  const handleRender = (opcion_navbar) => {
    if (!opcion_navbar) {
      const url = location.pathname;
      console.log(url);
      // Para URL's que sean hijas de Home
      for (let key in urlsDict) {
        let arrayWithValue = urlsDict[key];
        if (url.match(arrayWithValue.at(0))) {
          return arrayWithValue.at(1).component;
        }
      }
      return <p className="fs-1">Aquí puedes acceder a todas las funciones primarias de la app</p>;
    }
    if (opcion_navbar === "cursos") {
      return <ExplorarCursos />;
    } else if (opcion_navbar === "editar-perfil") {
      return <EditarPerfil />;
    } else {
      // /admin-dashboard/cerrar-sesion
      return <CerrarSesion />;
    }
  };

  const displayMessage = () => {
    // En el caso de venir de contestar un curso y guardar las respuestas correctamente (RenderCurso)
    if (respuesta_contestar_curso && respuesta_contestar_curso.Status === 207) {
      Swal.fire({
        title: "Curso contestado correctamente, gracias",
        text: respuesta_contestar_curso.message,
        showCancelButton: false,
        icon: "success",
      });
    }
  };
  return (
    <div className="w-100 h-100">
      {displayMessage()}
      <div
        className="d-flex justify-content-evenly"
        style={{ height: `${height_navbar_percentage}%` }}>
        <button
          type="button"
          className="btn rounded-3 p-2 object-fit-contain fs-1 d-lg-none d-flex justify-content-center align-content-center"
          style={{ aspectRatio: "1/1" }}
          onClick={handleNavbar}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            fill="currentColor"
            className="bi bi-list"
            viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
        </button>
        <h1 className="">Home</h1>
      </div>
      <div className="d-flex w-100 position-relative h-100">
        <ul
          className={navbar_visibility_clases}
          // border border-5 border-white position-fixed z-3
          // style={{ height: `92%`, marginTop: `-4%`, width: `100vh`, top: "8vh", left: "0px" }}
          id="navbar">
          <li className="nav-item">
            {/* active */}
            <a className="nav-link" aria-current="Estás en Home" href="/home/cursos">
              Cursos
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/home/editar-perfil">
              Editar perfil
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="/home/cerrar-sesion">
              Cerrar sesión
            </a>
          </li>
        </ul>
        <div className="d-flex flex-column align-items-center w-100" style={{ height: "100vh" }}>
          {handleRender(opcion_navbar)}
          <div className="d-flex flex-column justify-content-center align-items-center w-100 bg-body-tertiary mt-5 py-3">
            <p className="m-0 p-0">LMS Facultad de Química</p>
            <p>
              PE202424 - Elaboracion de herramientas digitales para el diseño y obtencion de curvas
              de calibracion como instrumentos para reforzar el aprendizaje de habilidades de
              quimica analitica en problemas aplicados en los laboratorios de quimica de alimentos.
            </p>
          </div>
          {/* <p>{props.content}</p> */}
        </div>
      </div>

      <div>
        {/* <Router>
          <Routes>
            <Route path="/administrar-usuarios" element={AdministrarUsaurios}></Route>
          </Routes>
        </Router> */}
      </div>
    </div>
  );
}
