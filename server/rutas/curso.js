const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const UserModel = require("../models/User.js");
const CourseModel = require("../models/Course.js");
const QuestionModel = require("../models/Question.js");
const SectionModel = require("../models/Section.js");
const TaskModel = require("../models/Task.js");
const ContentModel = require("../models/Content.js");
const secretTokenKey = "jwt-secret-key";
// Para guardar el .csv en memoria y regresarlo como un archivo a descargar
const { stringify } = require("csv-stringify/sync"); // Usa destructuración para obtener el método,  // Para obtener el método síncrono

module.exports = router;

let created_by = "";
const addOwnerToCreateCourse = (request, response, next) => {
  const token = request.cookies.token;
  const { teachers } = request.body;

  if (!token) {
    return response.json({
      Status: 0,
      message: "Token is missing",
    });
  }
  jwt.verify(token, secretTokenKey, (error, decodedToken) => {
    if (error) {
      return response.json({
        Status: 1,
        message: `Invalid token\nError: ${error}`,
      });
    }
    console.log(`Rol de usuario que crea el curso: ${decodedToken.role}`);
    if (teachers.length <= 0) {
      return response.json({
        Status: 308,
        message: `Se necesita registrar al menos un maestro.`,
      });
    }
    if (decodedToken.role === "admin") {
      created_by = teachers.at(0);
      next();
    } else if (decodedToken.role === "maestro") {
      created_by = decodedToken.id;
      next();
    } else {
      // decodedToken.role === "otra cosa"
      return response.json({
        Status: 309,
        message: `No tiene permisos para registrar un curso.`,
      });
    }
  });
};

router.post("/crear-curso", addOwnerToCreateCourse, (request, response, next) => {
  const { nombre, temas, descripcion, enrolled_users, teachers } = request.body;

  CourseModel.create({
    created_by: created_by,
    nombre: nombre,
    temas: temas,
    descripcion: descripcion,
    enrolled_users: enrolled_users,
    teachers: teachers,
  })
    .then((curso) => {
      response.json({
        Status: 305,
        message: `Curso ${curso.nombre} registrado correctamente`,
        id: curso._id,
      });
    })
    .catch((error) => {
      response.json({
        Status: 205,
        message: `${error}`,
      });
    });
});

// Para buscar cursos en la NOSQLDB
router.post("/buscar-cursos", (request, response, next) => {
  let valor_filtro = null;
  let id_curso = "000000000000000000000000";
  let buscandoPorID = false;
  // Forma de buscar por ID=>Escribir lo siguiente: "#: ID"(IMPORTANTE EL ESPACIO DESPUÉS DE LOS :ESPACIO)
  if (
    request.body.palabra_a_buscar.startsWith("#: ") &&
    request.body.palabra_a_buscar.length == 24 + "#: ".length
  ) {
    id_curso = new mongoose.Types.ObjectId(request.body.palabra_a_buscar.replace("#: ", ""));
    buscandoPorID = true;
  }
  if (request.body.filtro === "todos") {
    // valor_filtro = "[a|m][l|a][u|e][m|s][n|t][o|r].*";
    valor_filtro = ".*";
  }

  if (buscandoPorID) {
    CourseModel.find({ _id: id_curso })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 301,
          message: `Cursos encontrados correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 303,
          message: `Cursos no encontrados correctamente`,
          error: error,
        });
      });
  } else {
    CourseModel.find({
      $and: [
        {
          temas: {
            $regex: valor_filtro,
          },
        },
        {
          nombre: {
            // Para buscar todos los cursos con nombre "palabra_a_buscar" en su nombre
            $regex: `${request.body.palabra_a_buscar}.*`,
            $options: "i",
          },
        },
      ],
    })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 301,
          message: `Cursos encontrados correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 303,
          message: `Cursos no encontrados correctamente`,
          error: error,
        });
      });
  }

  // else if (request.body.filtro === "maestros") {
  //   valor_filtro = "maestro";
  // } else {
  //   // filtro === "alumnos"
  //   valor_filtro = "alumno";
  // }
  // console.log(`Buscar a ${request.body.palabra_a_buscar} con el filtro de ${valor_filtro}`);
});

const verifyAuthToErraseCourse = (request, response, next) => {
  const token = request.cookies.token;
  if (!token) {
    return response.json({
      Status: 0,
      message: "Token is missing",
    });
  }
  jwt.verify(token, secretTokenKey, (error, decodedToken) => {
    if (error) {
      response.json({
        Status: 1,
        message: `Invalid token\nError: ${error}`,
      });
    }
    // console.log(`Rol de usuario que ejecuta la acción de borrar: ${decodedToken.role}`);
    if (decodedToken.role !== "admin") {
      response.json({
        Status: 210,
        message: `El curso no puede ser borrado porque no se tiene autorización`,
      });
    } else {
      next();
    }
  });
};

router.post("/borrar-curso", verifyAuthToErraseCourse, (request, response, next) => {
  const { id_curso } = request.body;
  CourseModel.findByIdAndDelete(id_curso)
    .then((querry) => {
      response.json({
        Status: 206,
        message: `Curso (id: ${id_curso}) borrado correctamente`,
      });
    })
    .catch((error) => {
      response.json({
        Status: 302,
        message: `El curso con id: ${id_curso} no se encontró en la base de datos`,
        error: error,
      });
    });
});

// router.post("/actualizar-curso", async (request, response, next) => {
//   // Deestructurar los datos del request
//   const { id_curso, nombre, temas, descripcion, id_alumnos, id_maestros } = request.body;

//   // console.log([...id_maestros]);
//   // Encontrar el curso al que pertenecen
//   await CourseModel.findByIdAndUpdate(
//     { _id: new mongoose.Types.ObjectId(id_curso) },
//     {
//       nombre: nombre,
//       temas: temas,
//       descripcion: descripcion,
//       // enrolled_users: id_alumnos,
//       // teachers: id_maestros,
//       $addToSet: {
//         enrolled_users: {
//           $each: id_alumnos,
//         },
//         // $addToSet es como un $push a un arreglo solo que verificando que el elemento que se vaya a insertar no exista, por lo que evita elementos duplicados en el arreglo
//         teachers: {
//           // Estamos haciendo un $addToSet al campo teachers con la variable id_maestros
//           // El $each es el equivalente a un id_maestros.forEach(), lo que hace que se inserte cada valor del arreglo maestros.
//           $each: id_maestros,
//         },
//       },
//       // id_alumnos: [...id_alumnos],
//       // maestros: [...maestros],
//     }
//   )
//     // .then((querry) => {

//     // })
//     .catch((error) => {
//       console.error(`Error encontrando el curso '${nombre}'.\n${error}`);
//     });
//   // Actualizar la lista de cursos_inscritos de cada alumno inscrito al curso
//   const curso_actualizado = await CourseModel.findById({
//     _id: new mongoose.Types.ObjectId(id_curso),
//   });
//   try {
//     console.log(`curso_actualizado.enrolled_users:`, curso_actualizado.enrolled_users);
//     for (let i = 0; i < curso_actualizado.enrolled_users.length; i++) {
//       const alumno_a_actualizar = await UserModel.findById({
//         _id: new mongoose.Types.ObjectId(curso_actualizado.enrolled_users[i]),
//       });
//       if (!alumno_a_actualizar.cursos_inscritos.includes(id_curso)) {
//         alumno_a_actualizar.cursos_inscritos.push(id_curso);
//       }
//       await alumno_a_actualizar.save();
//     }
//   } catch (error) {
//     console.error(
//       `Error actualizando los alumnos '${curso_actualizado.enrolled_users}'.\n${error}`
//     );
//   }

//   // Actualizar la lista de cursos_inscritos de cada maestro inscrito al curso
//   try {
//     for (let i = 0; i < curso_actualizado.teachers.length; i++) {
//       const maestro_a_actualizar = await UserModel.findById({
//         _id: new mongoose.Types.ObjectId(curso_actualizado.teachers[i]),
//       });
//       if (!maestro_a_actualizar.cursos_inscritos.includes(id_curso)) {
//         maestro_a_actualizar.cursos_inscritos.push(id_curso);
//       }
//       await maestro_a_actualizar.save();
//     }
//   } catch (error) {
//     console.error(`Error actualizando los maestros '${curso_actualizado.teachers}'.\n${error}`);
//   }
//   return response.json({
//     Status: 307,
//     message: `Se actualizó correctamente el curso.`,
//     text: `Alumnos y maestros actualizados correctamente.`,
//   });
// });

router.post("/actualizar-curso", async (request, response) => {
  const { id_curso, nombre, temas, descripcion, id_alumnos, id_maestros } = request.body;

  try {
    // Actualiza el curso con los nuevos datos y añade los alumnos y maestros
    await CourseModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id_curso) },
      {
        nombre: nombre,
        temas: temas,
        descripcion: descripcion,
        $addToSet: {
          enrolled_users: { $each: id_alumnos },
          teachers: { $each: id_maestros },
        },
      }
    );

    // Recupera el curso actualizado
    const curso_actualizado = await CourseModel.findById(id_curso);

    // Función para actualizar cursos_inscritos de un usuario
    const actualizarCursosInscritos = async (id_usuario) => {
      const usuario = await UserModel.findById(id_usuario);
      if (!usuario.cursos_inscritos.includes(id_curso)) {
        usuario.cursos_inscritos.push(id_curso);
        await usuario.save();
      }
    };

    // Actualizar los cursos_inscritos de los alumnos
    await Promise.all(curso_actualizado.enrolled_users.map(actualizarCursosInscritos));

    // Actualizar los cursos_inscritos de los maestros
    await Promise.all(curso_actualizado.teachers.map(actualizarCursosInscritos));

    return response.json({
      Status: 307,
      message: `Se actualizó correctamente el curso.`,
      text: `Alumnos y maestros actualizados correctamente.`,
    });
  } catch (error) {
    console.error(`Error actualizando el curso o usuarios: ${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Ocurrió un error durante la actualización del curso.`,
      error: error.message,
    });
  }
});

