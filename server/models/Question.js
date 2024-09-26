const mongoose = require("mongoose");

const QuestionSchema = mongoose.Schema({
  typeOfQuestion: {
    type: String,
    required: true,
  },
  position: [
    // Arreglo con la posición de la pregunta dentro de la actividad correspondiente (número de pregunta para ordenarlas)
    // Guardaremos objetos del siguiente tipo:
    // {
    //    id_actividad: id_actividad_padre1,
    //    posicion_en_esta_actividad_padre: posicion_en_esta_actividad_padre1,
    //  }
  ],
  completed: {
    type: Boolean,
    required: true,
    default: false,
    // Booleano que guarda que el usuario haya contestado algo en la pregunta sin importar si es correcto o no
  },
  completedCorrectly: {
    type: Boolean,
    required: true,
    default: false,
    // Booleano que guarda si la respuesta que dió el usuario es correcta
  },
  idTask: [
    // Arreglo que guarda el id de la actividad a la que pertenece (FK que viene desde actividad)
  ],
  idBody: {
    // ID del contenido que tiene el desarrollo de la pregunta
    type: String,
    default: "",
  },
  question: {
    type: String,
    minLength: [2, "La pregunta debe de ser mínimo de 2 caracteres"],
    maxLength: [400, "La pregunta puede ser máximo de 400 caracteres"],
  },
  totalScore: {
    type: Number,
    required: [true, "Ingrese el valor en puntos de la pregunta"],
    // Valor total de la pregunta, este valor se mide en puntos y lo añade a la actividad que pertenece
  },
  answeredScore: {
    type: Number,
    // Puntos que obtuvo el usuario al responder la pregunta, según la cantidad de opciones correctas se obtiene un porcentaje de la puntuación de esta pregunta
  },
  answers: [
    // Arreglo de respuestas (String) que el usuario puede seleccionar para responder
  ],
  correctAnswer: [
    // Arreglo de respuestas correctas que el usuario tiene que seleccionar par marcar como completada (correcta) la pregunta
  ],
  idFeedback: {
    type: String,
    default: "",
  },
  contents: [
    // Arreglo de ID’s en orden del contenido que tiene la pregunta (primero los ID's del body de la pregunta y después los ID's del feedback de la pregunta)
  ],
  questions: [
    // Arreglo con preguntas (se usa para guardar preguntas dentro de esta pregunta según el tipo: Varias preguntas o interactiva secuencial)
  ],
  numberOfAttempts: {
    type: Number,
    default: 0,
    // Cantidad de intentos que realizó el usuario para contestar correctamente la pregunta
  },
});

const QuestionModel = mongoose.model("preguntas", QuestionSchema);
module.exports = QuestionModel;
