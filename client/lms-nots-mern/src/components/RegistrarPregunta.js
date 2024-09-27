import axios from "axios";
import InputBuscador from "./InputBuscador";
import { useEffect, useState } from "react";
import RegistrarContenido from "./RegistrarContenido";
import Respuestas from "./Respuestas";
import WrapperRespuestas from "./WrapperRespuestas";
import RespuestaAbierta from "./RespuestaAbierta";
import RespuestaOpcionMultiple from "./RespuestaOpcionMultiple";
import RespuestaCompletarTexto from "./RespuestaCompletarTexto";
import Swal from "sweetalert2";
import RespuestaSeccionPasos from "./RespuestaSeccionPasos";
import RespuestaCompletarNumerosTabla from "./RespuestaCompletarNumerosTabla";
import RespuestaVideoInteractivo from "./RespuestaVideoInteractivo";
import RespuestaIntervaloNumerico from "./RespuestaIntervaloNumerico";
import { json } from "react-router-dom";

export default function RegistrarPregunta({ handleSubmitExterno = null }) {
  // { actividades = [] }
  // Hacer un formulario para registrar una pregunta, asignarla a una sección y mostrarla hasta abajo (Ver Secciones, Ver Actividades y Ver Preguntas)
  let pregunta = {
    _id: "",
    typeOfQuestion: "Abierta",
    position: 0, //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
    completed: false,
    idTask: [], // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
    idBody: "", // ID del contenido que tiene el desarrollo previo a la pregunta
    question: "",
    totalScore: 0,
    answeredScore: 0, // Como aún no se contesta la pregunta, este valor es 0 por defecto
    answers: [], // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
    // [{ String } respuesta: valor,
    // { String } respuesta: valor,
    // { String } respuesta: valor, ...] || { String } respuesta: valor
    correctAnswer: [], // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
    idFeedback: "", // ID del contenido que tiene el desarrollo previo a la pregunta
    contents: [],
    questions: [],
  };

  const [textoPregunta, setTextoPregunta] = useState("");
  const [answers, setAnswers] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState([]);

  // Input Buscador
  const [actividadesBuscadas, setActividadesBuscadas] = useState("");
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);

  // Registrar contenido previo
  const [textoContenidoPrevio, setTextoContenidoPrevio] = useState("");
  const [idContenidoPrevio, setIdContenidoPrevio] = useState("");

  // Registrar contenido posterior
  const [textoContenidoPosterior, setTextoContenidoPosterior] = useState("");
  const [idContenidoPosterior, setIdContenidoPosterior] = useState("");

  const tipoPreguntaDict = {
    1: "Abierta",
    2: "Opción múltiple",
    3: "Intervalo numérico",
    4: "Varias preguntas",
    5: "Interactiva secuencial",
    6: "Completar un texto",
    7: "Llenar datos y graficar",
    8: "Completar número en tabla",
    9: "Video interactivo con preguntas",
    10: "Secuencia de pasos",
  };
  const [tipoPregunta, setTipoPregunta] = useState("");
  // Arreglo de objetos respuesta: [{{String} respuesta: valor, {bool} correcta: valor }]
  // Se modifica en el componente de <RespuestaOpcionMultiple />
  const [listaRespuestas, setListaRespuestas] = useState([]);

  // Arreglo de elementos de la tabla a completar
  const [listaElementosTabla, setListaElementosTabla] = useState([]);
  const [valorPuntosPregunta, setValorPuntosPregunta] = useState(0);
  const [numeroColumnas, setNumeroColumnas] = useState(2);
  const [numeroFilas, setNumeroFilas] = useState(2);

  // const [respuestaAMostrar, setRespuestaAMostrar] = useState(<></>);

  // const dictTiposRespuesta = {
  //   1: <RespuestaAbierta data_respuesta={data_respuestas} />,
  //   2: (
  //     <RespuestaOpcionMultiple
  //       listaRespuestas={listaRespuestas}
  //       setListaRespuestas={setListaRespuestas}
  //     />
  //   ),

  //   3: <></>,
  //   4: <></>,
  //   5: <></>,
  //   6: <></>,
  // };

  // useEffect(() => {
  //   if (tipoPregunta) {
  //     setRespuestaAMostrar(dictTiposRespuesta[tipoPregunta]);
  //   }
  // }, [tipoPregunta]);

  axios.defaults.withCredentials = true;

  // useEffect para actualizar correctAnswers cuando listaRespuestas cambie
  useEffect(() => {
    if (tipoPreguntaDict[tipoPregunta] === "Intervalo numérico") {
      setCorrectAnswers(listaRespuestas);
    } else if (
      tipoPreguntaDict[tipoPregunta] === "Completar número en tabla" &&
      listaElementosTabla.length > 0
    ) {
      console.log(`listaElementosTabla: ${JSON.stringify(listaElementosTabla)}`);
      if (listaElementosTabla != []) {
        setAnswers(() => {
          let copia_listaElementosTabla = [...listaElementosTabla];
          let tabla = copia_listaElementosTabla.splice(0, numeroFilas);
          tabla.forEach((fila) => {
            if (fila.length > numeroColumnas) {
              fila.splice(numeroColumnas, Infinity);
            }
          });
          return tabla;
        });

        setCorrectAnswers(() => {
          let copia_listaElementosTabla = [...listaElementosTabla];
          let respuestasCorrectasTabla = copia_listaElementosTabla.flatMap((filaDeElementos) => {
            return filaDeElementos.filter((celda) => celda.completar == true);
          });
          return respuestasCorrectasTabla;
        });
      }
    }
  }, [listaRespuestas, tipoPregunta, listaElementosTabla]);

  const construirPregunta = () => {
    // Colocar el tipo de dato que se guardará en "answers" según el tipo de respuesta que crearemos:
    // Colocar qué guardará el arreglo de respuestas correctas para marcar la respuesta como completada según su tipo
    if (tipoPreguntaDict[tipoPregunta] === "Abierta") {
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    } else if (tipoPreguntaDict[tipoPregunta] === "Opción múltiple") {
      setAnswers([]);
      setCorrectAnswers(() => {
        // La función .filter() regresa una "Shallow copy" del arreglo listaRespuestas, lo que significa que si cambio el arreglo original o la "Shallow copy", estaré alterando ambos, ya que una "Shallow copy" regresa los valores de la variable partiendo desde la misma dirección de memoria que la variable original.
        // A diferencia de lo que estoy haciendo aquí, una "Deep copy", la cual copia los valores obtenidos por la función .filter() y los asigna a una variable independiente a la listaRespuestas, es decir, utiliza otra dirección de memoria.
        let listaRespuestasCorrectas = listaRespuestas.filter(
          (respuesta) => respuesta.correcta === true
        );
        return listaRespuestasCorrectas;
      });
    } else if (tipoPreguntaDict[tipoPregunta] === "Intervalo numérico") {
      // alert(
      //   "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Intervalo numérico"
      // );
      setAnswers([]);
      // Como es una sola pregunta, tendremos un arreglo con una sola respuesta
      // Para validar si está correcta o no la respuesta, tomaremos la respuesta del usuario y revisaremos si está dentro del rango tomando dentro los límites.
      // La listaRespuestas tiene lo siguiente
      // listaRespuestas=[
      //   {
      //       valor: Respuesta ingresada por el usuario,
      //       intervalo: [lím. inf., lím. sup.],
      //     }
      // ]
      setCorrectAnswers([...listaRespuestas]);
      console.log(`listaRespuestas: ${listaRespuestas}`);
      console.log(`correctAnswers: ${correctAnswers}`);
    } else if (tipoPreguntaDict[tipoPregunta] === "Varias preguntas") {
      alert(
        "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Varias preguntas"
      );
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    } else if (tipoPreguntaDict[tipoPregunta] === "Interactiva secuencial") {
      alert(
        "Por definir el tipo de dato de 'answers' en pregunta del tipo: Interactiva secuencial"
      );
    } else if (tipoPreguntaDict[tipoPregunta] === "Completar un texto") {
      alert(
        "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Completar un texto"
      );
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    } else if (tipoPreguntaDict[tipoPregunta] === "Llenar datos y graficar") {
      alert(
        "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Llenar datos y graficar"
      );
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    } else if (tipoPreguntaDict[tipoPregunta] === "Completar número en tabla") {
      // alert(
      //   "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Completar número en tabla"
      // );
      // alert("Revisa el comentario del tipo de dato de Completar número en tabla");
      // console.log(
      //   `desde construirPregunta()\nlistaElementosTabla: ${JSON.stringify(listaElementosTabla)}`
      // );

      // Al guardar la tabla debemos de crear una nueva tabla con solo las celdas que se están viendo, no con todas las que tenemos en la memoria
      setAnswers(() => {
        // Filtramos la tabla a solo tener las filas que tiene la tabla según su tamaño e ignoramos las que están sobrantes dentro de la memoria
        let copia_listaElementosTabla = [...listaElementosTabla];
        let tabla = copia_listaElementosTabla.splice(0, numeroFilas);

        // Filtramos la tabla a solo tener las columnas que tiene la tabla según su tamaño e ignoramos las que están sobrantes dentro de la memoria
        tabla.forEach((fila) => {
          // Verificamos que numeroColumnas esté dentro del tamaño del arreglo para evitar operaciones imposibles
          if (fila.length > numeroColumnas) {
            // splice(start[, deleteCount][, item1, item2,...])
            // Estoy colocando "Infinity" en el atributo de deleteCount porque quiero borrar todos los elementos desde "start" hasta el final del arreglo.
            // [, item1, item2,...]: Estos atributos opcionales son los elementos que se agregarán al arreglo despues de borrar los elementos desde start hasta deleteCount, si se omite, slice solo borrará elementos.
            fila.splice(numeroColumnas, Infinity);
          }
        });
        return tabla;
      });
      setCorrectAnswers(() => {
        let copia_listaElementosTabla = [...listaElementosTabla];
        let respuestasCorrectasTabla = copia_listaElementosTabla.flatMap((filaDeElementos) => {
          return filaDeElementos.filter((celda) => celda.completar == true);
        });
        return respuestasCorrectasTabla;
      });
      // console.log(`desde construirPregunta()\answers: ${JSON.stringify(answers)}`);
      // console.log(`desde construirPregunta()\correctAnswers: ${JSON.stringify(correctAnswers)}`);
    } else if (tipoPreguntaDict[tipoPregunta] === "Video interactivo con preguntas") {
      alert(
        "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Video interactivo con preguntas"
      );
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    } else if (tipoPreguntaDict[tipoPregunta] === "Secuencia de pasos") {
      alert(
        "Por definir el tipo de dato de 'answers' y 'correctAnswers' en pregunta del tipo: Secuencia de pasos"
      );
      setAnswers("");
      setCorrectAnswers(["Algo"]);
    }
    // setPregunta((prevPregunta) => {
    //   let updatedPregunta = {
    //     ...prevPregunta,
    //     typeOfQuestion: tipoPreguntaDict[tipoPregunta],
    //     position: 0, //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
    //     completed: false,
    //     idTask: actividadesSeleccionadas, // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
    //     idBody: idContenidoPrevio, // ID del contenido que tiene el desarrollo previo a la pregunta
    //     question: textoPregunta,
    //     totalScore: valorPuntosPregunta,
    //     answeredScore: 0, // Como aún no se contesta la pregunta, este valor es 0 por defecto
    //     answers: answers, // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
    //     // [{ String } respuesta: valor,
    //     // { String } respuesta: valor,
    //     // { String } respuesta: valor, ...] || { String } respuesta: valor
    //     correctAnswer: [], // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
    //     idFeedback: idContenidoPosterior, // ID del contenido que tiene el desarrollo previo a la pregunta
    //     // La forma en la que construimos el arreglo de "contents" cambiará según si la pregunta tiene o no preguntas anidadas
    //     contents:
    //       idContenidoPrevio != "" && idContenidoPosterior != ""
    //         ? [idContenidoPrevio, idContenidoPosterior]
    //         : idContenidoPrevio != ""
    //         ? [idContenidoPrevio]
    //         : idContenidoPosterior != ""
    //         ? [idContenidoPosterior]
    //         : [],
    //     questions: [],
    //   };
    //   // Según el tipo:
    //   // Pregunta con preguntas dentro:
    //   // Campos a guardar en una pregunta
    //   //   typeOfQuestion: {
    //   //   type: String,
    //   //   required: true,
    //   // },
    //   // position: {
    //   //   // Posición de la pregunta dentro de la actividad (número de pregunta para ordenarlas)
    //   //   type: Number,
    //   // },
    //   // completed: {
    //   //   type: Boolean,
    //   //   required: true,
    //   //   default: false,
    //   // },
    //   // idTask: [
    //   //   // Arreglo que guarda el id de la actividad a la que pertenece (FK que viene desde actividad)
    //   // ],
    //   // idBody: {
    //   //   // ID del contenido que tiene el desarrollo de la pregunta
    //   //   type: String,
    //   //   required: true,
    //   // },
    //   // question: {
    //   //   type: String,
    //   //   minLength: [2, "La pregunta debe de ser mínimo de 2 caracteres"],
    //   //   maxLength: [100, "La pregunta puede ser máximo de 100 caracteres"],
    //   // },
    //   // totalScore: {
    //   //   type: Number,
    //   //   required: [true, "Ingrese el valor en puntos de la pregunta"],
    //   //   // Valor total de la pregunta, este valor se mide en puntos y lo añade a la actividad que pertenece
    //   // },
    //   // answeredScore: {
    //   //   type: Number,
    //   //   // Puntos que obtuvo el usuario al responder la pregunta, según la cantidad de opciones correctas se obtiene un porcentaje de la puntuación de esta pregunta
    //   // },
    //   // answers: [
    //   //   // Arreglo de respuestas (String) que el usuario puede seleccionar para responder
    //   // ],
    //   // correctAnswer: [
    //   //   // Arreglo de respuestas correctas que el usuario tiene que seleccionar par marcar como completada (correcta) la pregunta
    //   // ],
    //   // idFeedback: {
    //   //   type: String,
    //   //   required: true,
    //   // },
    //   // contents: [
    //   //   // Arreglo de ID’s en orden del contenido que tiene la pregunta (primero los ID's del body de la pregunta y después los ID's del feedback de la pregunta)
    //   // ],
    //   // questions: [
    //   //   // Arreglo con preguntas (se usa para guardar preguntas dentro de esta pregunta según el tipo: Varias preguntas o interactiva secuencial)
    //   // ],

    //   // }
    //   return updatedPregunta;
    // });

    pregunta = {
      _id: "",
      typeOfQuestion: tipoPreguntaDict[tipoPregunta],
      position: actividadesSeleccionadas.flatMap((actividadSeleccionada) => {
        return {
          id_actividad: actividadSeleccionada._id,
          posicion_en_esta_actividad_padre: actividadSeleccionada.questions.length,
        };
      }), //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
      completed: false,
      idTask: actividadesSeleccionadas.flatMap((actividadSeleccionada) => {
        return actividadSeleccionada._id;
      }), // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
      idBody: idContenidoPrevio, // ID del contenido que tiene el desarrollo previo a la pregunta
      question: textoPregunta,
      totalScore: valorPuntosPregunta,
      answeredScore: 0, // Como aún no se contesta la pregunta, este valor es 0 por defecto
      answers: answers, // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
      // [{ String } respuesta: valor,
      // { String } respuesta: valor,
      // { String } respuesta: valor, ...] || { String } respuesta: valor
      correctAnswer: correctAnswers, // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
      idFeedback: idContenidoPosterior, // ID del contenido que tiene el desarrollo previo a la pregunta
      // La forma en la que construimos el arreglo de "contents" cambiará según si la pregunta tiene o no preguntas anidadas
      contents:
        idContenidoPrevio != "" && idContenidoPosterior != ""
          ? [idContenidoPrevio, idContenidoPosterior]
          : idContenidoPrevio != ""
          ? [idContenidoPrevio]
          : idContenidoPosterior != ""
          ? [idContenidoPosterior]
          : [],
      questions: [],
    };

    console.log(JSON.stringify(pregunta));
  };

  // useEffect(() => {
  //   construirPregunta();
  // }, [
  //   textoPregunta,
  //   answers,
  //   actividadesSeleccionadas,
  //   textoContenidoPrevio,
  //   textoContenidoPosterior,
  //   tipoPregunta,
  //   listaRespuestas,
  //   listaElementosTabla,
  //   valorPuntosPregunta,
  //   idContenidoPrevio,
  //   idContenidoPosterior,
  // ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Registrando pregunta...");

    construirPregunta();
    let respuestaRegistrarPregunta = "";
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/registrar-pregunta", {
        typeOfQuestion: pregunta.typeOfQuestion,
        position: pregunta.position,
        completed: pregunta.completed,
        idTask: pregunta.idTask,
        idBody: pregunta.idBody,
        question: pregunta.question,
        totalScore: pregunta.totalScore,
        answeredScore: pregunta.answeredScore,
        answers: pregunta.answers,
        correctAnswer: pregunta.correctAnswer,
        idFeedback: pregunta.idFeedback,
        contents: pregunta.contents,
        questions: pregunta.questions,
      })
      .then((response) => {
        if (response.data.Status === 605) {
          pregunta._id = response.data.content_id;
          // console.log(pregunta._id);
          // respuestaRegistrarPregunta = response.data.message;
          // Registrar pregunta en las actividades selecciondas si la asignamos a algunas actividades existentes mediante el InputBuscador de actividades
          pregunta.idTask.forEach((id_actividad) => {
            axios
              .post(
                "https://lms-facultad-de-quimica.onrender.com/api/aniadir-pregunta-a-actividad",
                {
                  id_actividad: id_actividad,
                  id_pregunta: pregunta._id,
                  pregunta_totalScore: pregunta.totalScore,
                }
              )
              .catch((error) => {
                console.error(`Error actualizando la actividad ${id_actividad}.\n${error}`);
              });
          });

          Swal.fire({
            title: response.data.message,
            confirmButtonText: "Continuar",
            showCancelButton: false,
            icon: "success",
          });

          // Reset del formulario
          resetForm();
        } else {
          Swal.fire({
            title: response.data.message,
            confirmButtonText: "Continuar",
            showCancelButton: false,
            icon: "warning",
          });
          console.error(response.data.message, response.data.error);
        }
      })
      .catch((error) => {
        console.error(`Error guardando la pregunta.\n${error}`);
      });

    // if (respuestaRegistrarPregunta != "") {
    //   // Se regirtró correctamente la pregunta

    // }
  };

  // Función para resetear el formulario
  const resetForm = () => {
    // setPregunta({
    //   typeOfQuestion: "Abierta",
    //   position: 0,
    //   completed: false,
    //   idTask: [],
    //   idBody: "",
    //   question: "",
    //   totalScore: 0,
    //   answeredScore: 0,
    //   answers: [],
    //   correctAnswer: [],
    //   idFeedback: "",
    //   contents: [],
    //   questions: [],
    // });

    pregunta = {
      typeOfQuestion: "Abierta",
      position: {
        id_actividad: "",
        posicion_en_esta_actividad_padre: 0,
      },
      completed: false,
      idTask: [],
      idBody: "",
      question: "",
      totalScore: 0,
      answeredScore: 0,
      answers: [],
      correctAnswer: [],
      idFeedback: "",
      contents: [],
      questions: [],
    };

    // Restablecer estados relacionados
    setAnswers("");
    setCorrectAnswers([]);
    setActividadesBuscadas("");
    setActividadesDisponibles([]);
    setActividadesSeleccionadas([]);
    setTextoContenidoPrevio("");
    setIdContenidoPrevio("");
    setTextoContenidoPosterior("");
    setIdContenidoPosterior("");
    setTipoPregunta("1");
    setListaRespuestas([]);
    setListaElementosTabla([]);
    setValorPuntosPregunta(0);
  };

  const handleBuscarActividades = (e) => {
    e.preventDefault();
    setActividadesBuscadas(e.target.value);
  };

  // useEffect(() => {
  //   // Buscamos las actividades que coincidan con actividadesBuscadas
  //   // axios.post("", {});
  //   // Colocamos esas actividades en actividadesDisponibles
  //   // Al hacerles click las colocamos en actividadesSeleccionadas
  // }, []);

  // Búsqueda de actividades en tiempo real por input del usuario
  useEffect(() => {
    // Buscar la actividad escrito en la DB
    axios
      .post("https://lms-facultad-de-quimica.onrender.com/api/buscar-actividades", {
        palabra_a_buscar: actividadesBuscadas,
      })
      .then((response) => {
        // Obetnemos un arreglo con las coincidencias
        const actividadesEncontradas = response.data.docs;
        if (actividadesEncontradas.length > 0) {
          // Se encontró al menos 1 actividad que coincide con el nombre escrito
          // Las actividades obtenidas serán guardadas en actividadesDisponibles
          actividadesEncontradas.forEach((actividadEncontrada) => {
            // Guardamos el objeto de actividad dentro de actividadesDisponibles evitando que se repita
            let actividadEstaDisponible = actividadesDisponibles.find((actividad) => {
              return actividad._id === actividadEncontrada._id;
            });
            if (!actividadEstaDisponible) {
              // setActividadesDisponibles([...actividadesDisponibles, actividadEncontrada]);
              setActividadesDisponibles([
                ...actividadesDisponibles,
                {
                  _id: actividadEncontrada._id,
                  nombre: `${actividadEncontrada.name}`,
                  questions: actividadEncontrada.questions,
                },
              ]);
            }
          });
        } else {
          // No se encontrarón actividades que coincidieran con el texto ingresado en "actividadesBuscados" dentro del InputBuscador
          setActividadesDisponibles([]);
        }
      })
      .catch((error) => {
        console.error(`Error buscando la actividad ${actividadesBuscadas}.\n${error}`);
      });
  }, [actividadesBuscadas]);

  // Colocar la misma actividad de la pregunta que continene el video en las preguntas que se hacen durante la repdocucción del video
  // useEffect(() => {
  //   setActividadesSeleccionadas([...actividadesSeleccionadas, ...actividades]);
  // }, [actividades]);

  // Contenido del formulario sin la etiqueta <form />
  const contenidoFormularioRespuesta = (
    <>
      <div className="mb-3">
        <InputBuscador
          name={"actividadesBuscadas"}
          id={"floatingInput-actividades"}
          placeholder={"Busque actividades por nombre"}
          label={"Actividades"}
          onChange={(e) => {
            handleBuscarActividades(e);
          }}
          value={actividadesBuscadas}
          elementosDisponibles={actividadesDisponibles}
          elementosSeleccionados={actividadesSeleccionadas}
          setElementosSeleccionados={setActividadesSeleccionadas}
          aQuienAsignamos={"pregunta"}
          queBuscamos={"actividad"}
        />
      </div>
      <div className="input-group mb-3">
        <label className="input-group-text" htmlFor="inputGroupSelect01-tipo-pregunta">
          Tipo de pregunta
        </label>
        <select
          className="form-select"
          id="inputGroupSelect01-tipo-pregunta"
          onChange={(e) => {
            // setTipoPregunta(tipoPreguntaDict[Number(e.target.value)]);
            setTipoPregunta(Number(e.target.value));
          }}>
          <option value={""} disabled selected>
            Eliga el tipo de pregunta que añadirá...
          </option>
          <option value="1">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Abierta</h5>
                <p className="card-text">
                  Se registra la respuesta del usuario para ser evaluada posteriormente.
                </p>
              </div>
            </div>
          </option>
          <option value="2">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Opción múltiple</h5>
                <p className="card-text">
                  Pregunta donde solo una de todas las opciones proporcionadas es la correcta.
                </p>
              </div>
            </div>
          </option>
          <option value="3">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Intervalo numérico</h5>
                <p className="card-text">
                  Pregunta donde se evalua que la respuesta esté dentro del intervalo especificado,
                  se toma como rango el límite inferior y superior, es decir,
                  'lím_inf&#60;=respuesta&#60;=lím_sup'.
                </p>
              </div>
            </div>
          </option>
          <option value="4">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Varias preguntas</h5>
                <p className="card-text">
                  Guarda las preguntas a responder, estas se pueden contestar en cualquier orden.
                </p>
              </div>
            </div>
          </option>
          <option value="5">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Interactiva secuencial</h5>
                <p className="card-text">
                  Guarda las preguntas a mostrar forzando al usuario a contestarlas de forma
                  secuencial y ordenada.
                </p>
                <p className="card-footer">
                  Juego de contestar bien o no se pasa a la siguiente pregunta.
                </p>
              </div>
            </div>
          </option>
          <option value="6">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Completar un texto</h5>
                <p className="card-text">
                  El alumno tiene que completar con las palabras o valores correctos un texto.
                </p>
              </div>
            </div>
          </option>
          <option value="7">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Llenar datos y graficar</h5>
                <p className="card-text">
                  El alumno llena datos en una tabla con los cuales se crea una curva de calibración
                  en tiempo real.
                </p>
              </div>
            </div>
          </option>
          <option value="8">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Completar número en tabla</h5>
                <p className="card-text">
                  Crea una tabla con información y campos a completar, los cuales pueden tener un
                  valor numérico exacto o dentro de un intervalo definido.
                </p>
                <p className="card-footer">Tabla por contestar.</p>
              </div>
            </div>
          </option>
          <option value="9">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Video interactivo con preguntas</h5>
                <p className="card-text">
                  Crea un video al cual se le pueden colocar preguntas en cualquier momento. Cada
                  pregunta puede evitar o no que se siga viendo el video.
                </p>
                <p className="card-footer">
                  Video con preguntas secuenciales a lo largo de su duración.
                </p>
              </div>
            </div>
          </option>
          <option value="10">
            <div className="card" style={{ width: "18rem" }}>
              <img src="..." className="card-img-top placeholder" alt="..." />
              <div className="card-body">
                <h5 className="card-title">Secuencia de pasos</h5>
                <p className="card-text">
                  Sección sin preguntas para llevar al alumno en un proceso práctico fuera del LMS.
                </p>
                <p className="card-footer">
                  Secuencia sin preguntas para llevar al alumno en un proceso práctico fuera del
                  LMS.
                </p>
              </div>
            </div>
          </option>
        </select>
      </div>
      {/* Previo a la pregunta */}
      <div className="mb-3">
        <h3>Contenido previo a la pregunta</h3>
        <RegistrarContenido
          data_contenido={textoContenidoPrevio}
          setData_contenido={setTextoContenidoPrevio}
          idContenido={idContenidoPrevio}
          setIdContenido={setIdContenidoPrevio}
          tipo="instrucciones"
        />
      </div>
      <div className="form-floating mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Coloca la pregunta aquí"
          id="floatingInput-pregunta"
          onChange={(e) => {
            // La pregunta (textual lo que se le pregguntará al usuario) que da pie a una respuesta de algún tipo
            setTextoPregunta(e.target.value);
          }}
        />
        <label htmlFor="floatingInput-pregunta">Pregunta</label>
      </div>
      <div className="form-floating mb-3">
        <input
          type="number"
          placeholder="Coloca el valor de la pregunta aquí"
          id="floatingInput-valor-pregunta"
          min={0}
          value={valorPuntosPregunta}
          onChange={(e) => {
            if (e.target.value < 0 || e.target.value === "") {
              setValorPuntosPregunta(0);
              Swal.fire({
                title: "Ingrese un valor válido para el valor en puntos de la pregunta",
                text: "El valor de los puntos para esta pregunta debe de ser igual o mayor a 0.",
                showCancelButton: false,
                confirmButtonText: "Continuar",
                icon: "warning",
              });
            } else {
              setValorPuntosPregunta(e.target.value);
            }
          }}
          className="form-control"
        />
        <label htmlFor="floatingInput-valor-pregunta">Valor de la pregunta (en puntos)</label>
      </div>
      <div className="mb-3">
        <WrapperRespuestas>
          {tipoPregunta === "" ? <h4>Seleccione el tipo de esta pregunta</h4> : <></>}
          {tipoPregunta === 1 ? (
            <RespuestaAbierta
              data_respuesta={answers}
              setData_respuesta={setAnswers}
              valorPuntosPregunta={valorPuntosPregunta}
            />
          ) : (
            <></>
          )}
          {tipoPregunta === 2 ? (
            <RespuestaOpcionMultiple
              listaRespuestas={listaRespuestas}
              setListaRespuestas={setListaRespuestas}
              valorPuntosPregunta={valorPuntosPregunta}
            />
          ) : (
            <></>
          )}
          {tipoPregunta === 3 ? (
            <RespuestaIntervaloNumerico
              listaRespuestas={listaRespuestas}
              setListaRespuestas={setListaRespuestas}
              valorPuntosPregunta={valorPuntosPregunta}
            />
          ) : (
            <></>
          )}
          {tipoPregunta === 4 ? (
            <>
              <p>Por completar</p>
            </>
          ) : (
            <></>
          )}
          {tipoPregunta === 5 ? (
            <>
              <p>Por completar</p>
            </>
          ) : (
            <></>
          )}
          {tipoPregunta === 6 ? (
            <RespuestaCompletarTexto
              data_respuesta={[]}
              valorPuntosPregunta={valorPuntosPregunta}
            />
          ) : (
            <></>
          )}
          {tipoPregunta === 7 ? (
            <>
              <p>Por completar</p>
            </>
          ) : (
            <></>
          )}
          {tipoPregunta === 8 ? (
            <RespuestaCompletarNumerosTabla
              listaElementosTabla={listaElementosTabla}
              setListaElementosTabla={setListaElementosTabla}
              numeroColumnas={numeroColumnas}
              setNumeroColumnas={setNumeroColumnas}
              numeroFilas={numeroFilas}
              setNumeroFilas={setNumeroFilas}
            />
          ) : (
            <></>
          )}
          {tipoPregunta === 9 ? (
            <RespuestaVideoInteractivo /> //actividades={actividadesSeleccionadas}
          ) : (
            <></>
          )}
          {tipoPregunta === 10 ? <RespuestaSeccionPasos /> : <></>}
        </WrapperRespuestas>
        {/* <Respuestas
            data_respuestas={[]}
            tipoPregunta={tipoPregunta}
            listaRespuestas={listaRespuestas}
            setListaRespuestas={setListaRespuestas}
          /> */}
      </div>
      <div className="mb-3">
        <h3>Contenido posterior a la pregunta</h3>
        <RegistrarContenido
          data_contenido={textoContenidoPosterior}
          setData_contenido={setTextoContenidoPosterior}
          idContenido={idContenidoPosterior}
          setIdContenido={setIdContenidoPosterior}
          tipo="retroalimentacion"
        />
      </div>
      {/* <div className="mb-3">
          <InputBuscador
            name="seccionesBuscadas"
            id="floatingInput-secciones"
            placeholder="Busque secciones por nombre"
            label="Secciones"
            onChange={(e) => {
              // console.log(e);
              handleBuscarSecciones(e);
            }}
            value={seccionesBuscadas}
            // searching={"actividades"}
            elementosDisponibles={seccionesDisponibles}|||
            elementosSeleccionados={seccionesSeleccionadas}
            setElementosSeleccionados={setSeccionesSeleccionadas}
            aQuienAsignamos="actividad"
            queBuscamos="seccion"
          />
        </div>
        <div className="mb-3">
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
          />
        </div> */}
      <button
        type={handleSubmitExterno ? "button" : "submit"}
        onClick={(e) => {
          if (handleSubmitExterno) {
            handleSubmitExterno(e);
          }
        }}
        className="btn btn-success my-3 w-100 btn-lg">
        Añadir pregunta
      </button>
    </>
  );

  return (
    <div className="container w-100 d-flex flex-column justify-content-center align-items-center mb-5">
      <div className="d-flex justify-content-center align-items-center">
        <h2 className="mb-3 me-3">Añadir pregunta</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          fill="currentColor"
          className="bi bi-arrow-90deg-right"
          viewBox="0 0 16 16"
          style={{ transform: "rotate(90deg)" }}>
          <path
            fillRule="evenodd"
            d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
      </div>
      {handleSubmitExterno ? (
        <>{contenidoFormularioRespuesta}</>
      ) : (
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}>
          {contenidoFormularioRespuesta}
        </form>
      )}
    </div>
  );
}