router.post("/registrar-contenido", (request, response, next) => {
  const { texto, tipo, imagenes } = request.body;
  ContentModel.create({
    contentType: tipo,
    text: texto,
    pictures: imagenes,
  })
    .then((content) => {
      response.json({
        Status: 705,
        message: `Contenido (${tipo}) creado correctamente`,
        content_id: content._id,
      });
    })
    .catch((error) => {
      console.error(`Error creando el contenido.\n${error}`);
    });
});

router.post("/editar-contenido", (request, response, next) => {
  const { texto, tipo, imagenes, id_contenido } = request.body;
  ContentModel.findByIdAndUpdate(id_contenido, {
    contentType: tipo,
    text: texto,
    pictures: imagenes,
  })
    .then((docs) => {
      response.json({
        Status: 707,
        message: `Contenido actualizado correctamente.`,
      });
    })
    .catch((error) => {
      console.error(`Error actualizando el contenido.\n${error}`);
    });
});

router.post("/borrar-contenido", (request, response, next) => {
  ContentModel.findByIdAndDelete({ _id: request.body.id_contenido })
    .then((docs) => {
      response.json({
        Status: 706,
        message: `Contenido borrado correctamente.`,
      });
    })
    .catch((error) => {
      console.error(`Error borrando el contenido.\n${error}`);
    });
});

router.post("/registrar-pregunta", (request, response, next) => {
  const {
    typeOfQuestion: typeOfQuestion,
    position: position, //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
    // Arreglo con la posición de la pregunta dentro de la actividad correspondiente (número de pregunta para ordenarlas)
    // Guardaremos objetos del siguiente tipo:
    // {
    //    id_actividad: id_actividad_padre1,
    //    posicion_en_esta_actividad_padre: posicion_en_esta_actividad_padre1,
    //  }
    completed: completed,
    idTask: idTask, // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
    idBody: idBody, // ID del contenido que tiene el desarrollo previo a la pregunta
    question: question,
    totalScore: totalScore,
    answeredScore: answeredScore, // Como aún no se contesta la pregunta, este valor es 0 por defecto
    answers: answers, // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
    // [{ String } respuesta: valor,
    // { String } respuesta: valor,
    // { String } respuesta: valor, ...] || { String } respuesta: valor
    correctAnswer: correctAnswer, // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
    idFeedback: idFeedback, // ID del contenido que tiene el desarrollo previo a la pregunta
    contents: contents,
    questions: questions,
  } = request.body;

  QuestionModel.create({
    typeOfQuestion: typeOfQuestion,
    position: position, //Buscar la cantidad de preguntas que tiene la actividad seleccionada a la que pertenece esta pregunta y asignar esta pregunta hasta el final del arreglo = tasks.questions.lenght-1 // position es 0 porque aún no pertenece a ninguna actividad
    completed: completed,
    idTask: idTask, // Buscar el ID de la actividad a la que pertenece la pregunta y guardarlo en este arreglo
    idBody: idBody, // ID del contenido que tiene el desarrollo previo a la pregunta
    question: question,
    totalScore: totalScore,
    answeredScore: answeredScore, // Como aún no se contesta la pregunta, este valor es 0 por defecto
    answers: answers, // Arreglo||String de respuestas (String) que el usuario puede seleccionar para responder:
    // [{ String } respuesta: valor,
    // { String } respuesta: valor,
    // { String } respuesta: valor, ...] || { String } respuesta: valor
    correctAnswer: correctAnswer, // Arreglo de respuestas correctas que el usuario tiene que seleccionar para marcar como completada (correcta) la pregunta
    idFeedback: idFeedback, // ID del contenido que tiene el desarrollo previo a la pregunta
    contents: contents,
    questions: questions,
  })
    .then((content) => {
      response.json({
        Status: 605,
        message: `Pregunta ${typeOfQuestion} registrada correctamente`,
        content_id: content._id,
      });
    })
    .catch((error) => {
      console.error(`Error registrando la pregunta.\n${error}`);
      response.json({
        Status: 603,
        message: `Error registrando la pregunta.\n${error}`,
        error: error,
      });
    });
});

router.post("/registrar-actividad", (request, response, next) => {
  const {
    idSection, // Arreglo que guarda la sección a la que pertenece esta actividad (FK que viene de la sección)
    name, // Cadena que guarda el nombre de la actividad
    position, // Posición de la actividad dentro de la secci[on correspondiente] (número de actividad para ordenarlas)
    questions, // Arreglo de ID’s en orden de las preguntas que tiene la actividad
    totalScore, // Suma del valor de todas las preguntas que contiene esta actividad
    answeredScore,
  } = request.body;

  TaskModel.create({
    idSection: idSection, // Arreglo que guarda la sección a la que pertenece esta actividad (FK que viene de la sección)
    name: name, // Cadena que guarda el nombre de la actividad
    position: position, // Posición de la actividad dentro de la secci[on correspondiente] (número de actividad para ordenarlas)
    questions: questions, // Arreglo de ID’s en orden de las preguntas que tiene la actividad
    totalScore: totalScore, // Suma del valor de todas las preguntas que contiene esta actividad
    answeredScore: answeredScore,
  })
    .then((content) => {
      response.json({
        Status: 505,
        message: `Actividad ${name} registrada correctamente`,
        content_id: content._id,
      });
    })
    .catch((error) => {
      console.error(`Error registrando la actividad.\n${error}`);
    });
});

router.post("/aniadir-pregunta-a-actividad", (request, response, next) => {
  const { id_actividad, id_pregunta, pregunta_totalScore } = request.body;
  TaskModel.findByIdAndUpdate(
    { _id: id_actividad },
    {
      $addToSet: {
        // $addToSet es como un $push a un arreglo solo que verificando que el elemento que se vaya a insertar no exista, por lo que evita elementos duplicados en el arreglo
        // Estamos haciendo un $addToSet al campo questions con la variable id_pregunta
        questions: id_pregunta,
      },
      // Incrementamos el valor del campo totalScore en pregunta_totalScore unidades
      $inc: {
        totalScore: pregunta_totalScore,
      },
    }
  )
    .then((docs) => {
      response.json({
        Status: 507,
        message: `Actividad actualizada correctamente.`,
      });
    })
    .catch((error) => {
      console.error(`Error actualizando la actividad.\n${error}`);
    });
});

// Para buscar secciones en la NOSQLDB
router.post("/buscar-secciones", (request, response, next) => {
  let id_seccion = "000000000000000000000000";
  let buscandoPorID = false;
  // Forma de buscar por ID=>Escribir lo siguiente: "#: ID"(IMPORTANTE EL ESPACIO DESPUÉS DE LOS :ESPACIO)
  if (
    request.body.palabra_a_buscar.startsWith("#: ") &&
    request.body.palabra_a_buscar.length == 24 + "#: ".length
  ) {
    id_seccion = new mongoose.Types.ObjectId(request.body.palabra_a_buscar.replace("#: ", ""));
    buscandoPorID = true;
  }
  if (buscandoPorID) {
    SectionModel.find({ _id: id_seccion })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 407,
          message: `Secciones encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 403,
          message: `Secciones no encontradas correctamente`,
          error: error,
        });
      });
  } else {
    SectionModel.find({
      name: {
        // Para buscar todas las secciones con nombre "palabra_a_buscar" en su nombre
        $regex: `${request.body.palabra_a_buscar}.*`,
        $options: "i",
      },
    })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 407,
          message: `Secciones encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 403,
          message: `Secciones no encontradas correctamente`,
          error: error,
        });
      });
  }
});

// Para buscar actividades en la NOSQLDB
router.post("/buscar-actividades", (request, response, next) => {
  let id_actividad = "000000000000000000000000";
  let buscandoPorID = false;
  // Forma de buscar por ID=>Escribir lo siguiente: "#: ID"(IMPORTANTE EL ESPACIO DESPUÉS DE LOS :ESPACIO)
  if (
    request.body.palabra_a_buscar.startsWith("#: ") &&
    request.body.palabra_a_buscar.length == 24 + "#: ".length
  ) {
    id_actividad = new mongoose.Types.ObjectId(request.body.palabra_a_buscar.replace("#: ", ""));
    buscandoPorID = true;
  }
  if (buscandoPorID) {
    TaskModel.find({ _id: id_actividad })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 507,
          message: `Actividades encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 503,
          message: `Actividades no encontradas correctamente`,
          error: error,
        });
      });
  } else {
    TaskModel.find({
      name: {
        // Para buscar todas las actividades con nombre "palabra_a_buscar" en su nombre
        $regex: `${request.body.palabra_a_buscar}.*`,
        $options: "i",
      },
    })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 507,
          message: `Actividades encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 503,
          message: `Actividades no encontradas correctamente`,
          error: error,
        });
      });
  }
});

