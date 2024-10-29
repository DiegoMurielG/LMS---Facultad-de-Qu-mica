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

  // Diccionario de estado para almacenar las preguntas cargadas
  const [preguntasHijoData, setPreguntasHijoData] = useState({});

  // Estado cargando de pregunta
  let pregunta_cargando = {
    _id: "Cargando...",
    typeOfQuestion: "Cargando...",
    position: 0, //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
    completed: false,
    idTask: [], // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
    idBody: "Cargando...", // ID del contenido que tiene el desarrollo previo a la pregunta
    question: "Cargando...",
    totalScore: 0,
    answeredScore: 0, // Como aún no se contesta la pregunta, este valor es 0 por defecto
    answers: [], // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
    // [{ String } respuesta: valor,
    // { String } respuesta: valor,
    // { String } respuesta: valor, ...] || { String } respuesta: valor
    correctAnswer: [], // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
    idFeedback: "Cargando...", // ID del contenido que tiene el desarrollo previo a la pregunta
    contents: [],
    questions: [],
  };

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

  // Se ejecuta cada vez que modifiquemos la lista de preguntas hijo
  useEffect(() => {
    const cargarPreguntasHijo = async () => {
      // Obtenemos los IDs únicos de preguntas hijo, correctas e incorrectas para evitar llamadas redundantes
      const idsPreguntas = listaPreguntasHijo
        .flatMap((preguntaHijo) => [
          preguntaHijo.id_pregunta_hijo,
          preguntaHijo.id_pregunta_correcta,
          preguntaHijo.id_pregunta_incorrecta,
        ])
        .filter((id) => id && !preguntasHijoData[id]);

      // Cargamos los datos de todas las preguntas que necesitan cargarse
      const preguntasCargadas = await Promise.all(
        idsPreguntas.map(async (id) => {
          const preguntaCargada = await buscarPreguntaPorId(id);
          return { id, data: preguntaCargada || pregunta_cargando };
        })
      );

      // Actualizamos el estado de preguntasHijoData con las preguntas cargadas
      setPreguntasHijoData((prevState) => ({
        ...prevState,
        ...preguntasCargadas.reduce((acc, { id, data }) => {
          acc[id] = data;
          return acc;
        }, {}),
      }));
    };

    // Ejecutamos cargarPreguntasHijo solo si hay preguntas en listaPreguntasHijo
    if (listaPreguntasHijo.length > 0) {
      cargarPreguntasHijo();
    }
  }, [listaPreguntasHijo, preguntasHijoData]);

  // Se ejecuta cada vez que registramos una pregunta hijo nueva
  useEffect(() => {
    console.log(JSON.stringify(preguntaRegistrada));
    // Guardamos la pregunta registrada a la lista de preguntas hijo de la pregunta Interactiva Secuencial
    // Nos aseguramos de que la pregunta no sea un objeto vacío revisando que exista el atributo typeOfQuestion
    if (preguntaRegistrada.typeOfQuestion) {
      // Actualizar el objeto con la pregunta registrada y las preguntas correcta e incorrecta si se crean (pregunta hijo) con la siguiente estructura:
      /*
      {
        id_pregunta_hijo: El ID de la pregunta hijo que se está visualizando actualmente que el usuario debe contestar.
        [Opcional] id_pregunta_correcta: El ID de la pregunta a la que se manda si el usuario contesta correctamente.
        [Opcional] id_pregunta_incorrecta: El ID de la pregunta a la que se manda si el usuario contesta incorrectamente.

      },
      */

      // Cambiar la forma ne la que se renderiza condicionalmente la lista de "listaPreguntasHijo", ya que ahora esta tendrá los objetos de preguntas hijo que contienen hasta 3 preguntas diferentes
      // Después añadir la opción de agregar una pregunta de tipo pregunta correcta e igual para la pregunta de tipo incorrecta (La misma funcionalidad de registrar una pregunta nueva que no pertenezca a ninguna activdad y, que cuando se registre se muestre en su lugar el componente de <PreguntaIndividual /> para poder tener un "CRUD" de preguntas correctas e incorrectas también)
      // Añadir la búsqueda de preguntas en la DB para añadirlas como pregunta, pregunta correcta o pregunta incorrecta para no solo tener que darlas de alta ahí mismo
      const preguntaRegistrada_obj = {
        id_pregunta_hijo: preguntaRegistrada._id,
        id_pregunta_correcta: "",
        id_pregunta_incorrecta: "",
      };
      // Evitamos guardar preguntas con un _id vacío
      if (preguntaRegistrada._id != "") {
        // Evitamos duplicados

        // Verifica si ya existe la pregunta en `listaPreguntasHijo`
        const existePregunta = listaPreguntasHijo.some(
          (pregunta) => pregunta.id_pregunta_hijo === preguntaRegistrada._id
        );

        if (!existePregunta) {
          // Solo actualiza el estado si la pregunta no está en la lista
          setListaPreguntasHijo((prevLista) => [...prevLista, preguntaRegistrada_obj]);
          console.log(JSON.stringify(listaPreguntasHijo));
        }
        // if (!listaPreguntasHijo.find(({ _id }) => _id === preguntaRegistrada._id)) {
        //   setListaPreguntasHijo([...listaPreguntasHijo, preguntaRegistrada_obj]);
        // }
      }
    }
  }, [preguntaRegistrada]);

  /**
   *  Función que busca por ID una pregunta y regresa un objeto de tipo Question con los datos de la pregunta buscada.
   *
   * @param {String} id_pregunta_a_buscar - ID de la pregunta a buscar
   * @returns  {Object} pregunta - Objeto tipo Question que contiene los datos de la pregunta
   */
  const buscarPreguntaPorId = async (id_pregunta_a_buscar) => {
    let objeto_pregunta = null;
    try {
      const response = await api.post("/buscar-preguntas", {
        palabra_a_buscar: `#: ${id_pregunta_a_buscar.toString()}`,
      });
      if (response.data.docs) {
        objeto_pregunta = response.data.docs[0];
      }
    } catch (error) {
      console.error(`Error buscando la pregunta con ID: ${id_pregunta_a_buscar}\n`, error);
    }
    console.log(JSON.stringify(objeto_pregunta));
    return objeto_pregunta;
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
        <div className="d-flex flex-column justify-content-center align-items-center w-100">
          {listaPreguntasHijo.length > 0 ? (
            listaPreguntasHijo.map((preguntaHijo, index) => {
              // Buscamos la pregunta cargada en preguntasHijoData
              const preguntaCargada = preguntasHijoData[preguntaHijo.id_pregunta_hijo];

              // Mostramos un placeholder mientras cargamos los datos
              return (
                <div key={`pregunta-hijo-${index}`} className="w-100">
                  <div>
                    {preguntaCargada ? (
                      <PreguntaIndividual
                        pregunta={preguntaCargada}
                        flechaVacia={flechaVacia}
                        flechaLlena={flechaLlena}
                        cantidad_preguntas_por_actividad={"Pregunta-hijo"}
                        arreglo_objetos_actividades_por_pregunta={"Pregunta-hijo"}
                      />
                    ) : (
                      // Muestra un componente o texto de "Cargando..." mientras se espera que la pregunta se cargue
                      <span>Cargando...</span>
                    )}
                  </div>
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
