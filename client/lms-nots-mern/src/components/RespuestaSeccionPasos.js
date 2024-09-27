export default function RespuestaSeccionPasos() {
  return (
    <div>
      <p>Sección sin preguntas para llevar al alumno en un proceso práctico fuera del LMS.</p>
      <p>
        Escriba el contenido para guiar a su alumn@ en el apartado de{" "}
        <span className="fst-italic">contenido previo/posterior a la pregunta con el botón de</span>
        <br />
        <button className="btn btn-success my-3 disabled" type="button">
          Añadir contenido
        </button>
        <br />
        Para colocar imágenes escribe <br />
        <span className="fst-italic text-info-emphasis">
          &lt;img name="nombreDeTuImágen" src="RutaATuImágen" /&gt;
        </span>
      </p>
      <p className="text-warning-emphasis text-start">
        Nota: No olvides el espacio después del{" "}
        <span className="fst-italic text-warning fw-bold">
          src=""<span className=" text-danger">espacio</span>
        </span>{" "}
        en la imágen
      </p>
    </div>
  );
}