// Para buscar preguntas en la NOSQLDB
router.post("/buscar-preguntas", (request, response, next) => {
  let id_pregunta = "000000000000000000000000";
  let buscandoPorID = false;
  // Forma de buscar por ID=>Escribir lo siguiente: "#: ID"(IMPORTANTE EL ESPACIO DESPUÉS DE LOS :ESPACIO)
  if (
    request.body.palabra_a_buscar.startsWith("#: ") &&
    request.body.palabra_a_buscar.length == 24 + "#: ".length
  ) {
    id_pregunta = new mongoose.Types.ObjectId(request.body.palabra_a_buscar.replace("#: ", ""));
    buscandoPorID = true;
  }
  if (buscandoPorID) {
    QuestionModel.find({ _id: id_pregunta })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 607,
          message: `Preguntas encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 603,
          message: `Preguntas no encontradas correctamente`,
          error: error,
        });
      });
  } else {
    QuestionModel.find({
      question: {
        // Para buscar todas las preguntas con la "palabra_a_buscar" en su pregunta
        $regex: `${request.body.palabra_a_buscar}.*`,
        $options: "i",
      },
    })
      .then((docs) => {
        // console.log(docs);
        // response.send(docs);
        response.json({
          Status: 607,
          message: `Preguntas encontradas correctamente`,
          docs: docs,
        });
      })
      .catch((error) => {
        // response.send(error);
        console.log(error);
        response.json({
          Status: 603,
          message: `Preguntas no encontradas correctamente`,
          error: error,
        });
      });
  }
});
// Para buscar contenido en la NOSQLDB
router.post("/buscar-contenido", async (request, response, next) => {
  const id_contenido = new mongoose.Types.ObjectId(request.body.palabra_a_buscar);

  try {
    await ContentModel.find({ _id: id_contenido }).then((docs) => {
      return response.json({
        Status: 707,
        message: `Contenido encontrado correctamente.`,
        docs: docs,
      });
    });
  } catch (error) {
    console.error(`Error buscando el contenido '${id_contenido}'.`, error);
    return response.json({
      Status: 703,
      message: `Contenido no encontrado correctamente.`,
      error: error,
    });
  }
});

router.post("/actualizar-idTask-pregunta", (request, response, next) => {
  const { id_pregunta, id_tasks_individuales } = request.body;
  // Construimos un arreglo de objetos para insertar en el campo "position"
  const posiciones_a_insertar = id_tasks_individuales.map((id_task) => ({
    id_actividad: id_task,
    posicion_en_esta_actividad_padre: 0, // Puedes modificar este valor si es necesario
  }));

  QuestionModel.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id_pregunta) },
    {
      $addToSet: {
        // Insertamos en el campo idTask, asegurándonos de no duplicar valores
        idTask: {
          $each: id_tasks_individuales, // Insertamos los IDs de las actividades sin duplicados
        },
        // Insertamos en el campo position los objetos ya formateados
        position: {
          $each: posiciones_a_insertar, // Insertamos cada objeto que incluye id_actividad y posicion_en_esta_actividad_padre
        },
      },
    }
  )
    .then((querry) => {
      response.json({
        Status: 607,
        message: `Se actualizó correctamente la pregunta.`,
      });
    })
    .catch((error) => {
      console.error(`Error encontrando la pregunta '${id_pregunta}'.\n${error}`);
    });
});

router.post("/registrar-seccion", (request, response, next) => {
  const {
    idCourse, // La FK que viene desde el curso
    name, // Nombre de la sección
    position, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    id_tasks, // Arreglo de los ID’s en orden de las actividades que tiene la sección
    totalScore, // Suma del valor de todas las actividades que contiene esta sección
    answeredScore, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
    sections_curso, // Areglo con los ID's de las secciones del curso al que se registra la sección
  } = request.body;

  SectionModel.create({
    idCourse: idCourse, // La FK que viene desde el curso
    name: name, // Nombre de la sección
    position: position, // Posición de la sección dentro del curso (número de sección para ordenarlas)
    id_tasks: id_tasks, // Arreglo de los ID’s en orden de las actividades que tiene la sección
    totalScore: totalScore, // Suma del valor de todas las actividades que contiene esta sección
    answeredScore: answeredScore, // Suma de todos los puntos obtenidos por el usuario al contestar todas las actividades de esta sección
  })
    .then((content) => {
      response.json({
        Status: 405,
        message: `Sección ${name} registrada correctamente`,
        content_id: content._id,
        id_tasks: content.id_tasks,
      });
    })
    .catch((error) => {
      console.error(`Error registrando la sección.\n${error}`);
    });
});

router.post("/actualizar-nombre-seccion", (request, response, next) => {
  const { id_seccion, nombre_seccion } = request.body;
  SectionModel.findByIdAndUpdate(
    { _id: id_seccion },
    {
      name: nombre_seccion,
    }
  )
    .then((querry) => {
      response.json({
        Status: 407,
        message: `Se actualizó correctamente la sección.`,
      });
    })
    .catch((error) => {
      console.error(`Error actualizando el nombre de la sección.\n${error}`);
    });
});

router.post("/actualizar-idSection-actividad", (request, response, next) => {
  const { id_actividad, id_sections_individuales, arregloPosicionesActividad } = request.body;

  // Buscamos la posición del id de esta actividad en el arreglo id_task de cada sección a insertar en la actividad

  // Construimos un arreglo de objetos para insertar en el campo "position"
  // const posiciones_a_insertar = id_sections_individuales.map((id_section) => ({
  //   id_seccion: id_section,
  //   posicion_en_esta_seccion_padre: id_tasks_length - 1,
  //   // Estamos agregando la sección al final del arreglo de idSection y position porque estamos usando $addToSet, lo que es un equivalente a un $push
  // }));

  TaskModel.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(id_actividad) },
    {
      $addToSet: {
        // $addToSet es como un $push a un arreglo solo que verificando que el elemento que se vaya a insertar no exista, por lo que evita elementos duplicados en el arreglo
        idSection: {
          // Estamos haciendo un $addToSet al campo id_tasks con la variable id_sections_individuales
          // El $each es el equivalente a un id_sections_individuales.forEach(), lo que hace que se inserte cada valor del arreglo id_sections_individuales.
          $each: id_sections_individuales,
        },
        position: {
          $each: arregloPosicionesActividad,
        },
      },
    }
  )
    .then((querry) => {
      response.json({
        Status: 607,
        message: `Se actualizó correctamente la actividad.`,
      });
    })
    .catch((error) => {
      console.error(`Error encontrando la actividad '${id_actividad}'.\n${error}`);
    });
});

// router.post("/actualizar-idSections-task", (request, response, next) => {
//   const { id_task, updated_id_sections } = request.body;
//   TaskModel.findByIdAndUpdate({ _id: id_task }, {

//   })
// });

router.post("/aniadir-idTask-seccion", async (request, response, next) => {
  const { id_seccion, updated_id_tasks } = request.body;
  try {
    await SectionModel.findByIdAndUpdate(
      { _id: id_seccion },
      {
        $addToSet: {
          id_tasks: {
            $each: updated_id_tasks,
          },
        },
      }
    )
      .then((querry) => {
        response.json({
          Status: 407,
          message: `Se actualizó correctamente la sección.`,
        });
      })
      .catch((error) => {
        console.error(`Error actualizando la sección '${id_seccion}'.\n${error}`);
      });
  } catch (error) {
    console.error(`Error actualizando la sección '${id_seccion}'.\n${error}`);
  }
});

// router.post("/actualizar-posicion-secciones-curso", async (request, response, next) => {
//   const { id_curso, id_seccion, posicion } = request.body;
//   let listaSeccionesCurso = [];
//   try {
//     // Buscar el curso por su ID
//     const curso = await CourseModel.findById({ _id: id_curso });

//     if (!curso) {
//       return response.status(302).json({
//         Status: 302,
//         message: `Curso no encontrado.`,
//       });
//     }

//     // Verificar si el id_seccion no está en el arreglo de secciones
//     if (!curso.sections.includes(id_seccion)) {
//       return response.status(403).json({
//         Status: 403,
//         message: `La sección no existe, no se puede modificar su posición.`,
//       });
//     }

//     // Insertar id_seccion en la posición específica
//     curso.sections.splice(posicion, 0, id_seccion);
//     listaSeccionesCurso = curso.sections;
//     // Guardar el curso actualizado
//     await curso.save();

//     // return response.json({
//     //   Status: 307,
//     //   message: `Se actualizó correctamente el curso.`,
//     // });
//   } catch (error) {
//     console.error(`Error actualizando el curso '${id_curso}'.\n${error}`);
//     return response.status(500).json({
//       Status: 500,
//       message: `Error actualizando el curso.`,
//     });
//   }

//   // Actualizamos la posición de cada sección individualmente
//   try {
//     // Con esta búsqueda sabemos desde que índice empezar a modificar la posición de las secciones, así evitaremos modificar todas las secciones anteriores a la posición nueva de la sección modificada
//     let cantidadSeccionesAntesDeModificar = listaSeccionesCurso.findIndex(
//       (id_de_seccion) => id_de_seccion === id_seccion
//     );

//     const promesasPosicionesSeccionesActualizadas = listaSeccionesCurso
//       .slice(cantidadSeccionesAntesDeModificar)
//       .map(async (id_seccion_a_modificar) => {
//         const promesaPosicionSeccionActualizada = SectionModel.findByIdAndUpdate(
//           { _id: id_seccion_a_modificar },
//           {
//             position:
//               listaSeccionesCurso.findIndex(
//                 (id_de_seccion) => id_de_seccion === id_seccion_a_modificar
//               ) + cantidadSeccionesAntesDeModificar,
//           }
//         );
//         return Promise.all([promesaPosicionSeccionActualizada]).then(() => id_seccion_a_modificar);
//       });
//     Promise.all(promesasPosicionesSeccionesActualizadas)
//       .then((updatedSections) => {
//         return response.status(407).json({
//           Status: 407,
//           message: `Curso y secciones actualizadas correctamente.`,
//         });
//       })
//       .catch((error) => {
//         console.error("Error while updating sections positions:", error);
//       });
//   } catch (error) {
//     console.error(`Error actualizando las secciones del curso '${id_curso}'.\n${error}`);
//     return response.status(400).json({
//       Status: 400,
//       message: `Error actualizando las secciones.`,
//     });
//   }
// });

router.post("/actualizar-posicion-secciones-curso", async (request, response, next) => {
  const { id_curso, id_seccion, posicion } = request.body;

  try {
    const curso = await CourseModel.findById({ _id: id_curso });

    if (!curso) {
      return response.status(302).json({
        Status: 302,
        message: `Curso no encontrado.`,
      });
    }

    const index = curso.sections.indexOf(id_seccion);
    if (index === -1) {
      return response.status(403).json({
        Status: 403,
        message: `La sección no existe, no se puede modificar su posición.`,
      });
    }

    // Remover la sección de su posición actual y agregarla en la nueva posición
    curso.sections.splice(index, 1);
    if (posicion == -1) {
      curso.sections.splice(curso.sections.length, 0, id_seccion);
    } else {
      curso.sections.splice(posicion, 0, id_seccion);
    }

    // Actualizar las posiciones en la base de datos
    // Con esta búsqueda sabemos desde que índice empezar a modificar la posición de las secciones, así evitaremos modificar todas las secciones anteriores a la posición nueva de la sección modificada
    // let cantidadSeccionesAntesDeModificar = curso.sections.findIndex(
    //   (id_de_seccion) => id_de_seccion === id_seccion
    // );
    // let i = cantidadSeccionesAntesDeModificar
    for (let i = 0; i < curso.sections.length; i++) {
      await SectionModel.findByIdAndUpdate({ _id: curso.sections[i] }, { position: i });
    }

    await curso.save();

    response.status(200).json({
      Status: 200,
      message: `Curso y secciones actualizadas correctamente.`,
    });
  } catch (error) {
    console.error(`Error actualizando el curso '${id_curso}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando el curso.`,
    });
  }
});

