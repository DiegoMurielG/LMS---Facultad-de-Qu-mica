import React, { useEffect, useState } from "react";
import InputBuscador from "./InputBuscador";
import RegistrarPregunta from "./RegistrarPregunta";
import axios from "axios";

/**
 * RegistrarOBuscarPregunta component allows the user to either search for an existing question or create a new one.
 * It provides a dropdown to choose the action and renders the appropriate UI based on the selection.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * // Usage example:
 * <RegistrarOBuscarPregunta />
 *
 * @example
 * // Example with props:
 * <RegistrarOBuscarPregunta
 *   registrandoPregunta={true}
 *   origenDeLaPreguntaHijo="buscar-pregunta-existente"
 *   preguntasBuscadas=""
 *   preguntasDisponibles={[]}
 *   preguntasSeleccionadas={[]}
 *   setPreguntasSeleccionadas={() => {}}
 *   handleBuscarPreguntas={() => {}}
 *   handleAgruegarPreguntaBuscada={() => {}}
 *   aniadirPreguntaHijo={() => {}}
 *   preguntaRegistrada={{}}
 *   setPreguntaRegistrada={() => {}}
 *   setRegistrandoPregunta={() => {}}
 * />
 */
/**
 *
 * @returns
 */

export default function RegistrarOBuscarPregunta({
  // registrandoPregunta, Local
  // origenDeLaPreguntaHijo, Local porque se elige en el Select
  // handleBuscarPreguntas, Local
  // handleAgruegarPreguntaBuscada, Local
  // aniadirPreguntaHijo, Reemplazar por aniadirPregunta(tipoDepreguntaAAniadir)
  preguntaRegistrada, // Por esta variable de estado pasarán los datos de la pregunta que se está registrando
  setPreguntaRegistrada,
  tipoDePreguntaAAniadir, // Por esta variable de estado se pasará el tipo de pregunta que se va a añadir
  registrandoPregunta,
  setRegistrandoPregunta,
  idPreguntaHijoALaQuePertenece, // Se utiliza para ligar la pregunta correcta o incorrecta a la pregunta hijo que la contiene
  // setRegistrandoPregunta,
  // elegirAccionParaCrearPreguntaHijo, Local
}) {
  // Input Buscador
  const [preguntasBuscadas, setPreguntasBuscadas] = useState("");
  const [preguntasDisponibles, setPreguntasDisponibles] = useState([]);
  const [preguntasSeleccionadas, setPreguntasSeleccionadas] = useState([]);

  // Para elegir de donde crear la pregunta hijo, se utiliza en elegirAccionParaCrearPreguntaHijo
  const [origenDeLaPreguntaHijo, setOrigenDeLaPreguntaHijo] = useState("");

  // API
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Usa la URL de la variable de entorno
    withCredentials: true, // Si necesitas enviar cookies
  });

  // Para elegir de donde crear la pregunta hijo
  const elegirAccionParaCrearPreguntaHijo = (e) => {
    e.preventDefault();
    let origen_de_creacion = e.target.value;
    setOrigenDeLaPreguntaHijo(origen_de_creacion);
  };

  const handleAgruegarPreguntaBuscada = async (e, tipoDePregunta) => {
    e.preventDefault();
    if (preguntasSeleccionadas.length > 0) {
      // Buscamos la pregunta que tenemos con el ID del chip de la pregunta
      const id_pregunta_a_buscar = preguntasSeleccionadas[0]._id;
      let pregunta = null;
      try {
        const response = await api.post("/buscar-preguntas", {
          palabra_a_buscar: `#: ${id_pregunta_a_buscar.toString()}`,
        });
        if (response.data.docs[0]) {
          pregunta = response.data.docs[0];
        }
      } catch (error) {
        console.error(`Error buscando la pregunta ID: ${id_pregunta_a_buscar}`.error);
      }
      if (tipoDePregunta == "pregunta-hijo") {
        console.log(JSON.stringify(pregunta));
        setPreguntaRegistrada({
          "pregunta-hijo": pregunta,
        });
      } else if (tipoDePregunta == "pregunta-correcta") {
        // Agrega setPreguntaCorrecta
        setPreguntaRegistrada({
          "pregunta-correcta": pregunta,
          idPreguntaHijoALaQuePertenece: idPreguntaHijoALaQuePertenece,
        });
      } else {
        // tipoDePregunta == "pregunta-incorrecta"
        // Agrega setPreguntaIncorrecta
        setPreguntaRegistrada({
          "pregunta-incorrecta": pregunta,
          idPreguntaHijoALaQuePertenece: idPreguntaHijoALaQuePertenece,
        });
      }
    }
  };

  const handleBuscarPreguntas = (e) => {
    e.preventDefault();

    setPreguntasBuscadas(e.target.value);
  };

  const aniadirPreguntaHijo = () => {
    setRegistrandoPregunta(true);
  };

  // Búsqueda de preguntas en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la pregunta escrita en la DB
    api
      .post("/buscar-preguntas", {
        palabra_a_buscar: preguntasBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const preguntasEncontradas = response.data.docs;
        console.log(preguntasEncontradas);
        if (preguntasEncontradas.length > 0) {
          // Se encontró al menos 1 pregunta que coincide con el nombre escrito
          // Las preguntas obtenidas serán guardadas en preguntasDisponibles
          preguntasEncontradas.forEach((preguntaEncontrada) => {
            // Guardamos el objeto de pregunta dentro de preguntasDisponibles evitando que se repita
            let preguntaEstaDisponible = preguntasDisponibles.find((pregunta) => {
              return pregunta._id === preguntaEncontrada._id;
            });
            if (!preguntaEstaDisponible) {
              setPreguntasDisponibles([
                ...preguntasDisponibles,
                {
                  _id: preguntaEncontrada._id,
                  valor_puntos_pregunta: preguntaEncontrada.totalScore,
                  nombre: (
                    <>
                      {preguntaEncontrada.question}
                      <br></br>
                      Tipo: {preguntaEncontrada.typeOfQuestion}
                    </>
                  ),
                },
              ]);
            }
          });
        } else {
          // No se encontrarón preguntas que coincidieran con el texto ingresado en "preguntasBuscados" dentro del InputBuscador
          setPreguntasDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la pregunta ${preguntasBuscadas}.\n${error}`);
      });
  }, [preguntasBuscadas]);

  return (
    <div>
      <div className={registrandoPregunta ? "d-block" : " d-none"}>
        <div className="d-flex flex-column justify-content-center align-items-center">
          <select
            defaultValue={""}
            onChange={(e) => {
              elegirAccionParaCrearPreguntaHijo(e);
            }}
            className={registrandoPregunta ? "d-block mb-3" : "d-none"}>
            <option value={""} disabled={true}>
              <p>Eliga una acción a continuación</p>
            </option>
            <option value={"buscar-pregunta-existente"}>
              <p className="m-0">Buscar pregunta existente</p>
            </option>
            <option value={"crear-pregunta-nueva"}>
              <p className="m-0">Crear pregunta nueva</p>
            </option>
          </select>
          <div
            className={
              registrandoPregunta && origenDeLaPreguntaHijo == "buscar-pregunta-existente"
                ? "d-block"
                : "d-none"
            }>
            <InputBuscador
              name="preguntasBuscadas"
              id="floatingInput-preguntas"
              placeholder="Busque preguntas por nombre"
              label="Preguntas"
              onChange={(e) => {
                // console.log(e);
                handleBuscarPreguntas(e);
              }}
              value={preguntasBuscadas}
              // searching={"actividades"}
              elementosDisponibles={preguntasDisponibles}
              elementosSeleccionados={preguntasSeleccionadas}
              setElementosSeleccionados={setPreguntasSeleccionadas}
              aQuienAsignamos="actividad"
              queBuscamos="preguntas"
              buscarSoloUnaPregunta={true}
              renderizarPreguntaBuscada={true}
            />
            <button
              type="button"
              onClick={(e) => {
                handleAgruegarPreguntaBuscada(e, tipoDePreguntaAAniadir);
              }}
              className={
                preguntasSeleccionadas.length > 0
                  ? "enabled btn btn-primary my-3 w-100 btn-lg"
                  : "disabled btn btn-primary my-3 w-100 btn-lg"
              }>
              Añadir pregunta buscada como{" "}
              {tipoDePreguntaAAniadir == "pregunta-hijo"
                ? "hijo"
                : tipoDePreguntaAAniadir == "pregunta-correcta"
                ? "correcta"
                : "incorrecta"}
            </button>
          </div>
          <div
            className={
              registrandoPregunta && origenDeLaPreguntaHijo == "crear-pregunta-nueva"
                ? "d-block"
                : "d-none"
            }>
            <RegistrarPregunta
              handleSubmitExterno={"registrando-pregunta-hijo"}
              adding_childern_question={true}
              question={preguntaRegistrada}
              setQuestion={setPreguntaRegistrada}
              registrandoPregunta={registrandoPregunta}
              setRegistrandoPregunta={setRegistrandoPregunta}
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          aniadirPreguntaHijo();
        }}
        className={registrandoPregunta ? "d-none" : "d-block btn btn-primary my-3 w-100 btn-lg"}>
        Añadir pregunta{" "}
        {tipoDePreguntaAAniadir == "pregunta-hijo"
          ? "hijo"
          : tipoDePreguntaAAniadir == "pregunta-correcta"
          ? "correcta"
          : "incorrecta"}
      </button>
    </div>
  );
}
