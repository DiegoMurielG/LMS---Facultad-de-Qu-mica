const mongoose = require("mongoose");

const emailRegexPattern = /^[^\s@]+@[^\s@]+\.[^s@]+$/;

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, "Ingresa tu nombre"],
  },
  email: {
    type: String,
    required: [true, "Ingresa tu correo"],
    validate: {
      validator: function (emailValue) {
        return emailRegexPattern.test(emailValue);
      },
      message: "Ingresa un correo válido",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Ingresa tu contraseña"],
    minlenght: [6, "La contraseña debe de ser de mínimo 6 caracteres"],
  },
  role: {
    type: String,
    default: "alumno",
  },
  descripcion_personal: {
    type: String,
    default: "Vacío.",
    maxLenght: [250, "La descripción personal no puede contener más de 250 caracteres"],
  },
  maestros_inscritos: [
    // {
    //   id_maestro: {
    //     type: String,
    //     default: "",
    //   },
    // },
  ],
  cursos_inscritos: [
    // {
    //   id_curso: {
    //     type: String,
    //     default: "",
    //   },
    // },
  ],
  answers: [
    {
      idCourse: {
        type: String,
        required: [true, "Ingrese el ID del cruso que se respondió"],
      },
      sections: [
        {
          idSection: {
            type: String,
            required: [true, "Ingrese el ID de la sección que se respondió"],
          },
          completed: {
            type: Boolean,
            required: [true],
            default: false,
          },
          totalScore: {
            type: Number,
            // Suma del valor de todas las actividades que contiene esta sección
          },
          answeredScore: {
            type: Number,
            // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
          },
          tasks: [
            {
              idTask: {
                type: String,
                required: [true, "Ingrese el ID de la actividad que se respondió"],
              },
              completed: {
                type: Boolean,
                required: [true],
                default: false,
              },
              totalScore: {
                type: Number,
                // Suma del valor de todas las preguntas que contiene esta actividad
              },
              answeredScore: {
                type: Number,
                // Suma de todos los puntos obtenidos por el usuario al contestar todas las preguntas de esta actividad
              },
              questions: [
                {
                  idQuestion: {
                    type: String,
                    required: [true, "Ingrese el ID de la pregunta que se respondió"],
                  },
                  completed: {
                    type: Boolean,
                    required: [true],
                    default: false,
                  },
                  userAnswer: {
                    type: mongoose.Schema.Types.Mixed, // Cambia aquí a mongoose.Schema.Types.Mixed
                    // required: [true],
                    default: "",
                    // Respuesta ingresada por el usuario
                  },
                  correctAnswer: {
                    type: mongoose.Schema.Types.Mixed, // Cambia aquí a mongoose.Schema.Types.Mixed
                    required: [true],
                    default: "",
                    // Respuesta ingresada por el administrador del curso al crear la pregunta
                  },
                  totalScore: {
                    type: Number,
                    // Suma del valor de todas las preguntas que contiene esta actividad
                  },
                  answeredScore: {
                    type: Number,
                    // Suma de todos los puntos obtenidos por el usuario al contestar todas las preguntas de esta actividad
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

const UserModel = mongoose.model("usuarios", UserSchema);
module.exports = UserModel;