router.post("/actualizar-posicion-actividad-seccion-desde-actividad", async (request, response) => {
  const { id_actividad, posicion } = request.body;

  try {
    // 1. Buscar la actividad por su ID
    const actividad = await TaskModel.findById({ _id: id_actividad });

    // Verificar si la actividad existe
    if (!actividad) {
      return response.status(404).json({
        Status: 404,
        message: `Actividad no encontrada.`,
      });
    }

    // 2. Actualizar la posición de la actividad si es válida
    if (Array.isArray(posicion)) {
      actividad.position = posicion;
      await actividad.save();
    } else {
      return response.status(400).json({
        Status: 400,
        message: "La posición proporcionada no es válida.",
      });
    }

    // 3. Iterar sobre las posiciones para actualizar las secciones relacionadas
    for (let i = 0; i < posicion.length; i++) {
      const seccion_a_actualizar = await SectionModel.findById({
        _id: posicion[i].id_seccion,
      });

      // Verificar si la sección existe
      if (!seccion_a_actualizar) {
        return response.status(404).json({
          Status: 404,
          message: `Sección no encontrada para la actividad.`,
        });
      }

      // 4. Remover la actividad de la posición anterior si existe
      const indexActividadAnterior = seccion_a_actualizar.id_tasks.indexOf(id_actividad);
      if (indexActividadAnterior > -1) {
        seccion_a_actualizar.id_tasks.splice(indexActividadAnterior, 1);
      }

      // 5. Insertar la actividad en la nueva posición
      seccion_a_actualizar.id_tasks.splice(
        posicion[i].posicion_en_esta_seccion_padre,
        0,
        id_actividad
      );

      // 6. Guardar los cambios de la sección
      await seccion_a_actualizar.save();

      // 7. Actualizar las posiciones de TODAS las actividades dentro de la sección
      for (let j = 0; j < seccion_a_actualizar.id_tasks.length; j++) {
        const actividad_a_actualizar = await TaskModel.findById({
          _id: seccion_a_actualizar.id_tasks[j],
        });

        // Verificar si la actividad a actualizar existe y tiene la estructura correcta
        if (actividad_a_actualizar && Array.isArray(actividad_a_actualizar.position)) {
          // Encontrar el objeto de posición correspondiente a la sección actual
          let position_obj_a_actualizar = actividad_a_actualizar.position.find(
            (position_obj) => position_obj.id_seccion === seccion_a_actualizar._id.toString()
          );

          // 8. Actualizar la posición dentro del objeto de posición
          if (position_obj_a_actualizar) {
            position_obj_a_actualizar.posicion_en_esta_seccion_padre = j;
          } else {
            // Si no existe un objeto de posición, lo creamos
            actividad_a_actualizar.position.push({
              id_seccion: seccion_a_actualizar._id.toString(),
              posicion_en_esta_seccion_padre: j,
            });
          }

          // 9. Guardar la actividad con la nueva posición
          await actividad_a_actualizar.save();
        } else {
          console.warn(
            `Actividad ${seccion_a_actualizar.id_tasks[j]} no encontrada o sin posición válida.`
          );
        }
      }
    }

    // Respuesta exitosa si todo salió bien
    return response.status(200).json({
      Status: 200,
      message: `Actividades y secciones actualizadas correctamente.`,
    });
  } catch (error) {
    console.error(
      `Error actualizando las secciones desde la actividad '${id_actividad}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las secciones desde la actividad.`,
    });
  }
});

// router.post(
//   "/actualizar-posicion-actividad-seccion-desde-actividad",
//   async (request, response, next) => {
//     const { id_actividad, posicion } = request.body;

//     try {
//       const actividad = await TaskModel.findById({ _id: id_actividad });
//       actividad.position = posicion;
//       await actividad.save();

//       if (!actividad) {
//         return response.status(500).json({
//           Status: 502,
//           message: `Actividad no encontrada.`,
//         });
//       }

//       // Construir el arreglo de idSections usando el de positions de la actividad actualizada
//       for (let i = 0; i < posicion.length; i++) {
//         const seccion_a_actualizar = await SectionModel.findById({
//           _id: posicion[i].id_seccion,
//         });
//         seccion_a_actualizar.id_tasks.splice(
//           seccion_a_actualizar.id_tasks.indexOf(id_actividad),
//           1
//         );
//         seccion_a_actualizar.id_tasks.splice(
//           posicion.posicion_en_esta_seccion_padre,
//           0,
//           id_actividad
//         );
//         await seccion_a_actualizar.save();
//         for (let j = 0; j < seccion_a_actualizar.id_tasks.length; j++) {
//           const actividad_a_actualizar = await TaskModel.findById({
//             _id: seccion_a_actualizar.id_tasks[j],
//           });
//           let position_obj_a_actualizar = actividad_a_actualizar.position.find(
//             (position_obj) => position_obj === seccion_a_actualizar._id
//           );
//           position_obj_a_actualizar.posicion_en_esta_seccion_padre =
//             seccion_a_actualizar.id_tasks.indexOf(seccion_a_actualizar.id_tasks[j]);
//           actividad_a_actualizar.position.splice(
//             actividad_a_actualizar.position.findIndex(
//               (position_obj) => position_obj === seccion_a_actualizar._id
//             ),
//             1,
//             position_obj_a_actualizar
//           );
//         }
//       }

//       return response.status(200).json({
//         Status: 200,
//         message: `Actividades y secciones actualizadas correctamente.`,
//       });
//     } catch (error) {
//       console.error(
//         `Error actualizando las secciones desde la actividad '${id_actividad}'.\n${error}`
//       );
//       return response.status(500).json({
//         Status: 500,
//         message: `Error actualizando las secciones desde la actividad.`,
//       });
//     }
//   }
// );

router.post("/actualizar-posicion-actividades-curso", async (request, response, next) => {
  const { id_actividad, id_secciones, posicion } = request.body;

  try {
    // Actualizamos la posición de las actividades dentro de las secciones donde esta la actividad a modidificar su posición
    for (let i = 0; i < id_secciones.length; i++) {
      const seccion = await SectionModel.findById({ _id: id_secciones[i] });

      if (!seccion) {
        return response.status(500).json({
          Status: 402,
          message: `Sección no encontrada.`,
        });
      }

      const index = seccion.id_tasks.indexOf(id_actividad);
      if (index === -1) {
        return response.status(500).json({
          Status: 503,
          message: `La actividad no existe, no se puede modificar su posición.`,
        });
      }
      // Remover la actividad de su posición actual y agregarla en la nueva posición
      seccion.id_tasks.splice(index, 1);
      if (posicion == -1) {
        seccion.id_tasks.splice(seccion.id_tasks.length, 0, id_actividad);
      } else {
        seccion.id_tasks.splice(posicion, 0, id_actividad);
      }

      // Actualizar las posiciones en la base de datos
      // Con esta búsqueda sabemos desde que índice empezar a modificar la posición de las secciones, así evitaremos modificar todas las secciones anteriores a la posición nueva de la sección modificada
      // let cantidadSeccionesAntesDeModificar = curso.sections.findIndex(
      //   (id_de_seccion) => id_de_seccion === id_seccion
      // );
      // let i = cantidadSeccionesAntesDeModificar
      for (let j = 0; j < seccion.id_tasks.length; j++) {
        const actividad_con_posicion_diferente = await TaskModel.findById({
          _id: seccion.id_tasks[j],
        });
        const index_of_position_obj_to_change = actividad_con_posicion_diferente.position.findIndex(
          (obj) => obj.id_seccion == seccion._id
        );
        actividad_con_posicion_diferente.position[
          index_of_position_obj_to_change
        ].posicion_en_esta_seccion_padre = seccion.id_tasks.indexOf(seccion.id_tasks[j]);
        await actividad_con_posicion_diferente.save();
      }

      await seccion.save();
    }

    response.status(200).json({
      Status: 200,
      message: `Actividad y secciones actualizadas correctamente.`,
    });
  } catch (error) {
    console.error(`Error actualizando la posición de la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la posición de la actividad.`,
    });
  }
});

