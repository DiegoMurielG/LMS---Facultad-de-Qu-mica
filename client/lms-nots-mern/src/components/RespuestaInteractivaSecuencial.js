import { useState } from "react";

export default function RespuestaInteractivaSecuencial() {
  const [listaPreguntasHijo, setListaPreguntasHijo] = useState([]);
  const aniadirPreguntaHijo = () => {};
  return (
    <div className="d-flex flex-column justify-content-center align-items-center rounded-3 border border-secondary-subtle border-2 w-100">
      {/* Instrucciones */}
      <div className="d-flex flex-column justify-content-center align-items-center bg-body-secondary rounded-3 w-100 mb-3">
        <h4>Instrucciones para agregar preguntas de forma secuencial</h4>
        <ol>
          <li className="text-start">
            <p>
              Primero <b>añada una pregunta hijo</b> y coloque su contenido
            </p>
          </li>
          <li className="text-start">
            <p>
              Después <b>eliga lo que pasará</b> cuando se contesta correcta e incorrectamente la
              pregunta.
            </p>
          </li>
          <li className="text-start">
            <p>
              <b>Después de contestar una pregunta hijo correctamente</b>, se habilitará
              automáticamente la siguiente <i>pregunta hijo</i> en la lista
            </p>
          </li>
        </ol>
      </div>

      {/* Añadir preguntas */}
      <div className="d-flex flex-column justify-content-center align-items-center bg-body-secondary rounded-3 w-100">
        <button type="button" onClick={aniadirPreguntaHijo()} className="btn btn-success">
          Añadir pregunta hijo
        </button>
      </div>
    </div>
  );
}
