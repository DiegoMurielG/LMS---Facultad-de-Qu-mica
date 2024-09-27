import axios from "axios";
import { useEffect, useState } from "react";
import InputBuscador from "./InputBuscador";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function CrearUnCurso() {
  const caracteresParaDescripcion = 250;
  const [caracteresRestantesDescripcion, setCaracteresRestantesDescripcion] =
    useState(caracteresParaDescripcion);
  const [nombre, setNombre] = useState("");
  const [temas, setTemas] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [maestrosDisponibles, setMaestrosDisponibles] = useState([]);
  const [maestrosBuscados, setMaestrosBuscados] = useState("");
  const [maestrosSeleccionados, setMaestrosSeleccionados] = useState([]);
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [alumnosBuscados, setAlumnosBuscados] = useState("");
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
  const [roleSesionUsuario, setRoleSesionUsuario] = useState("alumno");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
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

  const handleCrearCurso = (e) => {
    e.preventDefault();
    let tmpMaestrosSeleccionados = [];
    maestrosSeleccionados.forEach((maestro) => {
      tmpMaestrosSeleccionados.push(maestro._id);
    });
    let tmpAlumnosSeleccionados = [];
    alumnosSeleccionados.forEach((maestro) => {
      tmpAlumnosSeleccionados.push(maestro._id);
    });

    axios
      .post("http://localhost:5000/api/crear-curso", {
        nombre: nombre,
        temas: temas,
        descripcion: descripcion,
        enrolled_users: tmpAlumnosSeleccionados,
        teachers: tmpMaestrosSeleccionados,
      })
      .then((response) => {
        if (response.data.Status === 309) {
          navigate("/");
        } else if (response.data.Status === 308) {
          Swal.fire({
            title: response.data.message,
            showCancelButton: false,
            confirmButtonText: "Continuar",
            icon: "warning",
          });
        } else if (response.data.Status === 305) {
          Swal.fire({
            title: response.data.message,
            showCancelButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          }).then((result) => {
            // alert("Añadir redirección a la página de administrar cursos");
            if (roleSesionUsuario === "admin") {
              navigate("/admin-dashboard/administrar-cursos");
            } else {
              // roleSesionUsuario === "maestro"
              navigate("/dashboard/administrar-cursos");
              // Omito el caso donde el roleSesionUsuario === "otra cosa" || "alumno" porque al cargar el componente si se tiene ese rol se redirige al usuario a la página de Login
            }
          });
        }
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Estas funciones de handleBuscarMaestros, Alumnos y Cursos se pueden reducir a un componente de react, elevar el estado y usar contexto o props según sea necesario.
  const handleBuscarMaestros = (e) => {
    setMaestrosBuscados(e.target.value);
    console.log(`maestrosBuscados: ${maestrosBuscados}`);
    axios
      .post("http://localhost:5000/api/admin/buscar-usuarios", {
        palabra_a_buscar: maestrosBuscados,
        filtro: "maestros",
      })
      .then((response) => {
        console.log(response.data);
        setMaestrosDisponibles(response.data.docs);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleBuscarAlumnos = (e) => {
    setAlumnosBuscados(e.target.value);
    console.log(`alumnosBuscados: ${alumnosBuscados}`);
    axios
      .post("http://localhost:5000/api/admin/buscar-usuarios", {
        palabra_a_buscar: alumnosBuscados,
        filtro: "alumnos",
      })
      .then((response) => {
        console.log(response.data);
        setAlumnosDisponibles(response.data.docs);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  return (
    <div className="w-100 d-flex flex-column justify-content-center align-items-center">
      <h1>Crear un curso</h1>
      <form
        onSubmit={(e) => {
          handleCrearCurso(e);
        }}
        className="d-flex flex-column justify-content-center align-items-center w-25">
        <div className="form-floating mb-3 w-100">
          <input
            type="text"
            className="form-control"
            id="floatingInput-nombre-curso"
            placeholder="Nombre del curso"
            required
            onChange={(e) => {
              setNombre(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-nombre-curso">Nombre del curso</label>
        </div>
        <div className="form-floating mb-3 w-100">
          <input
            type="text"
            className="form-control"
            id="floatingInput-temas-curso"
            placeholder="Temas que toca el curso"
            required
            onChange={(e) => {
              setTemas(e.target.value);
            }}
          />
          <label htmlFor="floatingInput-temas-curso">Temas que toca el curso</label>
        </div>
        <div className="form-floating position-relative w-100">
          <textarea
            style={{ height: "100px" }}
            className="form-control mb-3"
            placeholder="Descripción del curso"
            id="floatingTextarea-descripcion-curso"
            maxLength={250}
            onChange={(e) => {
              setCaracteresRestantesDescripcion(caracteresParaDescripcion - e.target.value.length);
              setDescripcion(e.target.value);
            }}></textarea>
          <label htmlFor="floatingTextarea-descripcion-curso">
            Descripción del curso {caracteresRestantesDescripcion}/{caracteresParaDescripcion}
          </label>
        </div>
        <div className="form-floating mb-3">
          <InputBuscador
            name="maestrosBuscados"
            id="floatingInput-maestros"
            placeholder="Busca maestros por nombre o correo"
            label="Maestros que lo administran"
            onChange={(e) => {
              handleBuscarMaestros(e);
            }}
            value={maestrosBuscados}
            // searching={"maestros"}
            elementosDisponibles={maestrosDisponibles}
            elementosSeleccionados={maestrosSeleccionados}
            setElementosSeleccionados={setMaestrosSeleccionados}
            aQuienAsignamos="curso"
            queBuscamos="maestro"
          />
        </div>
        <div className="form-floating mb-3">
          <InputBuscador
            name="alumnosBuscados"
            id="floatingInput-alumnos"
            placeholder="Busca alumnos por nombre o correo"
            label="Alumnos a inscribir"
            onChange={(e) => {
              handleBuscarAlumnos(e);
            }}
            value={alumnosBuscados}
            // searching={"alumnos"}
            elementosDisponibles={alumnosDisponibles}
            elementosSeleccionados={alumnosSeleccionados}
            setElementosSeleccionados={setAlumnosSeleccionados}
            aQuienAsignamos="curso"
            queBuscamos="alumno"
          />
        </div>
        <button
          type="submmit"
          className="btn btn-outline-success d-flex justify-content-center align-items-center w-100">
          <p className="m-0 me-2 p-0">Crear curso</p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-plus-circle-fill"
            viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