// ======================================================
// ======================================================
// ======================================================
// ======= ESTA FUNCIÓN NO CAMBIA LA POSICIÓN DE LA PREGUNTA CON id_pregunta Y TAMPOCO MODIFICA EL ARREGLO DE CADA PREGUNTA
// ESTA FUNCIÓN ES MUY LENTA =============
// ======================================================
// ======================================================
router.post("/actualizar-posicion-preguntas-curso", async (request, response, next) => {
  const { id_pregunta, idTask, posicion } = request.body;

  try {
    // Actualizamos la posición de las demás preguntas dentro de las actividades donde esta la pregunta a modidificar su posición
    for (let i = 0; i < idTask.length; i++) {
      const actividad = await TaskModel.findById({ _id: new mongoose.Types.ObjectId(idTask[i]) });

      if (!actividad) {
        return response.status(500).json({
          Status: 502,
          message: `Actividad no encontrada.`,
        });
      }

      const index = actividad.questions.indexOf(id_pregunta.toString());
      if (index === -1) {
        return response.status(500).json({
          Status: 603,
          message: `La pregunta no existe, no se puede modificar su posición.`,
        });
      }
      // Remover la pregunta de su posición actual y agregarla en la nueva posición
      actividad.questions.splice(index, 1);
      if (posicion == -1) {
        actividad.questions.splice(actividad.questions.length, 0, id_pregunta);
      } else {
        actividad.questions.splice(posicion, 0, id_pregunta);
      }

      // Actualizar las posiciones en la base de datos
      // Con esta búsqueda sabemos desde que índice empezar a modificar la posición de las actividades, así evitaremos modificar todas las actividades anteriores a la posición nueva de la sección modificada
      // let cantidadactividadesAntesDeModificar = curso.sections.findIndex(
      //   (id_de_actividad) => id_de_actividad === id_actividad
      // );
      // let i = cantidadactividadesAntesDeModificar
      for (let j = 0; j < actividad.questions.length; j++) {
        // Solo modificar las posiciones de las demás preguntas sin tocar la que ya modificamos
        if (actividad.questions[j].toString() != id_pregunta.toString()) {
          const pregunta_con_posicion_diferente = await QuestionModel.findById({
            _id: new mongoose.Types.ObjectId(actividad.questions[j]),
          });
          const index_of_position_obj_to_change =
            pregunta_con_posicion_diferente.position.findIndex(
              (obj) => obj.id_actividad.toString() == actividad._id.toString()
            );
          if (index_of_position_obj_to_change > -1) {
            pregunta_con_posicion_diferente.position[
              index_of_position_obj_to_change
            ].posicion_en_esta_actividad_padre = actividad.questions.indexOf(
              actividad.questions[j]
            );
            await pregunta_con_posicion_diferente.save();
          }
        }
      }

      await actividad.save();
    }

    response.status(200).json({
      Status: 200,
      message: `Pregunta y actividades actualizadas correctamente.`,
    });
  } catch (error) {
    console.error(`Error actualizando la posición de la pregunta '${id_pregunta}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la posición de la pregunta.`,
    });
  }
});

// Actualiza el arreglo idSection de la actividad proporcionada evitando id's de secciones duplicados
// Actualiza el arreglo de position de la actividad proporcionada según cada sección
// Actualiza el arreglo de actividades de cada sección proporcionada evitando duplicados
router.post("/aniadir-secciones-actividad", async (request, response, next) => {
  const { id_actividad, secciones_a_aniadir } = request.body;
  let actividad_idSection = [];
  try {
    await TaskModel.findByIdAndUpdate(
      { _id: id_actividad },
      {
        $addToSet: {
          idSection: {
            $each: secciones_a_aniadir,
          },
        },
      }
    );

    // Obtenemos idSection de la actividad a actualizar
    const actividad_actualizada = await TaskModel.findById({ _id: id_actividad });
    actividad_idSection = actividad_actualizada.idSection;
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  // Agregamos la actividad a las secciones nuevas
  try {
    for (let i = 0; i < secciones_a_aniadir.length; i++) {
      const sectionToUpdate = await SectionModel.findById({ _id: secciones_a_aniadir[i] });
      if (!sectionToUpdate.id_tasks.includes(id_actividad)) {
        sectionToUpdate.id_tasks.push(id_actividad);
      }
      // sectionToUpdate.position.push({
      //   id_actividad: id_actividad,
      //   posicion_en_esta_seccion_padre: section_id_tasks.indexOf(actividades_a_aniadir[i]),
      //   // Siempre será la última actividad de la sección porque estamos insertando con $addToSet que es el equivalente de un $push, y como para este punto el try-catch de agregar la actividad a la sección ya se terminó correctamente, sabemos que la sección se agregó en la última posición de la sección, por eso es section_id_tasks_length - 1 (porque usamos índices en 0)
      // });
      await sectionToUpdate.save();
    }
  } catch (error) {
    console.error(`Error actualizando las secciones '${secciones_a_aniadir}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las secciones.`,
    });
  }

  return response.json({
    Status: 507,
    message: `Actividad actualizada correctamente.`,
  });
});

// Actualiza el arreglo questions de la actividad proporcionada evitando id's de preguntas duplicados
// Actualiza el arreglo de position de la pregunta proporcionada según la actividad
// Actualiza el arreglo de actividades de cada pregunta proporcionada evitando duplicados
router.post("/aniadir-preguntas-actividad", async (request, response, next) => {
  const { id_actividad, preguntas_a_aniadir } = request.body;
  let pregunta_idTask = [];
  try {
    await TaskModel.findByIdAndUpdate(
      { _id: id_actividad },
      {
        $addToSet: {
          questions: {
            $each: preguntas_a_aniadir,
          },
        },
      }
    );

    // Obtenemos questions de la actividad a actualizar
    const actividad_actualizada = await TaskModel.findById({ _id: id_actividad });
    actividad_questions = actividad_actualizada.questions;
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  // Agregamos la actividad a las preguntas nuevas
  try {
    const actividad_actualizada = await TaskModel.findById({ _id: id_actividad });
    for (let i = 0; i < preguntas_a_aniadir.length; i++) {
      const questionToUpdate = await QuestionModel.findById({ _id: preguntas_a_aniadir[i] });
      if (!questionToUpdate.idTask.includes(id_actividad)) {
        questionToUpdate.idTask.push(id_actividad);
      }
      questionToUpdate.position.push({
        id_actividad: id_actividad,
        posicion_en_esta_actividad_padre: actividad_questions.indexOf(preguntas_a_aniadir[i]),
        // Siempre será la última actividad de la sección porque estamos insertando con $addToSet que es el equivalente de un $push, y como para este punto el try-catch de agregar la actividad a la sección ya se terminó correctamente, sabemos que la sección se agregó en la última posición de la sección, por eso es actividad_questions_length - 1 (porque usamos índices en 0)
      });
      actividad_actualizada.totalScore += questionToUpdate.totalScore;
      await questionToUpdate.save();
    }
    await actividad_actualizada.save();
  } catch (error) {
    console.error(`Error actualizando las preguntas '${preguntas_a_aniadir}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las preguntas.`,
    });
  }

  return response.json({
    Status: 507,
    message: `Actividad actualizada correctamente.`,
  });
});

router.post("/aniadir-actividades-seccion", async (request, response, next) => {
  const { id_seccion, actividades_a_aniadir } = request.body;
  let section_id_tasks = [];
  // Agregamos las actividades a la sección
  try {
    await SectionModel.findByIdAndUpdate(
      { _id: id_seccion },
      {
        $addToSet: {
          // $addToSet es como un $push a un arreglo solo que verificando que el elemento que se vaya a insertar no exista, por lo que evita elementos duplicados en el arreglo
          id_tasks: {
            // Estamos haciendo un $addToSet al campo id_tasks con la variable actividades_a_aniadir
            // El $each es el equivalente a un actividades_a_aniadir.forEach(), lo que hace que se inserte cada valor del arreglo actividades_a_aniadir dentro de id_tasks evitando duplicados.
            $each: actividades_a_aniadir,
          },
        },
      }
    );
    // Obtenemos section_id_tasks de la sección a actualizar
    const seccion_actualizada = await SectionModel.findById({ _id: id_seccion });
    section_id_tasks = seccion_actualizada.id_tasks;
  } catch (error) {
    console.error(`Error actualizando la sección '${id_seccion}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la sección.`,
    });
  }

  // Agregamos la sección a las actividades nuevas
  try {
    for (let i = 0; i < actividades_a_aniadir.length; i++) {
      // await TaskModel.findByIdAndUpdate(
      //   { _id: actividades_a_aniadir[i] },
      //   {
      //     $addToSet: {
      //       idSection: id_seccion,
      //     },
      //   }
      // );
      const taskToUpdate = await TaskModel.findById({ _id: actividades_a_aniadir[i] });
      if (!taskToUpdate.idSection.includes(id_seccion)) {
        taskToUpdate.idSection.push(id_seccion);
      }
      taskToUpdate.position.push({
        id_seccion: id_seccion,
        posicion_en_esta_seccion_padre: section_id_tasks.indexOf(actividades_a_aniadir[i]),
        // Siempre será la última actividad de la sección porque estamos insertando con $addToSet que es el equivalente de un $push, y como para este punto el try-catch de agregar la actividad a la sección ya se terminó correctamente, sabemos que la sección se agregó en la última posición de la sección, por eso es section_id_tasks_length - 1 (porque usamos índices en 0)
      });
      await taskToUpdate.save();
    }
  } catch (error) {
    console.error(`Error actualizando las actividades '${actividades_a_aniadir}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las actividades.`,
    });
  }

  return response.json({
    Status: 407,
    message: `Sección actualizada correctamente.`,
  });
});
router.post("/aniadir-actividades-pregunta", async (request, response, next) => {
  const { id_pregunta, actividades_a_aniadir } = request.body;
  let pregunta_idTasks = [];
  // Agregamos las actividades a la pregunta
  try {
    await QuestionModel.findByIdAndUpdate(
      { _id: id_pregunta },
      {
        $addToSet: {
          // $addToSet es como un $push a un arreglo solo que verificando que el elemento que se vaya a insertar no exista, por lo que evita elementos duplicados en el arreglo
          idTask: {
            // Estamos haciendo un $addToSet al campo id_tasks con la variable actividades_a_aniadir
            // El $each es el equivalente a un actividades_a_aniadir.forEach(), lo que hace que se inserte cada valor del arreglo actividades_a_aniadir dentro de id_tasks evitando duplicados.
            $each: actividades_a_aniadir,
          },
        },
      }
    );
    // Obtenemos idTask de la pregunta a actualizar
  } catch (error) {
    console.error(`Error actualizando la pregunta '${id_pregunta}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la pregunta.`,
    });
  }

  // Agregamos la pregunta a las actividades nuevas
  try {
    const pregunta_actualizada = await QuestionModel.findById({ _id: id_pregunta });
    pregunta_idTasks = pregunta_actualizada.id_tasks;
    for (let i = 0; i < actividades_a_aniadir.length; i++) {
      // await TaskModel.findByIdAndUpdate(
      //   { _id: actividades_a_aniadir[i] },
      //   {
      //     $addToSet: {
      //       idSection: id_pregunta,
      //     },
      //   }
      // );
      const taskToUpdate = await TaskModel.findById({ _id: actividades_a_aniadir[i] });
      if (!taskToUpdate.questions.includes(id_pregunta)) {
        taskToUpdate.questions.push(id_pregunta);
      }

      taskToUpdate.totalScore += pregunta_actualizada.totalScore;

      pregunta_actualizada.position.push({
        id_pregunta: id_pregunta,
        posicion_en_esta_actividad_padre: pregunta_actualizada.idTask.indexOf(
          actividades_a_aniadir[i]
        ),
        // Siempre será la última actividad de la sección porque estamos insertando con $addToSet que es el equivalente de un $push, y como para este punto el try-catch de agregar la actividad a la sección ya se terminó correctamente, sabemos que la sección se agregó en la última posición de la sección, por eso es pregunta_idTasks - 1 (porque usamos índices en 0)
      });

      await taskToUpdate.save();
    }
  } catch (error) {
    console.error(`Error actualizando las actividades '${actividades_a_aniadir}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las actividades.`,
    });
  }

  return response.json({
    Status: 607,
    message: `Pregunta actualizada correctamente.`,
  });
});

