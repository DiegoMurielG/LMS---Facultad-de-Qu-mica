import { useEffect, useState } from "react";

export default function RespuestaCompletarTexto({ data_respuesta = [], valorPuntosPregunta = 0 }) {
  const [textoACompletar, setTextoACompletar] = useState("");
  const [palabrasTextoACompletar, setPalabrasTextoACompletar] = useState([]);
  const [cantidadRespuestasCompletar, setCantidadRespuestasCompletar] = useState(0);

  useEffect(() => {
    if (data_respuesta.length > 0) {
      alert("Cargar los datos de la pregunta en CompletarTexto...");
      setTextoACompletar(data_respuesta.at[0]);
    }
  }, [data_respuesta]);

  useEffect(() => {
    if (textoACompletar !== "") {
      const separadores = /([,\n@.])/;
      const palabrasNuevasSeparadas = textoACompletar
        .split(separadores)
        .flatMap((parte) => parte.split(" ")) // Separa por espacios también
        .filter((palabra) => palabra !== ""); // Elimina las palabras vacías

      // Combina "@" con la siguiente palabra
      const resultadoFinal = [];
      for (let i = 0; i < palabrasNuevasSeparadas.length; i++) {
        if (palabrasNuevasSeparadas[i] === "@" && i < palabrasNuevasSeparadas.length - 1) {
          resultadoFinal.push("@" + palabrasNuevasSeparadas[i + 1]);
          i++; // Saltar la siguiente palabra ya que se ha combinado con "@"
        } else {
          resultadoFinal.push(palabrasNuevasSeparadas[i]);
        }
      }

      // console.log(resultadoFinal);
      setPalabrasTextoACompletar(() => {
        let arregloDivs = [];
        let indexInicio = 0;

        // Contar cantidad de palabras a completar
        let cantidadACompletar = resultadoFinal.reduce((count, palabra) => {
          return palabra.charAt(0) === "@" ? count + 1 : count;
        }, 0);

        // Actualizar estado con la cantidad de respuestas a completar
        setCantidadRespuestasCompletar(cantidadACompletar);

        while (indexInicio < resultadoFinal.length) {
          let indexSiguienteEnter = resultadoFinal.indexOf("\n", indexInicio);

          if (indexSiguienteEnter === -1) {
            indexSiguienteEnter = resultadoFinal.length;
          }

          let palabrasSegmento = resultadoFinal.slice(indexInicio, indexSiguienteEnter);
          arregloDivs.push(
            <div
              className="d-flex justify-content-center align-items-center w-100 flex-wrap"
              key={indexInicio}>
              {palabrasSegmento.map((palabra, index) => {
                if (palabra.charAt(0) === "@") {
                  return (
                    <div
                      className="d-flex flex-column justify-content-center align-items-center bg-light-subtle rounded-3"
                      key={index}>
                      <div className="d-flex justify-content-center align-items-center px-3 py-1 flex-column">
                        <p className="m-0 me-1">Puntos de esta respuesta: </p>
                        <span className="text-primary-emphasis fw-bold m-0 me-1">
                          {cantidadACompletar > 0 ? valorPuntosPregunta / cantidadACompletar : 0}{" "}
                        </span>
                        <p className="m-0">puntos</p>
                      </div>
                      <div className="form-floating m-1">
                        <input
                          type="text"
                          className="form-control me-1 mb-1"
                          placeholder="Palabra a completar"
                          id={`floatingInput-palabra-a-completar-${index}`}
                          value={palabra}
                          disabled={true}
                        />
                        <label htmlFor={`floatingInput-palabra-a-completar-${index}`}>
                          Completar
                        </label>
                      </div>
                    </div>
                  );
                } else if (palabra === "\n") {
                  return <br key={index} />;
                } else if (palabra.charAt(0) === "," || palabra.charAt(0) === ".") {
                  return (
                    <p className="ms-0 me-1 my-1" key={index}>
                      {palabra}
                    </p>
                  );
                } else {
                  // Cualquier otra cosa al inicio de la cadena
                  return (
                    <p className="m-0 ms-1" key={index}>
                      {palabra}
                    </p>
                  );
                }
              })}
            </div>
          );

          indexInicio = indexSiguienteEnter + 1;
        }

        return arregloDivs;
      });

      //   let cantidadEnters = resultadoFinal.flatMap((palabra) => palabra.matchAll(/\n/gm)).length;
      //   let arregloDivs = [];
      //   let indexInicio = 0;
      //   let indexSiguienteEnter = 0;
      //   for (let i = 0; i < cantidadEnters; i = i) {
      //     indexSiguienteEnter = resultadoFinal.findIndex(/\n/g);
      //     arregloDivs.push(
      //       <div className="d-flex justify-content-center align-items-center w-100">
      //         {resultadoFinal.slice(indexInicio, indexSiguienteEnter).map((palabra, index) => {
      //           if (palabra.charAt(0) === "@") {
      //             return (
      //               <div className="form-floating m-1">
      //                 <input
      //                   type="text"
      //                   className="form-control me-1 mb-1"
      //                   placeholder="Palabra a completar"
      //                   id={`floatingInput-palabra-a-completar-${index}`}
      //                   value={palabra}
      //                   disabled={true}
      //                 />
      //                 <label htmlFor={`floatingInput-palabra-a-completar-${index}`}>
      //                   Completar
      //                 </label>
      //               </div>
      //             );
      //           } else if (palabra.charAt(0) === "\n") {
      //             return <br></br>;
      //           } else if (palabra.charAt(0) === "," || palabra.charAt(0) === ".") {
      //             return <p className="ms-0 me-1 my-1">{palabra}</p>;
      //           } else {
      //             // Cualquier otra cosa al inicio de la cadena
      //             return <p className="m-1">{palabra}</p>;
      //           }
      //         })}
      //       </div>
      //     );
      //     indexInicio = indexSiguienteEnter;
      //     i++;
      //   }
      //   // resultadoFinal.map((palabra, index) => {
      //   //   if (palabra.charAt(0) === "@") {
      //   //     return (
      //   //       <div className="form-floating m-1">
      //   //         <input
      //   //           type="text"
      //   //           className="form-control me-1 mb-1"
      //   //           placeholder="Palabra a completar"
      //   //           id={`floatingInput-palabra-a-completar-${index}`}
      //   //           value={palabra}
      //   //           disabled={true}
      //   //         />
      //   //         <label htmlFor={`floatingInput-palabra-a-completar-${index}`}>Completar</label>
      //   //       </div>
      //   //     );
      //   //   } else if (palabra.charAt(0) === "\n") {
      //   //     return <br></br>;
      //   //   } else if (palabra.charAt(0) === "," || palabra.charAt(0) === ".") {
      //   //     return <p className="ms-0 me-1 my-1">{palabra}</p>;
      //   //   } else {
      //   //     // Cualquier otra cosa al inicio de la cadena
      //   //     return <p className="m-1">{palabra}</p>;
      //   //   }
      //   // });
      //   return arregloDivs;
      // });
    }
  }, [textoACompletar]);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center bg-body-secondary rounded-3 w-100">
      <p className="my-2 mx-0">
        Escriba '<span className="fw-bold text-primary-emphasis">@</span>' para crear un campo a
        rellenar
      </p>
      <div className="d-flex justify-content-center align-items-center px-3 py-1">
        <p className="m-0 me-1">Valor total por contestar correctamente: </p>
        <h4 className="m-0">{valorPuntosPregunta} puntos</h4>
      </div>
      <div className="form-floating w-100">
        <textarea
          className="form-control"
          onChange={(e) => {
            setTextoACompletar(e.target.value);
          }}
          placeholder="Ingresa el texto a completar aquí"
          id="floatingTextarea-completar-texto"
          style={{ height: "150px" }}></textarea>
        <label htmlFor="floatingTextarea-completar-texto">Ingresa el texto a completar aquí</label>
      </div>
      <div
        className="d-flex
        flex-wrap
        justify-content-center
        align-items-center
        bg-body-tertiary
        rounded-3
        border-light-subtle
        border-2"
        // className="d-flex flex-wrap w-100 bg-body-tertiary rounded-3 m-3"
      >
        {palabrasTextoACompletar}
      </div>
    </div>
  );
}
