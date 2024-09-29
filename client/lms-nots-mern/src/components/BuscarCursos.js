import axios from "axios";
import { useEffect, useState } from "react";
import UsuarioIndividual from "./UsuarioIndividual";
import AdministrarUsuarioPropio from "./AdministrarUsuarioPropio";
import TituloUsuariosEncontrados from "./TituloUsuariosEncontrados";
import TituloCursosEncontrados from "./TituloCursosEncontrados";
import CursoIndividual from "./CursoIndividual";
export default function BuscarCursos() {
  const [word_to_search, setWord_to_search] = useState("");
  const [filter, setFilter] = useState("todos");
  const [datos_cursos, setDatos_cursos] = useState([]);
  const [lista_cursos, setLista_cursos] = useState(<></>);
  const [cliked_busqueda, setCliked_busqueda] = useState(false);
  const [nombresMaestros, setNombresMaestros] = useState("");
  const [nombresAlumnos, setNombresAlumnos] = useState("");
  const [role_usuario, setRole_usuario] = useState("alumno");
  // let lista_cursos

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });
  // axios.defaults.withCredentials = true;

  // Mostrar tu usario al cargar la página
  useEffect(() => {
    api
      .post("/obtener-role-usuario")
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 220) {
          setRole_usuario("admin");
        } else if (response.data.Status === 221) {
          setRole_usuario("maestro");
        } else {
          // response.data.Status === 222
          setRole_usuario("alumno");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  function asignarListaCursos() {
    setLista_cursos(<></>);

    setLista_cursos(
      datos_cursos.map((curso, index) => {
        return (
          <div
            key={index}
            className="bg-dark d-flex flex-column align-items-start justify-content-center border border-3 border-light-subtle rounded-2 p-3 mb-3">
            <CursoIndividual datos_curso={curso} role_usuario={role_usuario} />
          </div>
          // <div
          //   className="bg-dark d-flex flex-column align-items-start justify-content-center border border-3 border-light-subtle rounded-2 p-3 mb-3"
          //   key={index}>
          //   <h3>{curso.nombre}</h3>
          //   <p className="text-start">Temas: {curso.temas}</p>
          //   <p className="text-start">Descripción del curso: {curso.descripcion}</p>
          //   <p className="text-start">Alumnos inscritos: {curso.enrolled_users}</p>
          //   <p className="text-start">Maestros: {curso.teachers}</p>
          // </div>
        );
      })
    );
    // const lista_cursos = [datos_cursos].map((usuario, index) => {
    //   return (
    //     <div key={index}>
    //       <UsuarioIndividual usuario={usuario} />
    //     </div>
    //   );
    // });
    // return lista_cursos;
    // console.log(datos_cursos);
    // return lista_cursos;
  }

  // const handleSearchCourses = (e) => {
  //   e.preventDefault();
  //   // console.log(`Buscar a ${word_to_search} con el filtro de ${filter}`);
  //   api
  //     .post("/buscar-cursos", {
  //       palabra_a_buscar: word_to_search,
  //       filtro: filter,
  //     })
  //     .then((response) => {
  //       console.log(response.data);
  //       // setDatos_cursos([]);
  //       setDatos_cursos(response.data.docs);
  //       console.log(datos_cursos);
  //       for (let i = 0; i < datos_cursos.length; i++) {
  //         let curso = datos_cursos.at(i);
  //         const ids_maestrosDelCurso = Array.from(curso.teachers);
  //         const ids_alumnosDelCurso = Array.from(curso.enrolled_users);

  //         console.log(`ids_maestrosDelCurso: ${JSON.stringify(ids_maestrosDelCurso)}`);
  //         console.log(
  //           `typeof ids_maestrosDelCurso array? ${
  //             Object.prototype.toString.call(ids_maestrosDelCurso) == "[object Array]"
  //           }`
  //         );
  //         console.log(`ids_maestrosDelCurso.length: ${ids_maestrosDelCurso.length}`);

  //         if (ids_maestrosDelCurso.length == 0) {
  //           // setNombresMaestros("No hay maestros impartiendo el curso.");
  //           curso.teachers = "No hay maestros impartiendo el curso.";
  //         } else {
  //           api
  //             .post("/buscar-nombres-con-ids", {
  //               ids: ids_maestrosDelCurso.join(","),
  //             })
  //             .then((nombres) => {
  //               // setNombresMaestros(nombres);
  //               curso.teachers = nombres;
  //             })
  //             .catch((error) => {
  //               console.log(error);
  //             });
  //         }

  //         if (ids_alumnosDelCurso.length == 0) {
  //           // setNombresAlumnos("No hay alumnos inscritos en el curso.");
  //           curso.enrolled_users = "No hay alumnos inscritos en el curso.";
  //         } else {
  //           api
  //             .post("/buscar-nombres-con-ids", {
  //               ids: ids_alumnosDelCurso.join(","),
  //             })
  //             .then((nombres) => {
  //               // setNombresAlumnos(nombres);
  //               curso.enrolled_users = nombres;
  //             })
  //             .catch((error) => {
  //               console.log(error);
  //             });
  //         }

  //         // Actualizamos el data_cursos para modificar el curso actual y así sustituir los ID´s de maestros y alumnos por sus nombres
  //         let tmp_datos_cursos = datos_cursos;
  //         tmp_datos_cursos[i] = curso;
  //         console.log(`tmp_datos_cursos[i]: ${JSON.stringify(tmp_datos_cursos[i])}`);
  //         setDatos_cursos(tmp_datos_cursos);
  //       }
  //       asignarListaCursos();
  //       // lista_cursos = [datos_cursos].map((usuario, index) => {
  //       //   return (
  //       //     <div key={index}>
  //       //       <UsuarioIndividual usuario={usuario} />
  //       //     </div>
  //       //   );
  //       // });
  //       setCliked_busqueda(true);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  const handleSearchCourses = (e) => {
    e.preventDefault();

    api
      .post("/buscar-cursos", {
        palabra_a_buscar: word_to_search,
        filtro: filter,
      })
      .then((response) => {
        const fetchedCourses = response.data.docs;
        const updateCoursePromises = fetchedCourses.map((curso) => {
          const ids_maestrosDelCurso = Array.from(curso.teachers);
          const ids_alumnosDelCurso = Array.from(curso.enrolled_users);

          const teacherNamesPromise = ids_maestrosDelCurso.length
            ? api
                .post("/buscar-nombres-con-ids", {
                  ids: ids_maestrosDelCurso.join(","),
                })
                .then((response) => {
                  curso.teachers = response.data.docs.map((usuario) => usuario.nombre).join(", ");
                })
                .catch((error) => {
                  console.error(error);
                  curso.teachers = "Error fetching teachers";
                })
            : Promise.resolve((curso.teachers = "No hay maestros impartiendo el curso."));

          const studentNamesPromise = ids_alumnosDelCurso.length
            ? api
                .post("/buscar-nombres-con-ids", {
                  ids: ids_alumnosDelCurso.join(","),
                })
                .then((response) => {
                  curso.enrolled_users = response.data.docs
                    .map((usuario) => usuario.nombre)
                    .join(", ");
                })
                .catch((error) => {
                  console.error(error);
                  curso.enrolled_users = "Error fetching students";
                })
            : Promise.resolve((curso.enrolled_users = "No hay alumnos inscritos en el curso."));

          return Promise.all([teacherNamesPromise, studentNamesPromise]).then(() => curso);
        });
        Promise.all(updateCoursePromises)
          .then((updatedCourses) => {
            setDatos_cursos(updatedCourses);
            asignarListaCursos();
            setCliked_busqueda(true);
          })
          .catch((error) => {
            console.error("Error updating courses:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  };

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-content-center mb-5">
        <h1 className="mb-3">Buscar cursos</h1>
        <form className="w-100 mb-3" onSubmit={handleSearchCourses}>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o ID"
              aria-label="Text input with segmented dropdown button"
              onChange={(e) => {
                setWord_to_search(e.target.value);
              }}
            />
            <select
              className="form-select"
              defaultValue="todos"
              id="inputGroupSelect01"
              onChange={(e) => {
                setFilter(e.target.value);
              }}>
              <option value="todos">Mostrar todos</option>
              {/* <option value="maestros">Mostrar solo maestr@s</option>
              <option value="alumnos">Mostrar solo alumn@s</option> */}
            </select>
            <button type="submit" className="btn btn-outline-primary">
              Buscar
            </button>
          </div>
        </form>
        <TituloCursosEncontrados cliked_search={cliked_busqueda} />
        {lista_cursos.length > 0 ? lista_cursos : <h2>No se encontrarón cursos</h2>}
      </div>
    </>
  );
}