// router.post("/eliminar-usuario-de-curso", async (request, response, next) => {
//   const { id_curso, id_usuario_a_borrar } = request.body;

//   // Buscamos el curso y le quitamos el usuario
//   try {
//     const curso_a_modificar = await CourseModel.findById({
//       _id: new mongoose.Types.ObjectId(id_curso),
//     });
//     let index = curso_a_modificar.enrolled_users.indexOf(id_usuario_a_borrar);
//     // El curso no tiene la actividad
//     if (index == -1) {
//       console.error(`Error actualizando el curso '${id_curso}'.\n${error}`);
//       return response.status(500).json({
//         Status: 500,
//         message: `Error actualizando el curso '${id_curso}', no contiene al usuario '${id_usuario_a_borrar}'.`,
//       });
//     }

//     curso_a_modificar.enrolled_users.splice(index, 1);
//     await curso_a_modificar.save();
//   } catch (error) {
//     console.error(`Error actualizando los usuarios del curso '${id_curso}'.\n${error}`);
//     return response.status(500).json({
//       Status: 500,
//       message: `Error actualizando los usuarios del curso '${id_curso}'.`,
//     });
//   }

//   // Buscamos el usuario removido y le quitamos el curso
//   try {
//     const usuario_a_modificar = await UserModel.findById({
//       _id: new mongoose.Types.ObjectId(id_usuario_a_borrar),
//     });
//     let index = usuario_a_modificar.cursos_inscritos.indexOf(id_curso);
//     // El curso no tiene la actividad
//     if (index == -1) {
//       console.error(`Error actualizando el usuario '${id_usuario_a_borrar}'.`);
//       return response.status(500).json({
//         Status: 500,
//         message: `Error actualizando el usuario '${id_usuario_a_borrar}', no contiene el curso '${id_curso}'.`,
//       });
//     }

//     usuario_a_modificar.cursos_inscritos.splice(index, 1);
//     await usuario_a_modificar.save();
//   } catch (error) {
//     console.error(`Error actualizando el usuario '${id_usuario_a_borrar}'.\n${error}`);
//     return response.status(500).json({
//       Status: 500,
//       message: `Error actualizando los cursos del usuario '${id_usuario_a_borrar}'.`,
//     });
//   }
//   return response.json({
//     Status: 707,
//     message: `Usuario removido correctamente del curso.`,
//   });
// });

router.post("/eliminar-usuario-de-curso", async (request, response, next) => {
  const { id_curso, id_usuario_a_borrar, rol_usuario_to_erase } = request.body;

  try {
    // Elimina al usuario del curso
    const curso_a_modificar = await CourseModel.findById(new mongoose.Types.ObjectId(id_curso));
    if (!curso_a_modificar) {
      return response.status(400).json({
        Status: 400,
        message: `El curso con id '${id_curso}' no fue encontrado.`,
      });
    }
    let index = 0;
    if (rol_usuario_to_erase == "Alumno") {
      index = curso_a_modificar.enrolled_users.indexOf(id_usuario_a_borrar);
    } else if (rol_usuario_to_erase == "Maestro") {
      index = curso_a_modificar.teachers.indexOf(id_usuario_a_borrar);
    }

    if (index === -1) {
      console.log("Error?");

      return response.status(400).json({
        Status: 400,
        message: `El usuario '${id_usuario_a_borrar}' no está inscrito en el curso '${id_curso}'.`,
      });
    }

    if (rol_usuario_to_erase == "Alumno") {
      curso_a_modificar.enrolled_users.splice(index, 1);
    } else if (rol_usuario_to_erase == "Maestro") {
      curso_a_modificar.teachers.splice(index, 1);
    }
    await curso_a_modificar.save();

    // Elimina el curso del usuario
    const usuario_a_modificar = await UserModel.findById(
      new mongoose.Types.ObjectId(id_usuario_a_borrar)
    );
    if (!usuario_a_modificar) {
      return response.status(400).json({
        Status: 400,
        message: `El usuario con id '${id_usuario_a_borrar}' no fue encontrado.`,
      });
    }

    let indexCurso = usuario_a_modificar.cursos_inscritos.indexOf(id_curso);

    if (indexCurso === -1) {
      return response.status(400).json({
        Status: 400,
        message: `El curso '${id_curso}' no está registrado en el usuario '${id_usuario_a_borrar}'.`,
      });
    }
    usuario_a_modificar.cursos_inscritos.splice(indexCurso, 1);
    await usuario_a_modificar.save();

    // Respuesta exitosa
    return response.json({
      Status: 707,
      message: `Usuario '${id_usuario_a_borrar}' removido correctamente del curso '${id_curso}'.`,
    });
  } catch (error) {
    console.error(`Error actualizando el curso o usuario: ${error}`);
    return response.status(500).json({
      Status: 500,
      message: "Error interno del servidor.",
    });
  }
});

router.post("/eliminar-actividad-de-seccion", async (request, response, next) => {
  const { id_section, id_actividad } = request.body;

  let posicion_actividad_en_seccion = 0;

  // Buscamos la sección y le quitamos la actividad
  try {
    const seccion_a_actualizar = await SectionModel.findById({ _id: id_section });

    // Utilizamos findIndex para encontrar el índice correcto comparando las cadenas
    const index_actividad = seccion_a_actualizar.id_tasks.findIndex(
      (taskId) => taskId.toString() === id_actividad.toString()
    );

    if (index_actividad !== -1) {
      posicion_actividad_en_seccion = index_actividad;
      seccion_a_actualizar.id_tasks.splice(index_actividad, 1);
      await seccion_a_actualizar.save();
    } else {
      console.error(
        `Actividad con id '${id_actividad}' no encontrada en la sección '${id_section}'`
      );
      return response.status(404).json({
        Status: 404,
        message: `Actividad no encontrada en la sección.`,
      });
    }
  } catch (error) {
    console.error(`Error actualizando la sección '${id_section}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la sección.`,
    });
  }

  // Buscamos la actividad y le quitamos la sección
  try {
    const actividad_a_actualizar = await TaskModel.findById({ _id: id_actividad });

    const index_seccion = actividad_a_actualizar.idSection.findIndex(
      (sectionId) => sectionId.toString() === id_section.toString()
    );

    if (index_seccion !== -1) {
      actividad_a_actualizar.idSection.splice(index_seccion, 1);

      const index_position = actividad_a_actualizar.position.findIndex(
        (position_obj) =>
          position_obj.id_seccion.toString() === id_section.toString() &&
          position_obj.posicion_en_esta_seccion_padre === posicion_actividad_en_seccion
      );

      if (index_position !== -1) {
        actividad_a_actualizar.position.splice(index_position, 1); // Eliminar el objeto encontrado
      }

      await actividad_a_actualizar.save();
    } else {
      console.error(
        `Sección con id '${id_section}' no encontrada en la actividad '${id_actividad}'`
      );
      return response.status(404).json({
        Status: 404,
        message: `Sección no encontrada en la actividad.`,
      });
    }
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  return response.json({
    Status: 200,
    message: `Sección y actividad actualizadas correctamente.`,
  });
});

