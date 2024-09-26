const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema({
  created_by: {
    type: String,
    required: [true, "El ID del dueño del curso no se está registrando correctamente"],
  },
  nombre: {
    type: String,
    required: [true, "Ingresa el nombre del curso"],
  },
  temas: [
    // Arreglo de Strings donde cada una es una habilidad
  ],
  descripcion: {
    type: String,
    maxLength: [250, "La descripción puede ser de máximo 250 caracteres"],
  },
  enrolled_users: [
    // Arreglo que guarda el ID de los usuarios inscritos al curso
  ],
  teachers: [
    // Arreglo que guarda el ID de los maestros que dan el curso
  ],
  sections: [
    // Arreglo de ID’s en orden de las secciones que tiene el curso.
  ],
});

const CourseModel = mongoose.model("cursos", CourseSchema);
module.exports = CourseModel;
