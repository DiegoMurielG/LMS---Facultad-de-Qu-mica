export default function RenderActividadCurso({
  actividad,
  visualizando,
  setVisualizando,
  obj_actividad_a_renderizar,
  setObj_actividad_a_renderizar,
}) {
  return (
    <div>
      <button
        className="btn btn-outline-light btn-lg"
        // className="btn btn-link text-secondary-emphasis"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setVisualizando("Contenido");
          // setObj_actividad_a_renderizar(actividad);
          // setObj_actividad_a_renderizar((prev) => {
          //   return {
          //     idSection: ["Cargando..."],
          //     name: "Cargando...",
          //     position: ["Cargando..."],
          //     questions: ["Cargando..."],
          //     totalScore: 0,
          //     answeredScore: 0,
          //   };
          // });
          setObj_actividad_a_renderizar(actividad);
        }}>
        {actividad.name}
      </button>
    </div>
  );
}