router.post("/eliminar-seccion-de-actividad", async (request, response, next) => {
  const { id_actividad, id_section } = request.body;

  let posicion_seccion_en_actividad = 0;

  // Buscamos la actividad y le quitamos la sección
  try {
    const actividad_a_actualizar = await TaskModel.findById({ _id: id_actividad });

    // Verificar si id_section está en el array de idSection
    const index_id_section = actividad_a_actualizar.idSection.indexOf(id_section);
    if (index_id_section !== -1) {
      actividad_a_actualizar.idSection.splice(index_id_section, 1);
    }

    // Buscar y eliminar el objeto de position cuyo id_seccion sea igual al id_section
    const index_position = actividad_a_actualizar.position.findIndex(
      (obj) => obj.id_seccion === id_section
    );
    if (index_position !== -1) {
      actividad_a_actualizar.position.splice(index_position, 1);
    }

    // Guardar los cambios
    await actividad_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  // Buscamos la sección y le quitamos la actividad
  try {
    const seccion_a_actualizar = await SectionModel.findById({ _id: id_section });
    const index_id_task = seccion_a_actualizar.id_tasks.indexOf(id_actividad);
    if (index_id_task !== -1) {
      seccion_a_actualizar.id_tasks.splice(index_id_task, 1);
    }
    await seccion_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la sección '${id_section}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la sección.`,
    });
  }

  return response.json({
    Status: 200,
    message: `Actividad actualizada correctamente.`,
  });
});

router.post("/eliminar-pregunta-de-actividad", async (request, response, next) => {
  const { id_actividad, id_pregunta } = request.body;

  let posicion_pregunta_en_actividad = 0;

  // Buscamos la actividad y le quitamos la pregunta
  try {
    const actividad_a_actualizar = await TaskModel.findById({ _id: id_actividad });

    // Verificar si id_pregunta está en el array de questions
    // Transformamos el id_pregunta a string porque como estoy pasando la pregunta tal vual como la encuentra de la base de datos, el _id es un objeto de tipo ObjectId aunque pareciera una cadena
    const index_id_pregunta = actividad_a_actualizar.questions.indexOf(id_pregunta.toString());
    if (index_id_pregunta > -1) {
      actividad_a_actualizar.questions.splice(index_id_pregunta, 1);
    }

    // Guardar los cambios
    await actividad_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  // Buscamos la pregunta y le quitamos la actividad
  try {
    const pregunta_a_actualizar = await QuestionModel.findById({ _id: id_pregunta });
    const index_id_task = pregunta_a_actualizar.idTask.indexOf(id_actividad);
    if (index_id_task !== -1) {
      pregunta_a_actualizar.idTask.splice(index_id_task, 1);
    }

    // // Buscar y eliminar el objeto de position cuyo idTask sea igual al id_actividad
    const index_position = pregunta_a_actualizar.position.findIndex(
      (obj) => obj.id_actividad === id_actividad
    );
    if (index_position !== -1) {
      pregunta_a_actualizar.position.splice(index_position, 1);
    }

    await pregunta_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la pregunta '${id_pregunta}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la pregunta.`,
    });
  }

  return response.json({
    Status: 200,
    message: `Actividad actualizada correctamente.`,
  });
});

router.post("/eliminar-actividad-de-pregunta", async (request, response, next) => {
  const { id_pregunta, id_actividad } = request.body;

  let posicion_actividad_en_pregunta = 0;

  // Buscamos la pregunta y le quitamos la actividad
  try {
    const pregunta_a_actualizar = await QuestionModel.findById({ _id: id_pregunta });

    // Verificar si id_actividad está en el array de questions
    // Transformamos el id_actividad a string porque como estoy pasando la pregunta tal vual como la encuentra de la base de datos, el _id es un objeto de tipo ObjectId aunque pareciera una cadena
    const index_id_actividad = pregunta_a_actualizar.idTask.indexOf(id_actividad.toString());
    if (index_id_actividad > -1) {
      pregunta_a_actualizar.idTask.splice(index_id_actividad, 1);
    }

    // Buscar y eliminar el objeto de position cuyo id_actividad sea igual al id_actividad
    const index_position = pregunta_a_actualizar.position.findIndex(
      (obj) => obj.id_actividad === id_actividad
    );
    if (index_position !== -1) {
      pregunta_a_actualizar.position.splice(index_position, 1);
    }

    // Guardar los cambios
    await pregunta_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la pregunta '${id_pregunta}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la pregunta.`,
    });
  }

  // Buscamos la actividad y le quitamos la pregunta
  try {
    const actividad_a_actualizar = await TaskModel.findById({ _id: id_actividad });
    const index_id_pregunta = actividad_a_actualizar.questions.indexOf(id_pregunta);
    if (index_id_pregunta !== -1) {
      actividad_a_actualizar.questions.splice(index_id_pregunta, 1);
    }

    await actividad_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando la actividad.`,
    });
  }

  return response.json({
    Status: 200,
    message: `Pregunta actualizada correctamente.`,
  });
});

router.post("/actualizar-secciones-curso", async (request, response, next) => {
  const { id_curso, id_seccion, position } = request.body;

  try {
    // Buscar el curso por su ID
    const curso = await CourseModel.findById({ _id: id_curso });

    if (!curso) {
      return response.status(302).json({
        Status: 302,
        message: `Curso no encontrado.`,
      });
    }

    // Verificar si el id_seccion ya está en el arreglo de secciones
    if (curso.sections.includes(id_seccion)) {
      return response.status(410).json({
        Status: 410,
        message: `La sección ya está presente en el curso.`,
      });
    }

    // Insertar id_seccion en la posición específica
    curso.sections.splice(position, 0, id_seccion);

    // Guardar el curso actualizado
    await curso.save();

    return response.json({
      Status: 307,
      message: `Se actualizó correctamente el curso.`,
    });
  } catch (error) {
    console.error(`Error actualizando el curso '${id_curso}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando el curso.`,
    });
  }
});

router.post("/borrar-seccion", async (request, response, next) => {
  const { id_section, id_curso, id_tasks } = request.body;
  let respuesta = {
    Status: 0,
    message: "",
  };

  // Buscar y borrar la sección
  try {
    SectionModel.findByIdAndDelete({ _id: id_section })
      .then((docs) => {
        respuesta.Status = 406;
        respuesta.message = `Sección borrada correctamente.`;
      })
      .catch((error) => {
        console.error(`Error borrando el contenido.\n${error}`);
      });
  } catch (error) {
    console.error(`Error borrando la sección '${id_section}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la sección.`,
    });
  }

  // Buscar y borrar la sección de todas las actividades que estava asociada
  try {
    for (let i = 0; i < id_tasks.length; i++) {
      const taskToUpdate = await TaskModel.findById({ _id: id_tasks[i] });
      taskToUpdate.idSection.splice(taskToUpdate.idSection.indexOf(id_section), 1);
      await taskToUpdate.save();
    }
  } catch (error) {
    console.error(
      `Error borrando la sección '${id_section}' de sus actividades asociadas '${JSON.stringify(
        id_tasks
      )}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la sección de sus actividades asociadas.`,
    });
  }

  // Buscar y borrar la sección de todos los cursos que estava asociada
  try {
    const courseToUpdate = await CourseModel.findById({ _id: id_curso });
    courseToUpdate.sections.splice(courseToUpdate.sections.indexOf(id_section), 1);
    await courseToUpdate.save();
  } catch (error) {
    console.error(
      `Error borrando la sección '${id_section}' del curso asociado '${id_curso}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la sección del curso asociado.`,
    });
  }

  return response.json({
    Status: respuesta.Status,
    message: respuesta.message,
  });
});

router.post("/borrar-actividad", async (request, response, next) => {
  const { id_actividad } = request.body;
  let respuesta = {
    Status: 0,
    message: "",
  };

  const actividad_a_borrar = await TaskModel.findById({ _id: id_actividad });
  const id_sections_actividad = actividad_a_borrar.idSection;
  const questions_actividad = actividad_a_borrar.questions;

  // Buscar y borrar la actividad de todas las secciones a las que estava asociada
  try {
    for (let i = 0; i < id_sections_actividad.length; i++) {
      const sectionToUpdate = await SectionModel.findById({ _id: id_sections_actividad[i] });
      sectionToUpdate.id_tasks.splice(sectionToUpdate.id_tasks.indexOf(id_actividad), 1);
      await sectionToUpdate.save();
    }
  } catch (error) {
    console.error(
      `Error borrando la actividad '${id_actividad}' de sus secciones asociadas '${JSON.stringify(
        id_sections_actividad
      )}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la actividad de sus secciones asociadas.`,
    });
  }

  // =============================================================================
  // =============================================================================
  // =============================================================================
  // =============================================================================
  // ============ PRUEBA EL CRUD DE SECCIONES, ACTIVIDADES Y PREGUNTAS Y CORRIGE LOS ERRORES QUE SE PRESENTEN, ACTUALMENTE HAS IDENTIFICADO ERRORES AL CONSRUIR LA SECCIÓN Y OBTENER EL PUNTAJE TOTAL, AL MODIFICAR EL PUNTAJE DE UNA PREGUNTA Y POR LO TANTO, MODIFICAR Y MOSTRAR EL PUNTAJE EN LAS ACTIVIDADES Y SECCIONES AFECTADAS.
  // DESPUÉS CONTINUA CON LA VISUALIZACIÓN DE LOS TIPOS DE PREGUNTAS URGENTES Y NO TE OLVIDES DE CREAR UN COMPONENTE QUE RENDERIZE UNA PREGUNTA CON LA FINALIDAD DE REUTILIZARLO AL VISUALIZAR EL CURSO. ====================
  // EL  BORRADO SE HACE BIEN!
  // =============================================================================
  // =============================================================================
  // =============================================================================
  // =============================================================================

  // Buscar y borrar la sección de todas las preguntas a las que estava asociada
  try {
    for (let i = 0; i < questions_actividad.length; i++) {
      const questionToUpdate = await QuestionModel.findById({ _id: questions_actividad[i] });

      // Quitamos la actividad a borrar del arreglo de idTask de la pregunta
      questionToUpdate.idTask.splice(questionToUpdate.idTask.indexOf(id_actividad), 1);

      // Quitamos la actividad a borrar del arreglo de position de la pregunta
      questionToUpdate.position.splice(
        questionToUpdate.position.findIndex((obj) => obj.id_actividad == id_actividad),
        1
      );
      await questionToUpdate.save();
    }
  } catch (error) {
    console.error(
      `Error borrando la actividad '${id_actividad}' de sus secciones asociadas '${JSON.stringify(
        questions_actividad
      )}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la actividad de sus secciones asociadas.`,
    });
  }

  // Buscar y borrar la actividad
  try {
    await TaskModel.findByIdAndDelete({ _id: id_actividad });
  } catch (error) {
    console.error(`Error borrando la actividad '${id_actividad}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la actividad.`,
    });
  }

  return response.json({
    Status: 506,
    message: `Actividad borrada correctamente.`,
  });
});

