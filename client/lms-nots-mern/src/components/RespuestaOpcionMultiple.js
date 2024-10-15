import { useEffect, useState } from "react";
import Swal from "sweetalert2";

export default function RespuestaOpcionMultiple({
  listaRespuestas,
  setListaRespuestas = null,
  valorPuntosPregunta = 0,
  // isDisabled es un booleano que indica si se está contestando o no la pregunta, por lo tanto:
  // isDisabled = true -> Se está editando la pregunta
  // isDisabled = false -> Se está contestando la pregunta
  isDisabled = true,
  // contestadaCorrectamente es un booleano que se utiliza para darle estilos al input según si se contestón o no correctamente la pregunta
  contestadaCorrectamente = false,
  // preguntaContestada es un booleano que indica si se contestó en algún momento la pregunta
  preguntaContestada = false,
}) {
  const [cantidadRespuestasCorrectas, setCantidadRespuestasCorrectas] = useState(0);

  const generateUniqueId = (length = 16) => {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    for (let i = 0; length > i; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      id += characters[randomIndex];
    }
    return Date.now().toString(16) + id;
  };

  const handleCrearRespuestaAgreguable = (e) => {
    e.preventDefault();
    setListaRespuestas([
      ...listaRespuestas,
      {
        id: generateUniqueId(),
        respuesta: "",
        correcta: false,
        seleccionada: false,
        valorRespuesta: 0,
      },
    ]);
  };

  const handleActualizarRespuesta = (e, index) => {
    const { name, value, type, checked } = e.target;
    setListaRespuestas((prevRespuestas) => {
      const updatedRespuestas = [...prevRespuestas];
      updatedRespuestas[index] = {
        ...updatedRespuestas[index],
        [name]: type === "checkbox" ? checked : value,
      };

      // Actualizar cantidad de respuestas correctas
      const nuevasRespuestasCorrectas = updatedRespuestas.filter(
        (respuesta) => respuesta.correcta
      ).length;
      setCantidadRespuestasCorrectas(nuevasRespuestasCorrectas);

      return updatedRespuestas;
    });
  };

  useEffect(() => {
    setListaRespuestas((prevRespuestas) =>
      prevRespuestas.map((respuesta) => ({
        ...respuesta,
        valorRespuesta:
          respuesta.correcta && cantidadRespuestasCorrectas > 0
            ? valorPuntosPregunta / cantidadRespuestasCorrectas
            : 0,
      }))
    );
  }, [cantidadRespuestasCorrectas, valorPuntosPregunta, setListaRespuestas]);

  const handleConfirmarBorrarRespuesta = (e, index) => {
    e.preventDefault();
    Swal.fire({
      title: `Seguro que desea borrar esta respuesta?`,
      showDenyButton: true,
      confirmButtonText: "Si, borrar",
      denyButtonText: "No, cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        borrarRespuesta(index);
      }
    });
  };

  const borrarRespuesta = (index) => {
    if (listaRespuestas[index].correcta) {
      setCantidadRespuestasCorrectas(cantidadRespuestasCorrectas - 1);
    }
    setListaRespuestas((prevRespuestas) => prevRespuestas.filter((respuesta, i) => i !== index));
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center w-100">
      {listaRespuestas.length > 0 ? (
        <div className="d-flex flex-column justify-content-center align-items-baseline bg-body-secondary rounded-3">
          <p className={isDisabled ? "d-block px-3 py-1 m-0" : "d-none px-3 py-1 m-0"}>
            Las respuestas se actualizan al cambiar su valor.
          </p>
          <div className="d-flex justify-content-center align-items-center px-3 py-1">
            <p className="m-0 me-1">Valor total por contestar correctamente: </p>
            <h4 className="m-0">{valorPuntosPregunta} puntos</h4>
          </div>
          <div className="d-flex justify-content-center align-items-center w-100 flex-wrap mt-2">
            <div
              className={
                preguntaContestada
                  ? contestadaCorrectamente
                    ? "form-control is-valid" // Cuando contestadaCorrectamente es true
                    : "form-control is-invalid" // Cuando contestadaCorrectamente es false
                  : // <div className="invalid-feedback">Respuesta incorrecta.</div>
                    "form-control" // Cuando preguntaContestada es false (es 0)
              }>
              <ol
                type="A"
                className="d-flex justify-content-center align-items-center flex-wrap p-0 my-3">
                {listaRespuestas.map((respuesta, index) => {
                  if (!isDisabled) {
                    return (
                      <div
                        key={respuesta.id}
                        className="d-flex flex-column justify-content-center align-items-center bg-body-tertiary rounded-2 border-light-subtle border-2 mx-3 my-1 p-1">
                        {/* <input type="text" name="respuesta" value={respuesta.respuesta} /> */}
                        {/* 
                      ======================================================================
                      ======================================================================
                      ======================================================================
                      RENDERIZAR BIEN LA PREGUNTA DE OPCIÓN MÚLTIPLE Y PROBAR SU FUNCIONAMIENTO CON Y SIN CONTENIDOS CON Y SIN IMG Y LINKS
                      DESPUÉS PASAR A EL JUEGO DE PREGUNTAS SECUENCIALES (EL DE LAS PUERTAS) Y LUEGO PROBARLO
                      ======================================================================
                      ======================================================================
                      ======================================================================
                      
                      
                      */}
                        <li>
                          <div>
                            <input
                              className="form-check-input form-check-inline"
                              id={`flexCheckDefault-${index}`}
                              type="checkbox"
                              name="seleccionada"
                              checked={respuesta.seleccionada}
                              // value=""
                              onChange={(e) => handleActualizarRespuesta(e, index)}
                            />
                            <label className="form-check-label" for="flexCheckDefault">
                              {respuesta.respuesta}
                            </label>
                          </div>
                          {/* <label>
                          <input
                            type="checkbox"
                            // className="me-1"
                          />
                        </label> */}
                        </li>

                        {/* <div className="d-flex justify-content-center align-items-center mb-3">
                        <button
                          className="btn btn-danger"
                          onClick={(e) => handleConfirmarBorrarRespuesta(e, index)}>
                          Borrar
                        </button>
                      </div> */}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={respuesta.id}
                        className="d-flex flex-column justify-content-center align-items-center bg-body-tertiary rounded-2 border-light-subtle border-2 m-1 p-1">
                        <p>
                          Puntos de esta respuesta:{" "}
                          <span className="text-primary-emphasis fw-bold">
                            {respuesta.valorRespuesta} puntos
                          </span>
                        </p>
                        <li>
                          <div className="d-flex flex-column">
                            <input
                              type="text"
                              name="respuesta"
                              value={respuesta.respuesta}
                              onChange={(e) => handleActualizarRespuesta(e, index)}
                            />
                            <label>
                              <input
                                type="checkbox"
                                name="correcta"
                                checked={respuesta.correcta}
                                onChange={(e) => handleActualizarRespuesta(e, index)}
                                className="me-1"
                              />
                              Correcta
                            </label>
                          </div>
                        </li>
                        <div className="d-flex justify-content-center align-items-center mb-3">
                          <button
                            className="btn btn-danger"
                            onClick={(e) => handleConfirmarBorrarRespuesta(e, index)}>
                            Borrar
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </ol>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <button
        className={
          isDisabled
            ? "d-block btn btn-outline-success d-flex justify-content-center align-items-center"
            : "d-none btn btn-outline-success d-flex justify-content-center align-items-center"
        }
        onClick={handleCrearRespuestaAgreguable}>
        <p className="mx-3 my-0">Agregar una respuesta</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-patch-plus"
          viewBox="0 0 16 16">
          <path
            fillRule="evenodd"
            d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"
          />
          <path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636a2.89 2.89 0 0 1 4.134 0l-.715.698a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32a1.89 1.89 0 0 0-1.912-1.911z" />
        </svg>
      </button>
    </div>
  );
}
