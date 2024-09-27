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
        className="btn btn-link text-secondary-emphasis"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setVisualizando("Contenido");
          setObj_actividad_a_renderizar(actividad);
        }}>
        {actividad.name}
      </button>
    </div>
  );
}
