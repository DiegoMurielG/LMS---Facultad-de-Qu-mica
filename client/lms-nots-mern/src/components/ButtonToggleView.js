import axios from "axios";
import { useEffect, useState } from "react";
import SeccionIndividual from "./SeccionIndividual";
import ActividadIndividual from "./ActividadIndividual";
import PreguntaIndividual from "./PreguntaIndividual";
import RenderPreguntaIndividual from "./RenderPreguntaIndividual";
import RenderActividadCurso from "./RenderActividadCurso";

/**
 *
 * @param {Array} data_contenidos - Arreglo con los objetos a mostrar dentro del componente a renderizar
 * @param {String="seccion", "task"} componenteAMostrar - Nombre del componente que renderizaremos por cada elemento del data_contenidos
 * @returns JSX
 */
export default function ButtonToggleView({
  data_contenidos,
  componenteAMostrar,
  mensajeBtn,
  mensajeVacio,
  id_curso,
  cantidad_secciones_curso = [],
  arreglo_objetos_actividades_por_todas_las_secciones = [],
  arreglo_objetos_secciones_por_todas_las_actividades = [],
  arreglo_objetos_preguntas_por_actividad = [],
  cantidad_preguntas_por_actividad = [],
  arreglo_objetos_actividades_por_pregunta = [],
  buscarActividad,

  // Dentro de <EditarSecciones />
  rerenderPorActualizacionDeDatos = null,
  setRerenderPorActualizacionDeDatos = null,

  // Dentro de <RenderCurso />
  visualizando = null,
  setVisualizando = null,
  obj_actividad_a_renderizar = null,
  setObj_actividad_a_renderizar = null,
}) {
  // Visibilidad del contenido
  const [contenidosSeVen, setContenidosSeVen] = useState(false);
  const flechaVacia = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-caret-right"
      viewBox="0 0 16 16">
      <path d="M6 12.796V3.204L11.481 8zm.659.753 5.48-4.796a1 1 0 0 0 0-1.506L6.66 2.451C6.011 1.885 5 2.345 5 3.204v9.592a1 1 0 0 0 1.659.753" />
    </svg>
  );

  const flechaLlena = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-caret-down-fill"
      viewBox="0 0 16 16">
      <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
    </svg>
  );
  const [flechaContenido, setFlechaContenido] = useState(flechaVacia);

  const [classNamesContainerDataContenido, setClassNamesContainerDataContenido] = useState(
    "container d-flex flex-column d-none"
  );

  // Datos de las secciones
  // const [data_contenidos, setData_contenidos] = useState([
  //   {
  //     idCurso: curso._id,
  //     name: "placeholder",
  //     posicion: 0,
  //     tasks: ["placeholder", "placeholder", "placeholder"],
  //   },
  //   {
  //     idCurso: curso._id,
  //     name: "placeholder",
  //     posicion: 1,
  //     tasks: ["placeholder", "placeholder", "placeholder"],
  //   },
  //   {
  //     idCurso: curso._id,
  //     name: "placeholder",
  //     posicion: 2,
  //     tasks: ["placeholder", "placeholder", "placeholder"],
  //   },
  // ]);

  const [lista_data_contenido, setLista_data_contenido] = useState([]);

  axios.defaults.withCredentials = true;

  const handleToggleVerContenido = (e) => {
    e.preventDefault();
    // Alternar entre la visibilidad del contenido: visible o no visible
    if (!contenidosSeVen) {
      setContenidosSeVen(true);
    } else {
      setContenidosSeVen(false);
    }
    // Si están ocultas:
    // Rotar la flecha 90 grados en sentido de las manecillas del reloj

    // Buscar las secciones que tiene el curso y mostrarlas

    // Si están visibles:
    // Ocultar la visibilidad de las secciones sin borrar los datos. usar className="invisible"
  };

  useEffect(() => {
    if (contenidosSeVen) {
      setFlechaContenido(flechaLlena);
      setClassNamesContainerDataContenido(
        classNamesContainerDataContenido.replace(" d-none", " d-block")
      );
    } else {
      setFlechaContenido(flechaVacia);
      setClassNamesContainerDataContenido(
        classNamesContainerDataContenido.replace(" d-block", " d-none")
      );
    }
  }, [contenidosSeVen]);

  // Al cambiar los datos de data_contenido o la visibilidad del contenido con contenidosSeVen, la lista de contenido disponible se vuelve a renderizar
  useEffect(() => {
    console.log(
      "Cambiaron los datos, reaciendo lista de elementos individuales...\nEl redrender no se está haciendo, corrígelo"
    );

    // console.log(
    //   `arreglo_objetos_actividades_por_todas_las_secciones: ${JSON.stringify(
    //     arreglo_objetos_actividades_por_todas_las_secciones
    //   )}`
    // );

    if (data_contenidos.length > 0 || rerenderPorActualizacionDeDatos) {
      setLista_data_contenido(
        data_contenidos.map((contenido, index) => {
          // console.log(`arreglo_objetos_actividades_por_todas_las_secciones.filter(
          //               (actividad_individual) => actividad_individual.idSection.includes(contenido._id)
          //             ): ${JSON.stringify(
          //               arreglo_objetos_actividades_por_todas_las_secciones.filter(
          //                 (actividad_individual) =>
          //                   actividad_individual.idSection.includes(contenido._id)
          //               )
          //             )}`);
          let componente = <></>;
          if (componenteAMostrar === "seccion") {
            componente = (
              <SeccionIndividual
                seccion={contenido}
                flechaVacia={flechaVacia}
                flechaLlena={flechaLlena}
                id_curso={id_curso}
                cantidad_secciones_curso={cantidad_secciones_curso}
                // buscarActividad={buscarActividad}
                arreglo_objetos_actividades_por_seccion={arreglo_objetos_actividades_por_todas_las_secciones.filter(
                  (actividad_individual) => actividad_individual.idSection.includes(contenido._id)
                )}
                rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
                setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
              />
            );
          } else if (componenteAMostrar === "actividad") {
            componente = (
              <ActividadIndividual
                actividad={contenido}
                flechaVacia={flechaVacia}
                flechaLlena={flechaLlena}
                arreglo_objetos_secciones_por_actividad={arreglo_objetos_secciones_por_todas_las_actividades.filter(
                  (seccion_individual) => seccion_individual.id_tasks.includes(contenido._id)
                )}
                arreglo_objetos_preguntas_por_actividad={arreglo_objetos_preguntas_por_actividad}
                rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
                setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
              />
            );
          } else if (componenteAMostrar === "pregunta") {
            componente = (
              <PreguntaIndividual
                pregunta={contenido}
                flechaVacia={flechaVacia}
                flechaLlena={flechaLlena}
                cantidad_preguntas_por_actividad={cantidad_preguntas_por_actividad}
                arreglo_objetos_actividades_por_pregunta={arreglo_objetos_actividades_por_pregunta}
                // arreglo_objetos_secciones_por_actividad={arreglo_objetos_secciones_por_todas_las_actividades.filter(
                //   (seccion_individual) => seccion_individual.id_tasks.includes(contenido._id)
                // )}
                // arreglo_objetos_preguntas_por_actividad={arreglo_objetos_preguntas_por_actividad}
                rerenderPorActualizacionDeDatos={rerenderPorActualizacionDeDatos}
                setRerenderPorActualizacionDeDatos={setRerenderPorActualizacionDeDatos}
              />
            );
            // Empezar a mostrar preguntas de tipo abierta, tabla a completar y opción múltiple
          } else if (componenteAMostrar === "render-pregunta") {
            componente = <RenderPreguntaIndividual pregunta={contenido} />;
          } else if (componenteAMostrar === "render-actividad-curso") {
            componente = (
              <RenderActividadCurso
                actividad={contenido}
                visualizando={visualizando}
                setVisualizando={setVisualizando}
                obj_actividad_a_renderizar={obj_actividad_a_renderizar}
                setObj_actividad_a_renderizar={setObj_actividad_a_renderizar}
              />
            );
          }
          return <div key={index}>{componente}</div>;
        })
      );
    } else {
      setLista_data_contenido([<h2 key={1}>{mensajeVacio}</h2>]);
    }
  }, [data_contenidos, rerenderPorActualizacionDeDatos, contenidosSeVen]);

  return (
    <div className="contanier w-100 d-flex flex-column justify-content-center align-items-center rounded-3 overflow-hidden">
      <div className="d-flex justify-content-evenly mb-3 ">
        <button
          onClick={(e) => {
            handleToggleVerContenido(e);
          }}
          className="btn btn-secondary d-flex justify-content-around align-items-center w-100">
          <h2 className="me-3 my-1">{mensajeBtn}</h2>
          &nbsp;
          {flechaContenido}
        </button>
      </div>
      <div className={classNamesContainerDataContenido}>
        {/* Descplegar las contenido con conditional rendering y .map() a data_contenido */}
        {lista_data_contenido}
      </div>
    </div>
  );
}
