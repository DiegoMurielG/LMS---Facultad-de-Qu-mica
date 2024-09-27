import { useEffect, useState } from "react";
import RespuestaAbierta from "./RespuestaAbierta";
import RespuestaOpcionMultiple from "./RespuestaOpcionMultiple";

/**
 *
 * @param {Array} data_respuestas - Arreglo de tublas donde cada una es {}:objeto
 * @returns
 */
export default function Respuestas({
  data_respuestas,
  tipoPregunta,
  listaRespuestas,
  setListaRespuestas,
}) {
  const [respuestaAMostrar, setRespuestaAMostrar] = useState(<></>);
  // let dictTiposRespuesta = {
  //   "Abierta": ,
  //   "Opción múltiple": ,
  //   "Varias preguntas": [{ component: <></> }],
  //   "Interactiva secuencial": [{ component: <></> }],
  //   "Completar un texto": [{ component: <></> }],
  //   "Llenar datos y graficar": [{ component: <></> }],
  // };

  const dictTiposRespuesta = {
    1: <RespuestaAbierta data_respuesta={data_respuestas} />,
    2: (
      <RespuestaOpcionMultiple
        listaRespuestas={listaRespuestas}
        setListaRespuestas={setListaRespuestas}
      />
    ),

    3: <></>,
    4: <></>,
    5: <></>,
    6: <></>,
  };

  useEffect(() => {
    if (tipoPregunta) {
      setRespuestaAMostrar(dictTiposRespuesta[tipoPregunta]);
    }
  }, [tipoPregunta]);

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <h3 className="mb-3">Respuestas</h3>
      {/* {data_respuestas.length > 0
        ? data_respuestas.map((respuesta, index) => (
            <div
              key={index}
              className="d-flex flex-column justify-content-center align-items-baseline p-1 bg-body-secondary rounded-3">
              <p>{respuesta.respuesta}</p>
              <form>
                <input type="checkbox" value="Opción correcta" checked={respuesta.correcta}></input>
              </form>
            </div>
          ))
        : } */}
      {/* Renderizar la respuesta con datos según su tipo */}
      {respuestaAMostrar}
    </div>
  );
}
