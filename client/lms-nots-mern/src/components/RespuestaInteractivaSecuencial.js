import { useEffect, useState } from "react";
import RegistrarPregunta from "./RegistrarPregunta";
import Swal from "sweetalert2";
import axios from "axios";
import RenderPreguntaIndividual from "./RenderPreguntaIndividual";
import PreguntaIndividual from "./PreguntaIndividual";

export default function RespuestaInteractivaSecuencial() {
  // Para la vizualización de la pregunta
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

  // listaPreguntasHijo == questions en Question
  const [listaPreguntasHijo, setListaPreguntasHijo] = useState([]);
  const [preguntaRegistrada, setPreguntaRegistrada] = useState({});
  const [registrandoPregunta, setRegistrandoPregunta] = useState(false);
  // let registrandoPregunta = false;

  // API
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  const aniadirPreguntaHijo = () => {
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

    // registrandoPregunta = true;
    setRegistrandoPregunta(true);
  };

  // Se ejecuta cada vez que registramos una pregunta hijo nueva
  useEffect(() => {
    console.log(JSON.stringify(preguntaRegistrada));
    // Guardamos la pregunta registrada a la lista de preguntas hijo de la pregunta Interactiva Secuencial
    // Nos aseguramos de que la pregunta no sea un objeto vacío revisando que exista el atributo typeOfQuestion
    if (
      preguntaRegistrada.typeOfQuestion &&
      !listaPreguntasHijo.find(({ _id }) => _id == preguntaRegistrada._id)
    ) {
      // Guardar el objeto con la pregunta registrada (pregunta hijo )con la siguiente estructura:
      /*
      {
        ID_pregunta_hijo: El ID de la pregunta hijo que se está visualizando actualmente que el usuario debe contestar.
        [Opcional] ID_pregunta_correcta: El ID de la pregunta a la que se manda si el usuario contesta correctamente.
        [Opcional] ID_pregunta_incorrecta: El ID de la pregunta a la que se manda si el usuario contesta incorrectamente.

      },
      */

      // Luego cambiar la forma ne la que se renderiza condicionalmente la lista de "listaPreguntasHijo", ya que ahora esta tendrá los objetos de preguntas hijo que contienen hasta 3 preguntas diferentes
      // Después añadir la opción de agregar una pregunta de tipo pregunta correcta e igual para la pregunta de tipo incorrecta (La misma funcionalidad de registrar una pregunta nueva que no pertenezca a ninguna activdad y, que cuando se registre se muestre en su lugar el componente de <PreguntaIndividual /> para poder tener un "CRUD" de preguntas correctas e incorrectas también)
      setListaPreguntasHijo([...listaPreguntasHijo, preguntaRegistrada]);
    }
  }, [preguntaRegistrada]);

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
        <div className="d-flex flex-column justify-content-center align-items-center w-100">
          {listaPreguntasHijo.length > 0 ? (
            listaPreguntasHijo.map((preguntaHijo, index) => {
              return (
                <div key={`pregunta-hijo-${index}`} className="w-100">
                  <PreguntaIndividual
                    pregunta={preguntaHijo}
                    flechaVacia={flechaVacia}
                    flechaLlena={flechaLlena}
                    cantidad_preguntas_por_actividad={"Pregunta-hijo"}
                    arreglo_objetos_actividades_por_pregunta={"Pregunta-hijo"}
                  />
                  {/* <RenderPreguntaIndividual pregunta={preguntaHijo} /> */}
                </div>
              );
            })
          ) : (
            <></>
          )}
        </div>
        <div className={registrandoPregunta ? "d-block" : " d-none"}>
          <RegistrarPregunta
            handleSubmitExterno={"registrando-pregunta-hijo"}
            adding_childern_question={true}
            question={preguntaRegistrada}
            setQuestion={setPreguntaRegistrada}
            registrandoPregunta={registrandoPregunta}
            setRegistrandoPregunta={setRegistrandoPregunta}
          />
        </div>
        <button type="button" onClick={aniadirPreguntaHijo} className="btn btn-success">
          Añadir pregunta hijo
        </button>
      </div>
    </div>
  );
}
