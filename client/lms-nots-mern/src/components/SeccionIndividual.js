import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import InputBuscador from "./InputBuscador";
import { useNavigate } from "react-router-dom";

export default function SeccionIndividual({
  seccion,
  flechaVacia,
  flechaLlena,
  id_curso,
  cantidad_secciones_curso,
  // buscarActividad,
  arreglo_objetos_actividades_por_seccion,
  rerenderPorActualizacionDeDatos,
  setRerenderPorActualizacionDeDatos,
}) {
  const [seccionSeVe, setSeccionSeVe] = useState(false);
  const [flechaSeccion, setFlechaSeccion] = useState(flechaVacia);
  const [classNamesContainerDataSeccion, setClassNamesContainerDataSeccion] = useState(
    "container d-flex flex-column d-none"
  );
  const [lista_data_tasks, setLista_data_tasks] = useState([]);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  // Construir sección actual
  let seccionConstruida = {
    idCourse: id_curso, // La FK que viene desde el curso
    _id: seccion._id,
    name: seccion.name, // Nombre de la sección
    position: seccion.position, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    // -1 = al final => $push
    // 0 = al inicio => $push[0]
    id_tasks: seccion.id_tasks, // Arreglo de los ID’s en orden de las actividades que tiene la sección
    totalScore: seccion.totalScore, // Suma del valor de todas las actividades que contiene esta sección
    answeredScore: seccion.answeredScore, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
  };

  const [nombreSeccion, setNombreSeccion] = useState(seccion.name);
  const [posicionSeccion, setPosicionSeccion] = useState(seccion.position);

  // Input Buscador
  const [actividadesBuscadas, setActividadesBuscadas] = useState("");
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);

  const handleBuscarActividades = (e) => {
    e.preventDefault();
    setActividadesBuscadas(e.target.value);
  };

  const handleToggleVerSeccion = (e) => {
    e.preventDefault();
    setSeccionSeVe(!seccionSeVe);
  };

  useEffect(() => {
    if (seccionSeVe) {
      setFlechaSeccion(flechaLlena);
      setClassNamesContainerDataSeccion("container d-flex flex-column d-block");
    } else {
      setFlechaSeccion(flechaVacia);
      setClassNamesContainerDataSeccion("container d-flex flex-column d-none");
    }
  }, [seccionSeVe]);

  const handleChangeNombreSeccion = (e) => {
    e.preventDefault();
    setNombreSeccion(e.target.value);
  };

  const handleChangePosicionSeccion = (e) => {
    e.preventDefault();
    const nuevaPosicion = parseInt(e.target.value, 10);
    if (nuevaPosicion >= 0 && nuevaPosicion < cantidad_secciones_curso) {
      setPosicionSeccion(nuevaPosicion);
    } else {
      Swal.fire({
        title: "Ingrese un valor válido para la posición de la sección",
        text: `El valor de posición para esta sección debe de ser igual o mayor a 0 y menor o igual a ${
          cantidad_secciones_curso - 1
        }.`,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        icon: "warning",
      });
    }
  };

  const handleActualizarSeccion = async (e = null) => {
    if (e) {
      e.preventDefault();
    }

    try {
      await api.post("/actualizar-nombre-seccion", {
        id_seccion: seccion._id,
        nombre_seccion: nombreSeccion,
      });

      await api.post("/actualizar-posicion-secciones-curso", {
        id_curso: id_curso,
        id_seccion: seccion._id,
        posicion: posicionSeccion,
      });

      await api.post("/aniadir-actividades-seccion", {
        id_seccion: seccion._id,
        actividades_a_aniadir: actividadesSeleccionadas.map(
          (objeto_actividad) => objeto_actividad._id
        ),
      });

      await api.post("/actualizar-puntuacion-seccion", {
        id_seccion: seccion._id,
      });

      setRerenderPorActualizacionDeDatos(true);

      Swal.fire({
        title: `Sección ${nombreSeccion} actualizada correctamente`,
        confirmButtonText: "Continuar",
        icon: "success",
      });
    } catch (error) {
      console.error("Error actualizando la sección:", error);
    }
  };

  const handleConfirmarBorrarSeccion = (e, id_seccion, id_curso, id_tasks) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar la sección\n ${seccionConstruida.name}?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarSeccion(id_seccion, id_curso, id_tasks);
      }
    });
  };

  const borrarSeccion = async (id_seccion, id_curso, id_tasks) => {
    alert("Borrando sección...");
    // Movemos la sección al final para que las secciones uqe no se borrarán cambien de posición
    try {
      await api.post("/actualizar-posicion-secciones-curso", {
        id_curso: id_curso,
        id_seccion: id_seccion,
        posicion: -1,
      });
    } catch (error) {
      console.error("Error actualizando la posición de la sección.", error);
    }

    try {
      await api
        .post("/borrar-seccion", {
          id_section: id_seccion,
          id_curso: id_curso,
          id_tasks: id_tasks,
        })
        .then((response) => {
          Swal.fire({
            title: response.data.message,
            confirmButtonText: "Continuar",
            icon: "success",
          });
        })
        .catch((error) => {
          console.error("Error borrando la sección.", error);
        });
    } catch (error) {
      console.error("Error borrando la sección.", error);
    }
  };

  // Función para buscar actividades
  // const buscarActividades = async (id_task) => {
  //   try {
  //     const response = await api.post("/buscar-actividades", {
  //       palabra_a_buscar: `#: ${id_task}`,
  //     });

  //     return response.data.docs[0].name; // Devuelve el nombre de la actividad
  //   } catch (error) {
  //     console.error(`Error buscando la actividad '${id_task}': ${error}`);
  //     return "Error al buscar actividad"; // En caso de error, devuelve un mensaje
  //   }
  // };

  // Función para borrar la actividad específica
  const handleRemoveThisTask = async (id_task_to_errase) => {
    try {
      await api.post("/eliminar-actividad-de-seccion", {
        id_section: seccion._id,
        id_actividad: id_task_to_errase,
      });
    } catch (error) {
      console.error(`Error buscando y eliminando la actividad '${id_task_to_errase}': ${error}`);
      return "Error al buscar y eliminar la actividad."; // En caso de error, devuelve un mensaje
    }
    window.location.reload();
  };

  // Efecto para obtener las actividades y renderizarlas
  useEffect(() => {
    const obtenerActividades = async () => {
      const actividades = arreglo_objetos_actividades_por_seccion.map(
        async (task_individual, index) => {
          // const nombreActividad = await buscarActividades(id_task);
          // const nombreActividad = await buscarActividad(id_task);
          return (
            <div
              key={index}
              className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleRemoveThisTask(task_individual.id_task);
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
              <h3 className="me-3 my-2">{task_individual.task_name}</h3>
              <button className="btn btn-primary">Ver</button>
            </div>
          );
        }
      );
      // Creamos un array de promesas y esperamos su resolución
      // const actividades = await Promise.all(
      //   // seccion.id_tasks.map(async (id_task) => {
      // );

      setLista_data_tasks(actividades); // Actualiza el estado con el resultado de todas las promesas
    };

    obtenerActividades(); // Llamamos a la función para obtener las actividades
  }, [arreglo_objetos_actividades_por_seccion]);

  // Búsqueda de actividades en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la actividad escrito en la DB
    api
      .post("/buscar-actividades", {
        palabra_a_buscar: actividadesBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const actividadesEncontradas = response.data.docs;
        if (actividadesEncontradas.length > 0) {
          // Se encontró al menos 1 actividad que coincide con el nombre escrito
          // Las actividades obtenidas serán guardadas en actividadesDisponibles
          actividadesEncontradas.forEach((actividadEncontrada) => {
            // Guardamos el objeto de actividad dentro de actividadesDisponibles evitando que se repita
            let actividadEstaDisponible = actividadesDisponibles.find((actividad) => {
              return actividad._id === actividadEncontrada._id;
            });
            if (!actividadEstaDisponible) {
              // setActividadesDisponibles([...actividadesDisponibles, actividadEncontrada]);
              setActividadesDisponibles([
                ...actividadesDisponibles,
                {
                  _id: actividadEncontrada._id,
                  nombre: `${actividadEncontrada.name}`,
                },
              ]);
            }
          });
        } else {
          // No se encontrarón actividades que coincidieran con el texto ingresado en "actividadesBuscados" dentro del InputBuscador
          setActividadesDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la actividad ${actividadesBuscadas}.\n${error}`);
      });
  }, [actividadesBuscadas]);

  // useEffect(() => {
  //   setLista_data_tasks(
  //     seccion.id_tasks.map((id_task, index) => (
  //       <div
  //         key={index}
  //         className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
  //         <h3 className="me-3 my-2">
  //           {
  //             // JSON.stringify(id_task)
  //             buscarActividades(id_task)
  //           }
  //         </h3>
  //         <button className="btn btn-primary">Ver</button>
  //       </div>
  //     ))
  //   );
  // }, [seccion.id_tasks]); //, seccionSeVe

  return (
    <div className="contanier d-flex flex-column justify-content-center align-items-center rounded-3 mb-3 bg-body-tertiary overflow-hidden">
      <div className="d-flex justify-content-between align-items-center bg-body-tertiary w-100">
        {/* <span className="me-1">Sección:</span> */}
        <h2 className="my-0 w-75 my-3">
          {seccion.name.charAt(0).toUpperCase() + seccion.name.substring(1)}
        </h2>
        <button onClick={handleToggleVerSeccion} className="btn btn-primary btn-lg">
          Ver &nbsp;
          {flechaSeccion}
        </button>
      </div>
      <div className={classNamesContainerDataSeccion}>
        <div className="contanier d-flex justify-content-center align-items-center w-100 mt-3">
          <div className="d-flex flex-column justify-content-end align-items-start w-75 pe-3">
            <div className="form-floating mb-3 w-100">
              <input
                type="text"
                className="form-control"
                placeholder="Nombre de la sección"
                id="floatingInput-nombre-seccion"
                value={nombreSeccion}
                onChange={handleChangeNombreSeccion}
              />
              <label htmlFor="floatingInput-nombre-seccion">Nombre de la sección</label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input
                type="number"
                className="form-control"
                placeholder="Posición de la sección"
                id="floatingInput-posicion-seccion"
                value={posicionSeccion}
                min={0}
                max={cantidad_secciones_curso - 1}
                onChange={handleChangePosicionSeccion}
              />
              <label htmlFor="floatingInput-posicion-seccion">
                Posición de la sección [{0}-{cantidad_secciones_curso - 1}]
              </label>
            </div>

            <div className="form-floating mb-3 w-100">
              <input
                type="number"
                className="form-control"
                placeholder="Puntuación total de la sección"
                id="floatingInput-puntuacion-seccion"
                value={seccion.totalScore || 0}
                disabled
              />
              <label htmlFor="floatingInput-puntuacion-seccion">
                Puntuación total de la sección
              </label>
            </div>
          </div>
          <div className="d-flex flex-column justify-content-center align-items-center w-25">
            <button
              type="button"
              onClick={handleActualizarSeccion}
              className="btn btn-success mb-3 w-100">
              Actualizar
            </button>
            <button
              className="btn btn-danger w-100"
              onClick={(e) =>
                handleConfirmarBorrarSeccion(e, seccion._id, id_curso, seccion.id_tasks)
              }>
              Borrar
            </button>
          </div>
        </div>
        <h2 className="mb-3">Actividades</h2>
        <div className="d-flex flex-column justify-content-center align-items-center">
          {/* {lista_data_tasks.length > 0 ? (
            lista_data_tasks
          ) : (
            <p>No se encontraron actividades, añada una!</p>
          )} */}
          {arreglo_objetos_actividades_por_seccion.length > 0 ? (
            arreglo_objetos_actividades_por_seccion.map((task_individual, index) => {
              // const nombreActividad = await buscarActividades(id_task);
              // const nombreActividad = await buscarActividad(id_task);
              return (
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center bg-body-secondary border-light-subtle rounded-3 p-1 mx-2 my-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemoveThisTask(task_individual.id_task);
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
                  <h3 className="me-3 my-2">{task_individual.task_name}</h3>
                  <button className="btn btn-primary">Ver</button>
                </div>
              );
            })
          ) : (
            <p>No se encontraron actividades, añada una!</p>
          )}
        </div>
        <hr></hr>
        <h3 className="mb-3 text-secondary-emphasis">Añadir actividades</h3>
        <div className="mb-3">
          <InputBuscador
            name="actividadesBuscadas-en-seccion"
            id="floatingInput-actividades-en-seccion"
            placeholder="Busque actividades por nombre"
            label="Actividades"
            onChange={(e) => {
              // console.log(e);
              handleBuscarActividades(e);
            }}
            value={actividadesBuscadas || ""}
            // searching={"actividades"}
            elementosDisponibles={actividadesDisponibles}
            elementosSeleccionados={actividadesSeleccionadas}
            setElementosSeleccionados={setActividadesSeleccionadas}
            aQuienAsignamos="sección"
            queBuscamos="actividades"
          />
        </div>
      </div>
    </div>
  );
}
