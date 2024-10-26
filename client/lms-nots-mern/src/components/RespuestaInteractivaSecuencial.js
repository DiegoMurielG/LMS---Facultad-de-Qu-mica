import { useEffect, useState } from "react";
import RegistrarPregunta from "./RegistrarPregunta";
import Swal from "sweetalert2";

export default function RespuestaInteractivaSecuencial() {
  // listaPreguntasHijo == questions en Question
  const [listaPreguntasHijo, setListaPreguntasHijo] = useState([]);
  const [preguntaRegistrada, setPreguntaRegistrada] = useState([]);
  let registrandoPregunta = false;

  const aniadirPreguntaHijo = async () => {
    // const { value: pregunta } = await Swal.fire({
    //   title: "Registrar Pregunta Hijo",
    //   html: `
    //   <RegistrarPregunta
    //     adding_childern_question={true}
    //     question={preguntaRegistrada}
    //     setQuestion={setPreguntaRegistrada}
    //   />
    //   `,
    //   focusConfirm: false,
    //   // preConfirm: () => {
    //   //   // useEffect(() => {
    //   //   //   setPreguntaRegistrada(pre)
    //   //   // }, [preguntaRegistrada])
    //   //   return [preguntaRegistrada];
    //   // },
    // });
    // if (pregunta) {
    //   Swal.fire({ title: "Pregunta hijo registrada", text: JSON.stringify(pregunta) });
    // }
    // setListaPreguntasHijo([...listaPreguntasHijo, pregunta]);
    registrandoPregunta = true;
  };
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
              pregunta. <b>Después de contestar una pregunta hijo correctamente</b>, se habilitará
              automáticamente la siguiente <i>pregunta hijo</i> en la lista.
            </p>
          </li>
        </ol>
      </div>

      {/* Añadir preguntas */}
      <div className="d-flex flex-column justify-content-center align-items-center bg-body-secondary rounded-3 w-100">
        <h4>Preguntas hijo</h4>
        <RegistrarPregunta
          className={!registrandoPregunta ? "d-block" : " d-none"}
          adding_childern_question={true}
          question={preguntaRegistrada}
          setQuestion={setPreguntaRegistrada}
        />
        {listaPreguntasHijo.length > 0 ? listaPreguntasHijo : <></>}
        <button type="button" onClick={aniadirPreguntaHijo} className="btn btn-success">
          Añadir pregunta hijo
        </button>
      </div>
    </div>
  );
}