router.post("/borrar-pregunta", async (request, response, next) => {
  const { id_pregunta, idTask } = request.body;
  let respuesta = {
    Status: 0,
    message: "",
  };

  // Buscar y borrar la pregunta
  try {
    QuestionModel.findByIdAndDelete({ _id: id_pregunta })
      .then((docs) => {
        respuesta.Status = 606;
        respuesta.message = `Pregunta borrada correctamente.`;
      })
      .catch((error) => {
        console.error(`Error borrando el contenido.\n${error}`);
      });
  } catch (error) {
    console.error(`Error borrando la pregunta '${id_pregunta}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la pregunta.`,
    });
  }

  // Buscar y borrar la pregunta de todas las actividades que estava asociada
  try {
    for (let i = 0; i < idTask.length; i++) {
      const taskToUpdate = await TaskModel.findById({ _id: idTask[i] });
      taskToUpdate.questions.splice(taskToUpdate.questions.indexOf(id_pregunta), 1);
      await taskToUpdate.save();
    }
  } catch (error) {
    console.error(
      `Error borrando la pregunta '${id_pregunta}' de sus actividades asociadas '${JSON.stringify(
        idTask
      )}'.\n${error}`
    );
    return response.status(500).json({
      Status: 500,
      message: `Error borrando la pregunta de sus actividades asociadas.`,
    });
  }

  return response.json({
    Status: respuesta.Status,
    message: respuesta.message,
  });
});
router.post("/actualizar-puntuacion-seccion", async (request, response, next) => {
  const { id_seccion } = request.body;
  try {
    const seccion_a_actualizar = await SectionModel.findById({
      _id: new mongoose.Types.ObjectId(id_seccion.toString()),
    });
    for (let i = 0; i < seccion_a_actualizar.id_tasks.length; i++) {
      const actividad = await TaskModel.findById({
        _id: new mongoose.Types.ObjectId(seccion_a_actualizar.id_tasks[i]),
      });
      seccion_a_actualizar.totalScore += actividad.totalScore;
    }
    await seccion_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la puntuación de la sección '${id_seccion}'.`, error);
  }
});

router.post("/actualizar-puntuacion-pregunta", async (request, response, next) => {
  const { id_pregunta, puntuacion_total } = request.body;
  let puntuacion_anterior = 0;
  // Actualizamos la puntuación de la pregunta
  try {
    const pregunta_a_actualizar = await QuestionModel.findById({ _id: id_pregunta });
    puntuacion_anterior = pregunta_a_actualizar.totalScore;
    pregunta_a_actualizar.totalScore = puntuacion_total;
    await pregunta_a_actualizar.save();
  } catch (error) {
    console.error(`Error actualizando la puntuación de la pregunta '${id_pregunta}'.`, error);
  }
  // await QuestionModel.findByIdAndUpdate(
  //   { _id: id_pregunta },
  //   {
  //     totalScore: puntuacion_total,
  //   }
  // )
  //   .then((querry) => {
  //     response.json({
  //       Status: 607,
  //       message: `Se actualizó correctamente la pregunta.`,
  //     });
  //   })
  //   .catch((error) => {
  //     console.error(`Error actualizando la puntuación total de la pregunta.\n${error}`);
  //   });

  // Actualizamos la puntuación dentro de las actividades a las cuales pretenece esta pregunta
  try {
    const pregunta_actualizada = await QuestionModel.findById({ _id: id_pregunta });
    for (let i = 0; pregunta_actualizada.idTask.length; i++) {
      const actividad_a_actualizar = await TaskModel.findById({
        _id: new mongoose.Types.ObjectId(pregunta_actualizada.idTask[i]),
      });
      if (actividad_a_actualizar) {
        actividad_a_actualizar.totalScore -= puntuacion_anterior + puntuacion_total;
        await actividad_a_actualizar.save();
      }
    }
  } catch (error) {
    console.error(
      `Error actualizando la puntuación de la pregunta '${id_pregunta}' en sus actividades relacionadas.`,
      error
    );
  }
});

router.post("/actualizar-nombre-pregunta", (request, response, next) => {
  const { id_pregunta, nombre_pregunta } = request.body;
  QuestionModel.findByIdAndUpdate(
    { _id: id_pregunta },
    {
      question: nombre_pregunta,
    }
  )
    .then((querry) => {
      response.json({
        Status: 607,
        message: `Se actualizó correctamente la pregunta.`,
      });
    })
    .catch((error) => {
      console.error(`Error actualizando el nombre de la pregunta.\n${error}`);
    });
});

router.post("/actualizar-nombre-actividad", (request, response, next) => {
  const { id_actividad, nombre_actividad } = request.body;
  TaskModel.findByIdAndUpdate(
    { _id: id_actividad },
    {
      name: nombre_actividad,
    }
  )
    .then((querry) => {
      response.json({
        Status: 507,
        message: `Se actualizó correctamente la actividad.`,
      });
    })
    .catch((error) => {
      console.error(`Error actualizando el nombre de la actividad.\n${error}`);
    });
});

router.post("/guardar-respuestas-usuario-de-un-curso", async (request, response, next) => {
  const { id_usuario, obj_answers } = request.body;
  // Buscamos al usuario
  try {
    const usuario_a_modificar = await UserModel.findById({
      _id: new mongoose.Types.ObjectId(id_usuario),
    });
    usuario_a_modificar.answers.push(obj_answers);
    await usuario_a_modificar.save();

    return response.json({
      Status: 207,
      message: `Respuestas del usuario actualiadas correctamente.`,
    });
  } catch (error) {
    console.error(`Error actualizando las respuestas del usuario '${id_usuario}'.\n${error}`);
    return response.status(500).json({
      Status: 500,
      message: `Error actualizando las respuestas del usuario.`,
    });
  }
});

router.get("/exportar-respuestas", async (req, res) => {
  try {
    // Busca usuarios y asegura que estás poblado adecuadamente las relaciones
    const usuarios = await UserModel.find().populate({
      path: "answers",
      populate: {
        path: "sections",
        populate: {
          path: "tasks",
          populate: {
            path: "questions",
          },
        },
      },
    });

    // Definir los registros que se exportarán
    const records = [];

    // Usar bucle for...of para manejar las operaciones async
    for (const usuario of usuarios) {
      for (const answer of usuario.answers) {
        for (const section of answer.sections) {
          // Busca el nombre de la sección
          const seccionData = await SectionModel.findById(section.idSection).select("name");

          for (const task of section.tasks) {
            // Busca el nombre de la actividad (task)
            const taskData = await TaskModel.findById(task.idTask).select("name");

            for (const question of task.questions) {
              // Busca el nombre de la pregunta
              const questionData = await QuestionModel.findById(question.idQuestion).select(
                "question"
              );

              // Añadir el registro con los nombres de sección, actividad y pregunta
              records.push({
                usuarioId: usuario._id,
                nombre: usuario.nombre, // Nombre del usuario
                seccionId: section.idSection,
                nombreSeccion: seccionData?.name || "Sin nombre", // Nombre de la sección
                taskId: task.idTask,
                nombreTask: taskData?.name || "Sin nombre", // Nombre de la actividad
                questionId: question.idQuestion,
                nombreQuestion: questionData?.question || "Sin nombre", // Nombre de la pregunta
                userAnswer: question.userAnswer,
                correctAnswer: JSON.stringify(question.correctAnswer), // Convertir respuesta correcta a string si es necesario
                totalScore: question.totalScore,
                answeredScore: question.answeredScore,
              });
            }
          }
        }
      }
    }

    // Generar el CSV en memoria
    const csvData = stringify(records, {
      header: true, // Incluir el encabezado
      columns: [
        { key: "usuarioId", header: "Usuario ID" },
        { key: "nombre", header: "Nombre Usuario" },
        { key: "seccionId", header: "Sección ID" },
        { key: "nombreSeccion", header: "Nombre Sección" }, // Nueva columna de nombre de sección
        { key: "taskId", header: "Task ID" },
        { key: "nombreTask", header: "Nombre Actividad" }, // Nueva columna de nombre de actividad
        { key: "questionId", header: "Pregunta ID" },
        { key: "nombreQuestion", header: "Nombre Pregunta" }, // Nueva columna de nombre de pregunta
        { key: "userAnswer", header: "Respuesta del Usuario" },
        { key: "correctAnswer", header: "Respuesta Correcta" },
        { key: "totalScore", header: "Puntuación Total" },
        { key: "answeredScore", header: "Puntuación Respondida" },
      ],
    });

    // Agregar una cabecera para la codificación UTF-8
    const bom = "\uFEFF"; // Byte Order Mark para UTF-8
    const csvWithBom = bom + csvData;

    // Configurar la respuesta para descarga
    res.setHeader("Content-Disposition", "attachment; filename=respuestas_usuarios.csv");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.status(200).send(csvWithBom);
  } catch (error) {
    console.error("Error al exportar respuestas:", error);
    res.status(500).json({ message: "Error al exportar respuestas" });
  }
});
