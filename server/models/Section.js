const mongoose = require("mongoose");

const SectionSchema = mongoose.Schema({
  idCourse: {
    // La FK que viene desde el curso
    type: String,
  },
  name: {
    type: String,
    maxLength: [50, "El nombre puede contener hasta 50 caracteres"],
  },
  position: {
    // Posición de la sección dentro del curso (número de sección para ordenarlas)
    type: Number,
  },
  id_tasks: [
    // Arreglo de los ID’s en orden de las actividades que tiene la sección
  ],
  totalScore: {
    type: Number,
    // Suma del valor de todas las actividades que contiene esta sección
  },
  answeredScore: {
    type: Number,
    // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
  },
});

const SectionModel = mongoose.model("secciones", SectionSchema);
module.exports = SectionModel;
