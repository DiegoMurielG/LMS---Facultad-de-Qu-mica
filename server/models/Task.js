const mongoose = require("mongoose");

const TaskSchema = mongoose.Schema({
  idSection: [
    // Arreglo que guarda la sección a la que pertenece esta actividad (FK que viene de la sección)
  ],
  name: {
    type: String,
    minLength: [2, "El nombre de la actividad debe de ser mínimo de 2 caracteres"],
    maxLength: [200, "El nombre de la actividad debe de ser máximo de 200 caracteres"],
  },
  position: [
    // Arreglo con la posición de la actividad dentro de la sección correspondiente (número de actividad para ordenarlas)
    // Guardaremos objetos del siguiente tipo:
    // {
    //    id_seccion: id_seccion_padre1,
    //    posicion_en_esta_seccion_padre: posicion_en_esta_seccion_padre1,
    //  }
  ],
  questions: [
    // Arreglo de ID’s en orden de las preguntas que tiene la actividad
  ],
  totalScore: {
    type: Number,
    // Suma del valor de todas las preguntas que contiene esta actividad
  },
  answeredScore: {
    type: Number,
    // Suma de todos los puntos obtenidos por el usuario al contestar todas las preguntas de esta actividad
  },
});

const TaskModel = mongoose.model("actividades", TaskSchema);
module.exports = TaskModel;
