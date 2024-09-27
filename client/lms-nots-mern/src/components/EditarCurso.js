import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CursoIndividual from "./CursoIndividual";
import Swal from "sweetalert2";
import InputBuscador from "./InputBuscador.js";
import EditarSecciones from "./EditarSecciones.js";

export default function EditarCurso() {
  const params = useParams();
  const [idCurso, setIdCurso] = useState("");
  const [nombreCurso, setNombreCurso] = useState("Cargando...");
  const [temasCurso, setTemasCurso] = useState("Cargando...");
  const [descripcionCurso, setDescripcionCurso] = useState("Cargando...");
  const [alumnosCurso, setAlumnosCurso] = useState("Cargando...");
  const [maestrosCurso, setMaestrosCurso] = useState("Cargando...");
  const [role_usuario, setRole_usuario] = useState("alumno");
  const [datos_cursos, setDatos_cursos] = useState([]);
  const [lista_cursos, setLista_cursos] = useState(<></>);

  // Input buscador
  const [alumnosDisponibles, setAlumnosDisponibles] = useState([]);
  const [alumnosBuscados, setAlumnosBuscados] = useState("");
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);

  const [maestrosBuscados, setMaestrosBuscados] = useState("");
  const [maestrosDisponibles, setMaestrosDisponibles] = useState([]);
  const [maestrosSeleccionados, setMaestrosSeleccionados] = useState([]);

  // Alumnos ya inscritos en el curso
  const [alumnos, setAlumnos] = useState([]);

  // Maestros ya inscritos en el curso
  const [maestros, setMaestros] = useState([]);

  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  // function asignarListaCursos() {
  //   setLista_cursos(<></>);

  //   setLista_cursos(
  //     datos_cursos.map((curso, index) => {
  //       setNombreCurso(curso.nombre);
  //       return (
  //         <div
  //           key={index}
  //           className="bg-dark d-flex flex-column align-items-start justify-content-center border border-3 border-light-subtle rounded-2 p-3 mb-3">
  //           <h3>{curso.nombre}</h3>
  //           <p className="text-start">Temas: {curso.temas}</p>
  //           <p className="text-start">Descripción del curso: {curso.descripcion}</p>
  //           <p className="text-start">Alumnos inscritos: {curso.enrolled_users}</p>
  //           <p className="text-start">Maestros: {curso.teachers}</p>
  //           <div className="container d-flex justify-content-center align-content-center">
  //             {/* Ruta dinámica, ya que el isUsuario cambia según el usuario a editar */}
  //             {role_usuario === "admin" ? (
  //               <Link
  //                 className="btn btn-success w-25"
  //                 to={`/admin-dashboard/editar-curso/${curso._id}`}>
  //                 <p className="m-0 p-0">Editar</p>
  //               </Link>
  //             ) : (
  //               <></>
  //             )}
  //             {role_usuario === "maestro" ? (
  //               <Link className="btn btn-success w-25" to={`/dashboard/editar-curso/${curso._id}`}>
  //                 <p className="m-0 p-0">Editar</p>
  //               </Link>
  //             ) : (
  //               <></>
  //             )}
  //             {role_usuario === "alumno" ? (
  //               <Link className="btn btn-success w-25" to={`/perfil/editar-curso/${curso._id}`}>
  //                 <p className="m-0 p-0">Editar</p>
  //               </Link>
  //             ) : (
  //               <></>
  //             )}
  //             {/* &nbsp; = no break-space, lo que quiere decir que el 1er botón y el 2ndo siempre estarán separados por un poco de espacio pero nunca en una línea diferente sin importar el layout, googleando &nbsp se entiende lo que hace.
  //         Pero básicamente agrega un espacio entre elementos y además evita que este espacio se pueda "romper" por un salto de línea, evitando así que por cuestiones de tamaño de pantalla y layout, el elemento 1 quede arriba y el elemento 2 abajo.
  //         Referencia: http://codexexempla.org/articulos/2008/nbsp.php */}
  //             &nbsp;
  //             <button
  //               className="btn btn-danger ms-3 w-25"
  //               onClick={() => {
  //                 confirmarBorrarCurso(curso._id, curso.nombre);
  //               }}
  //               data-bs-toggle="tooltip"
  //               data-bs-placement="top"
  //               data-bs-title="Tooltip on top">
  //               Borrar
  //             </button>
  //             <hr className="mt-3"></hr>
  //           </div>
  //         </div>
  //       );
  //     })
  //   );
  // }

  useEffect(() => {
    getDataCurso(idCurso);
  }, [idCurso]);

  useEffect(() => {
    const obtenerAlumnos = async () => {
      if (
        datos_cursos.enrolled_users?.length > 0 &&
        datos_cursos.enrolled_users != [] &&
        datos_cursos.enrolled_users != "No hay alumnos inscritos en el curso."
      ) {
        const alumnosPromises = datos_cursos.enrolled_users.map(async (id_alumno_individual) => {
          const response = await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/buscar-usuarios-por-id",
            {
              id_de_usuario_a_buscar: id_alumno_individual.toString(),
            }
          );
          return response.data.docs;
        });
        const alumnosData = await Promise.all(alumnosPromises);
        setAlumnos(alumnosData);
      }
    };

    obtenerAlumnos();
  }, [datos_cursos.enrolled_users]);

  useEffect(() => {
    const obtenerMaestros = async () => {
      if (
        datos_cursos.teachers?.length > 0 &&
        datos_cursos.teachers != [] &&
        datos_cursos.teachers != "No hay maestros impartiendo el curso." &&
        datos_cursos.teachers != undefined
      ) {
        const maestrosPromises = datos_cursos.teachers.map(async (id_maestro_individual) => {
          const response = await axios.post(
            "https://lms-facultad-de-quimica.onrender.com/api/buscar-usuarios-por-id",
            {
              id_de_usuario_a_buscar: id_maestro_individual.toString(),
            }
          );
          return response.data.docs;
        });
        const maestrosData = await Promise.all(maestrosPromises);
        setMaestros(maestrosData);
      }
    };

    obtenerMaestros();
  }, [datos_cursos.teachers]);

  const getDataCurso = async (id_curso) => {
    await axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-cursos", {
        palabra_a_buscar: `#: ${id_curso}`,
        filtro: "todos",
      })
      .then((response) => {
        const fetchedCourses = response.data.docs;
        if (fetchedCourses[0]) {
          setDatos_cursos(fetchedCourses[0]);
        }
        const updateCoursePromises = fetchedCourses.map(async (curso) => {
          const ids_maestrosDelCurso = Array.from(curso.teachers);
          const ids_alumnosDelCurso = Array.from(curso.enrolled_users);

          const teacherNamesPromise = ids_maestrosDelCurso.length
            ? axios
                .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-nombres-con-ids", {
                  ids: ids_maestrosDelCurso.join(","),
                })
                .then((response) => {
                  // curso.teachers = response.data.docs.map((usuario) => usuario.nombre).join(", ");
                })
                .catch((error) => {
                  console.error(error);
                  curso.teachers = "Error fetching teachers";
                })
            : Promise.resolve((curso.teachers = "No hay maestros impartiendo el curso."));

          const studentNamesPromise = ids_alumnosDelCurso.length
            ? axios
                .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-nombres-con-ids", {
                  ids: ids_alumnosDelCurso.join(","),
                })
                .then((response) => {
                  // curso.enrolled_users = response.data.docs
                  //   .map((usuario) => usuario.nombre)
                  //   .join(", ");
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
          })
          .catch((error) => {
            console.error("Error updating courses:", error);
          });
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
      });
  };

  const getRoleUsuario = () => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/obtener-role-usuario")
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 220) {
          setRole_usuario("admin");
        } else if (response.data.Status === 221) {
          setRole_usuario("maestro");
        } else {
          // response.data.Status === 222
          setRole_usuario("alumno");
          navigate("/");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const asignarDatosCursos = () => {
    const curso = datos_cursos.at(0);
    setIdCurso(curso._id);
    setNombreCurso(curso.nombre);
    setTemasCurso(curso.temas);
    setDescripcionCurso(curso.descripcion);
    setAlumnosCurso(curso.enrolled_users);
    setMaestrosCurso(curso.teachers);
    // Para el InputBuscador
    // console.log(`curso.enrolled_users: ${curso.enrolled_users.split(", ")}`);
    // setAlumnosSeleccionados(curso.enrolled_users.split(", "));
    // setMaestrosSeleccionados(curso.teachers.split(", "));
  };

  useEffect(() => {
    getDataCurso(params.id_curso);
    getRoleUsuario();
  }, []);

  useEffect(() => {
    if (datos_cursos.length > 0) {
      // asignarListaCursos();
      asignarDatosCursos();
      // handleBuscarAlumnos(null, datos_cursos.at(0).enrolled_users.split(", "));
      // handleBuscarMaestros(null, datos_cursos.at(0).teachers.split(", "));
    }
  }, [datos_cursos]);

  const confirmarBorrarCurso = (id_curso, nombre_curso) => {
    Swal.fire({
      title: `Seguro que desea borrar el curso\n ${nombre_curso}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarCurso(id_curso);
      }
    });
  };

  const borrarCurso = (id_curso) => {
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/borrar-curso", {
        id_curso: id_curso,
        role: role_usuario,
      })
      .then((response) => {
        console.log(response.data);
        if (response.data.Status === 206) {
          Swal.fire({
            title: "Borrado exitosamente",
            showDenyButton: false,
            confirmButtonText: "Continuar",
            icon: "success",
          }).then((result) => {
            // console.log(result);
            if (result) {
              // navigate(0);
              window.location.reload();
            }
          });
        } else {
          Swal.fire({
            title: "No tiene autorización",
            showDenyButton: false,
            confirmButtonText: "Continuar",
            icon: "error",
            iconColor: "orange",
          });
          //   .then((result) => {
          //   console.log(result);
          //   if (result) {
          //     navigate(0);
          //   }
          // });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleActualizarCurso = (e) => {
    e.preventDefault();

    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/actualizar-curso", {
        id_curso: idCurso,
        nombre: nombreCurso,
        temas: temasCurso,
        descripcion: descripcionCurso,
        // Pasamos los ID's de los alumnos y maestros para eficientar la actualización
        id_alumnos: alumnosSeleccionados.map((alumno) => {
          return alumno._id.toString();
        }),
        id_maestros: maestrosSeleccionados.map((maestro) => {
          return maestro._id.toString();
        }),
      })
      .then((response) => {
        if (response.data.Status === 307) {
          Swal.fire({
            title: response.data.message,
            text: response.data.text,
            confirmButtonText: "Continuar",
            showCancelButton: false,
            icon: "success",
          });
        }
      })
      .catch((error) => {
        console.error(`Error actualizando el curso.\n${error}`);
      });
  };

  // Función para borrar el alumno específico
  // Función para borrar el usuario específico
  const handleRemoveThisUsuario = async (id_usuario_to_erase, rol_usuario_to_erase) => {
    try {
      console.log("Enviando:", {
        id_curso: idCurso,
        id_usuario_a_borrar: id_usuario_to_erase.toString(),
      });
      const response = await axios.post(
        "https://lms-facultad-de-quimica.onrender.com/api/eliminar-usuario-de-curso",
        {
          id_curso: idCurso,
          id_usuario_a_borrar: id_usuario_to_erase.toString(),
          rol_usuario_to_erase: rol_usuario_to_erase,
        }
      );

      // Verifica que la respuesta contenga 'Status' y 'message'
      if (response.data && response.data.Status === 707) {
        // Recarga la página solo si la operación fue exitosa
        window.location.reload();
      } else {
        console.error(`Error al eliminar al usuario: ${response.data.message}`);
      }
    } catch (error) {
      console.error(`Error buscando y eliminando al usuario '${id_usuario_to_erase}': ${error}`);
      return "Error al buscar y eliminar al usuario.";
    }
  };

  // const handleRemoveThisUsuario = async (id_usuario_to_errase) => {
  //   try {
  //     await axios.post("https://lms-facultad-de-quimica.onrender.com/api/eliminar-usuario-de-curso", {
  //       id_curso: idCurso,
  //       id_usuario_a_borrar: id_usuario_to_errase.toString(),
  //     });
  //     window.location.reload();
  //   } catch (error) {
  //     console.error(`Error buscando y eliminando al alumno '${id_usuario_to_errase}': ${error}`);
  //     return "Error al buscar y eliminar al alumno."; // En caso de error, devuelve un mensaje
  //   }
  // };

  // Búsqueda y completado de alumnos en tiempo real por carga de datos del curso
  useEffect(() => {
    // Por cada alumno que tiene el curso
    for (let i = 0; i < alumnosCurso.length; i++) {
      // Buscarlo
      let nombreAlumno = alumnosCurso.at(i);
      axios
        .post("https://lms-facultad-de-quimica.onrender.com/api/admin/buscar-usuarios", {
          palabra_a_buscar: nombreAlumno,
          filtro: "alumnos",
        })
        .then((response) => {
          // Guardarlo dentro de alumnosSeleccionados evitando que se repita
          let alumnoEncontrado = response.data.docs.at(0);
          try {
            if (alumnoEncontrado) {
              let usuarioEstaDisponible = alumnosSeleccionados.find((usuario) => {
                return usuario._id === alumnoEncontrado._id;
              });
              if (!usuarioEstaDisponible) {
                setAlumnosSeleccionados([...alumnosSeleccionados, alumnoEncontrado]);
              }
            }
          } catch (error) {
            console.error(`Error buscando el usuario ${nombreAlumno}.\n${error}`);
          }
        })
        .catch((error) => {
          console.error(`Error buscando el usuario ${nombreAlumno}.\n${error}`);
        });
    }
  }, [alumnosCurso]);

  // Búsqueda de alumnos en tiempo real por input del usuario
  useEffect(() => {
    // Buscar el usuario escrito en la DB
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/admin/buscar-usuarios", {
        palabra_a_buscar: alumnosBuscados,
        filtro: "alumnos",
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const usuariosEncontrados = response.data.docs;
        if (usuariosEncontrados.length > 0) {
          // Se encontró al menos 1 alumno que coincide con el nombre escrito
          // Los usuarios obtenidos guardarlos en alumnosDisponibles
          usuariosEncontrados.forEach((usuarioEncontrado) => {
            // Guardamos el objeto de usuario dentro de alumnosDisponibles evitando que se repita
            let usuarioEstaDisponible = alumnosDisponibles.find((usuario) => {
              return usuario._id === usuarioEncontrado._id;
            });
            if (!usuarioEstaDisponible) {
              setAlumnosDisponibles([...alumnosDisponibles, usuarioEncontrado]);
            }
          });
        } else {
          // No se encontrarón alumnos que coincidieran con el texto ingresado en "alumnosBuscados" dentro del InputBuscador
          setAlumnosDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando el usuario ${alumnosBuscados}.\n${error}`);
      });
  }, [alumnosBuscados]);

  // Búsqueda y completado de maestros en tiempo real por carga de datos del curso
  useEffect(() => {
    // Por cada alumno que tiene el curso
    for (let i = 0; i < maestrosCurso.length; i++) {
      // Buscarlo
      let nombreMaestro = maestrosCurso.at(i);
      axios
        .post("https://lms-facultad-de-quimica.onrender.com/api/admin/buscar-usuarios", {
          palabra_a_buscar: nombreMaestro,
          filtro: "maestros",
        })
        .then((response) => {
          // Guardarlo dentro de maestrosSeleccionados evitando que se repita
          let maestroEncontrado = response.data.docs.at(0);
          try {
            if (maestroEncontrado) {
              let usuarioEstaDisponible = maestrosSeleccionados.find((usuario) => {
                return usuario._id === maestroEncontrado._id;
              });
              if (!usuarioEstaDisponible) {
                setMaestrosSeleccionados([...maestrosSeleccionados, maestroEncontrado]);
              }
            }
          } catch (error) {
            console.error(`Error buscando el usuario ${nombreMaestro}.\n${error}`);
          }
        })
        .catch((error) => {
          console.error(`Error buscando el usuario ${nombreMaestro}.\n${error}`);
        });
    }
  }, [maestrosCurso]);

  // Búsqueda de maestros en tiempo real por input del usuario
  useEffect(() => {
    // Buscar el usuario escrito en la DB
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/admin/buscar-usuarios", {
        palabra_a_buscar: maestrosBuscados,
        filtro: "maestros",
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const usuariosEncontrados = response.data.docs;
        if (usuariosEncontrados.length > 0) {
          // Se encontró al menos 1 alumno que coincide con el nombre escrito
          // Los usuarios obtenidos guardarlos en alumnosDisponibles
          usuariosEncontrados.forEach((usuarioEncontrado) => {
            // Guardamos el objeto de usuario dentro de alumnosDisponibles evitando que se repita
            let usuarioEstaDisponible = maestrosDisponibles.find((usuario) => {
              return usuario._id === usuarioEncontrado._id;
            });
            if (!usuarioEstaDisponible) {
              setMaestrosDisponibles([...maestrosDisponibles, usuarioEncontrado]);
            }
          });
        } else {
          // No se encontrarón maestros que coincidieran con el texto ingresado en "alumnosBuscados" dentro del InputBuscador
          setMaestrosDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando el usuario ${maestrosBuscados}.\n${error}`);
      });
  }, [maestrosBuscados]);

  return (
    <div className="container w-100 d-flex flex-column justify-content-center align-items-center mb-5">
      <div className="d-flex w-75 justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Editar curso</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          className="bi bi-arrow-90deg-right"
          viewBox="0 0 16 16"
          style={{ transform: "rotate(90deg)" }}>
          <path
            fillRule="evenodd"
            d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
      </div>

      <form
        onSubmit={(e) => {
          handleActualizarCurso(e);
        }}
        className="w-75 mb-5">
        <table className="table table-striped table-hover">
          <tbody>
            <tr>
              <th className="text-end w-25" scope="row">
                Nombre:
              </th>
              <td className="text-start">
                <input
                  type="text"
                  value={nombreCurso}
                  className="w-100"
                  onChange={(e) => {
                    setNombreCurso(e.target.value);
                  }}></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Temas:
              </th>
              <td className="text-start" colSpan="2">
                <input
                  type="text"
                  value={temasCurso}
                  className="w-100"
                  onChange={(e) => {
                    setTemasCurso(e.target.value);
                  }}></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Descripción:
              </th>
              <td className="text-start" colSpan="2">
                <input
                  type="text"
                  value={descripcionCurso}
                  className="w-100"
                  onChange={(e) => {
                    setDescripcionCurso(e.target.value);
                  }}></input>
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Alumnos inscritos:
              </th>
              <td className="text-start">
                {alumnos.length > 0 ? (
                  alumnos.map((alumno, index) => {
                    // datos_cursos.enrolled_users?.length > 0 ? (
                    // datos_cursos.enrolled_users.map(async (id_alumno_individual, index) => {
                    //   const obj_alumno_individual = await axios.post(
                    //     "https://lms-facultad-de-quimica.onrender.com/api/buscar-usuarios-por-id",
                    //     {
                    //       palabra_a_buscar: id_alumno_individual.toString(),
                    //       filtro: "maestros",
                    //     }
                    //   );
                    return (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveThisUsuario(alumno._id, "Alumno");
                          }}
                          className="btn rounded-5 d-flex justify-content-center align-items-center p-1 me-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-x-lg"
                            viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                          </svg>
                        </button>
                        <div className="d-flex flex-wrap">
                          <h3 className="mx-3 my-2 text-nowrap">{alumno.nombre}</h3>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <></>
                )}
                {/* <InputBuscador
                  name="alumnosBuscados"
                  id="floatingInput-alumnos"
                  placeholder="Busca alumnos por nombre o correo"
                  label="Alumnos inscritos"
                  onChange={(e) => {
                    // console.log(e);
                    // handleBuscarAlumnos(e);
                    setAlumnosBuscados(e.target.value);
                  }}
                  value={alumnosBuscados}
                  // searching={"maestros"}
                  elementosDisponibles={alumnosDisponibles}
                  elementosSeleccionados={alumnosSeleccionados}
                  setElementosSeleccionados={setAlumnosSeleccionados}
                  aQuienAsignamos="curso"
                  queBuscamos="alumno"
                /> */}
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Añadir alumnos:
              </th>
              <td className="text-start">
                <InputBuscador
                  name="alumnosBuscados"
                  id="floatingInput-alumnos"
                  placeholder="Busca alumnos por nombre o correo"
                  label="Alumnos inscritos"
                  onChange={(e) => {
                    // console.log(e);
                    // handleBuscarAlumnos(e);
                    setAlumnosBuscados(e.target.value);
                  }}
                  value={alumnosBuscados}
                  // searching={"maestros"}
                  elementosDisponibles={alumnosDisponibles}
                  elementosSeleccionados={alumnosSeleccionados}
                  setElementosSeleccionados={setAlumnosSeleccionados}
                  aQuienAsignamos="curso"
                  queBuscamos="alumno"
                />
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Maestros inscritos:
              </th>
              <td className="text-start">
                {maestros.length > 0 ? (
                  maestros.map((maestro, index) => {
                    // datos_cursos.enrolled_users?.length > 0 ? (
                    // datos_cursos.enrolled_users.map(async (id_maestro_individual, index) => {
                    //   const obj_maestro_individual = await axios.post(
                    //     "https://lms-facultad-de-quimica.onrender.com/api/buscar-usuarios-por-id",
                    //     {
                    //       palabra_a_buscar: id_maestro_individual.toString(),
                    //       filtro: "maestros",
                    //     }
                    //   );
                    return (
                      <div
                        key={index}
                        className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveThisUsuario(maestro._id, "Maestro");
                          }}
                          className="btn rounded-5 d-flex justify-content-center align-items-center p-1 me-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-x-lg"
                            viewBox="0 0 16 16">
                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
                          </svg>
                        </button>
                        <div className="d-flex flex-wrap">
                          <h3 className="mx-3 my-2 text-nowrap">{maestro.nombre}</h3>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <></>
                )}
                {/* <InputBuscador
                  name="alumnosBuscados"
                  id="floatingInput-alumnos"
                  placeholder="Busca alumnos por nombre o correo"
                  label="Alumnos inscritos"
                  onChange={(e) => {
                    // console.log(e);
                    // handleBuscarAlumnos(e);
                    setAlumnosBuscados(e.target.value);
                  }}
                  value={alumnosBuscados}
                  // searching={"maestros"}
                  elementosDisponibles={alumnosDisponibles}
                  elementosSeleccionados={alumnosSeleccionados}
                  setElementosSeleccionados={setAlumnosSeleccionados}
                  aQuienAsignamos="curso"
                  queBuscamos="alumno"
                /> */}
              </td>
            </tr>
            <tr>
              <th className="text-end w-25" scope="row">
                Maestros inscritos:
              </th>
              <td className="text-start">
                <InputBuscador
                  name="maestrosBuscados"
                  id="floatingInput-maestros"
                  placeholder="Busca maestros por nombre o correo"
                  label="Maestros que lo administran"
                  onChange={(e) => {
                    // console.log(e);
                    setMaestrosBuscados(e.target.value);
                  }}
                  value={maestrosBuscados}
                  // searching={"maestros"}
                  elementosDisponibles={maestrosDisponibles}
                  elementosSeleccionados={maestrosSeleccionados}
                  setElementosSeleccionados={setMaestrosSeleccionados}
                  aQuienAsignamos="curso"
                  queBuscamos="maestro"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="container d-flex justify-content-center align-content-center">
          {role_usuario === "admin" ? (
            <button type="subbmit" className="btn btn-success w-25">
              Actualizar
            </button>
          ) : (
            <></>
          )}
          {role_usuario === "maestro" ? (
            <button type="subbmit" className="btn btn-success w-25">
              Actualizar
            </button>
          ) : (
            <></>
          )}
          {/* {role_usuario === "alumno" ? navigate("/") : <></>} */}
          {/* &nbsp; = no break-space, lo que quiere decir que el 1er botón y el 2ndo siempre estarán separados por un poco de espacio pero nunca en una línea diferente sin importar el layout, googleando &nbsp se entiende lo que hace.
           Pero básicamente agrega un espacio entre elementos y además evita que este espacio se pueda "romper" por un salto de línea, evitando así que por cuestiones de tamaño de pantalla y layout, el elemento 1 quede arriba y el elemento 2 abajo.
           Referencia: http://codexexempla.org/articulos/2008/nbsp.php */}
          &nbsp;
          <button
            className="btn btn-danger ms-3 w-25"
            onClick={() => {
              confirmarBorrarCurso(idCurso, nombreCurso);
            }}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="Tooltip on top">
            Borrar
          </button>
          <hr className="mt-3"></hr>
        </div>
      </form>
      {/* Checamos si ya tenemos los datos de los cursos, así evitamos hacer un render de EditarSecciones sin datos y así posibles errores. */}
      {datos_cursos.length > 0 ? <EditarSecciones curso={datos_cursos.at(0)} /> : <></>}
    </div>
  );
}
