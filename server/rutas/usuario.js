const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const UserModel = require("../models/User.js");
const secretTokenKey = "jwt-secret-key";

module.exports = router;

// URL handelers para procesar las peticiones del cliente a la NOSQLDB
// Registrar un usario con permiso de admin
router.post("/registrar-usuario-permiso-admin", (request, response, next) => {
  const { nombre, email, password, descripcion_personal, maestros_inscritos, cursos_inscritos } =
    request.body;
  console.log(`request maestros_inscritos: ${maestros_inscritos}`);
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({
        nombre: nombre,
        email: email,
        password: hash,
        descripcion_personal: descripcion_personal,
        // maestros_inscritos: maestros_inscritos,
        // cursos_inscritos: cursos_inscritos,
      })
        .then((user) => {
          maestros_inscritos.forEach((id_maestro) => {
            user.maestros_inscritos.push(id_maestro);
          });
          cursos_inscritos.forEach((id_curso) => {
            user.cursos_inscritos.push(id_curso);
          });
          user.save();
          response.json({
            status: 205,
            message: `Usuario ${user.nombre} registrado correctamente`,
          });
        })
        .catch((error) => {
          response.json({
            Status: 204,
            message: "Este correo ya tiene cuenta",
            error: error,
          });
        });
    })
    .catch((error) => {
      response.json({
        Status: 203,
        message: "Error hasheando la contraseña, vuelva a intentar",
        error: error,
      });
    });
});

// Registrar usuario
router.post("/registrar-usuario", (request, response, next) => {
  const { nombre, email, password } = request.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({
        nombre: nombre,
        email: email,
        password: hash,
      })
        .then((user) => {
          response.json({
            status: 205,
            message: `Usuario ${user.nombre} registrado correctamente`,
          });
        })
        .catch((error) => {
          response.json({
            Status: 204,
            message: "Este correo ya tiene cuenta",
            error: error,
          });
        });
    })
    .catch((error) => {
      response.json({
        Status: 203,
        message: "Error hasheando la contraseña, vuelva a intentar",
        error: error,
      });
    });
});

// Iniciar Sesión
router.post("/iniciar-sesion", (request, response, next) => {
  const { email, password } = request.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (!user) {
      return response.json({
        Status: 3,
        message: "No tiene cuenta",
      });
    }
    bcrypt.compare(password, user.password, (error, responseCompare) => {
      if (!responseCompare) {
        return response.json({
          Status: 2,
          message: "Contraseña incorrecta",
        });
      }
      const token = jwt.sign(
        {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          role: user.role,
        },
        secretTokenKey,
        { expiresIn: "1d" }
      );
      // Creamos una Cookie llamada token que tiene el token del usuario
      response.cookie("token", token);
      return response.json({
        Status: 200,
        message: "Login Successfully",
        role: user.role,
      });
    });
  });
});

const verifyUserAlumno = (request, response, next) => {
  const token = request.cookies.token;
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
    if (decodedToken.role === "alumno") {
      // Si somos maestro, vamos a lo siguiente en la petición HTTP GET de dashboard
      // Guardamos el valor del rol para ingresar al dashboard correspondiente y pasar el valor de rol al siguiente Middleware usando a response.locals.variable-a-pasar
      // Explicaicón en: https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
      // response.locals.rol = decodedToken.role
      next();
    } else {
      return response.json({
        Status: 4,
        message: `User with email ${token.email} is ${token.rol}, not alumno`,
      });
    }
  });
};

router.get("/home", verifyUserAlumno, (request, response, next) => {
  response.json({
    Status: 200,
    message: "Login successful",
  });
});

// Para verificar si el usuario tiene acceso al /dashboard revisando si tiene una cookie y su valor
const verifyUserMaestro = (request, response, next) => {
  const token = request.cookies.token;
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
    if (decodedToken.role === "maestro") {
      // Si somos maestro, vamos a lo siguiente en la petición HTTP GET de dashboard
      // Guardamos el valor del rol para ingresar al dashboard correspondiente y pasar el valor de rol al siguiente Middleware usando a response.locals.variable-a-pasar
      // Explicaicón en: https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
      // response.locals.rol = decodedToken.role
      next();
    } else {
      return response.json({
        Status: 4,
        message: `User with email ${token.email} is ${token.rol}, not maestro`,
      });
    }
  });
};

// Para validar la entrada directa sin pasar por login a la URL de /dashboard
router.get("/dashboard", verifyUserMaestro, (request, response, next) => {
  response.json({
    Status: 200,
    message: "Login successful",
  });
});

// Para verificar si el usuario tiene acceso al /admin-dashboard revisando si tiene una cookie y su valor
const verifyUserAdmin = (request, response, next) => {
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
    if (decodedToken.role === "admin") {
      // Si somos maestro, vamos a lo siguiente en la petición HTTP GET de admin-dashboard
      // Guardamos el valor del rol para ingresar al dashboard correspondiente y pasar el valor de rol al siguiente Middleware usando a response.locals.variable-a-pasar
      // Explicaicón en: https://stackoverflow.com/questions/18875292/passing-variables-to-the-next-middleware-using-next-in-express-js
      response.locals.rol = decodedToken.role;
      next();
    } else {
      return response.json({
        Status: 5,
        message: `User with email ${decodedToken.email} is ${decodedToken.role}, not admin`,
      });
    }
  });
};

// Para validar la entrada directa sin pasar por login a la URL de /dashboard
router.get("/admin-dashboard", verifyUserAdmin, (request, response, next) => {
  response.json({
    Status: 200,
    message: `Login successful with rol ${response.locals.rol}`,
  });
});

// Para buscar usuarios en la NOSQLDB
router.post("/admin/buscar-usuarios", (request, response, next) => {
  let valor_filtro = null;
  if (request.body.filtro === "todos") {
    // valor_filtro = "^(?!.*admin).*";
    valor_filtro = "[a|m][l|a][u|e][m|s][n|t][o|r].*";
    // valor_filtro = ".+";
    // valor_filtro = "^(([^a].{5}|.[^d].|.{5}[^m]|.{5}[^i].{5}[^n]).*|.{0,4})$";
  } else if (request.body.filtro === "maestros") {
    valor_filtro = "maestro";
  } else {
    // filtro === "alumnos"
    valor_filtro = "alumno";
  }
  // console.log(`Buscar a ${request.body.palabra_a_buscar} con el filtro de ${valor_filtro}`);
  UserModel.find({
    $and: [
      {
        role: {
          $regex: valor_filtro,
        },
      },
      {
        $or: [
          {
            nombre: {
              // Para buscar todos los usuarios con nombre "palabra_a_buscar" en su nombre
              $regex: `${request.body.palabra_a_buscar}.*`,
              $options: "i",
            },
          },
          {
            email: {
              $regex: `${request.body.palabra_a_buscar}`,
              $options: "i",
            },
          },
        ],
      },
    ],
  })
    .then((docs) => {
      console.log(docs);
      // response.send(docs);
      response.json({
        Status: 201,
        message: `Usuarios encontrados correctamente`,
        docs: docs,
      });
    })
    .catch((error) => {
      // response.send(error);
      response.json({
        Status: 3,
        message: `Usuarios no encontrados correctamente`,
        error: error,
      });
    });
});

router.post("/buscar-usuarios-por-id", async (request, response, next) => {
  const { id_de_usuario_a_buscar } = request.body;
  // Buscamos el usuario por su ID y lo regresamos
  try {
    const usuario_buscado = await UserModel.findById({
      _id: new mongoose.Types.ObjectId(id_de_usuario_a_buscar),
    });
    // Si no se encontró el usuario
    if (!usuario_buscado) {
      // response.send(docs);
      return response.json({
        Status: 203,
        message: `Usuarios no encontrado correctamente.`,
      });
    }

    return response.json({
      Status: 207,
      message: `Usuario encontrado correctamente.`,
      docs: usuario_buscado,
    });
  } catch (error) {
    console.error("Error buscando el usuario:", error);
    return response.status(500).json({ message: "Error buscando el usuario" });
  }
});

router.post("/admin/buscar-usuario-actual", (request, response, next) => {
  const token = request.cookies.token;
  // console.log(token);
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
    if (decodedToken.role === "admin") {
      UserModel.findOne({ email: decodedToken.email })
        .then((docs) => {
          // console.log(`User (email: ${decodedToken.email}) found`);
          response.json({
            Status: 201,
            message: `Usuario (email: ${decodedToken.email}) encontrado correctamente`,
            docs: docs,
          });
          // response.send(docs);
        })
        .catch((error) => {
          response.json({
            Status: 3,
            message: `Usuario (email: ${decodedToken.email}) no encontrado`,
            error: error,
          });
        });
    } else {
      return response.json({
        Status: 4,
        message: `User with email ${decodedToken.email} is ${decodedToken.rol}, not admin`,
      });
    }
  });
});

router.post("/buscar-usuario-actual", (request, response, next) => {
  const token = request.cookies.token;
  // console.log(token);
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
    if (decodedToken.role === "maestro" || decodedToken.role === "alumno") {
      UserModel.findOne({ email: decodedToken.email })
        .then((docs) => {
          // console.log(`User (email: ${decodedToken.email}) found`);
          return response.json({
            Status: 201,
            message: `Usuario (email: ${decodedToken.email}) encontrado correctamente`,
            docs: docs,
          });
          // response.send(docs);
        })
        .catch((error) => {
          return response.json({
            Status: 3,
            message: `Usuario (email: ${decodedToken.email}) no encontrado`,
            error: error,
          });
        });
    } else {
      return response.json({
        Status: 4,
        message: `User with email ${decodedToken.email} is ${decodedToken.rol}, not maestro o alumno`,
      });
    }
  });
});

async function getMaestrosInscritos(ids_maestros_inscritos) {
  // console.log(ids_maestros_inscritos.length);
  let maestros_inscritos = [];
  for (i = 0; i < ids_maestros_inscritos.length; i++) {
    const maestro = await UserModel.findById(ids_maestros_inscritos.at(i));
    console.log(maestro);
    maestros_inscritos.push(maestro.nombre);
  }
  console.log(maestros_inscritos);
  return maestros_inscritos;
}

// router.post("/buscar-nombres-con-ids", async (request, response, next) => {
//   const usersCollection = UserModel.collection;
//   console.log(`request.ids: ${request.ids}`);
//   const usersIDs = request.body.ids.split(",").map((id) => ObjectId(id));
//   const userNames = await usersCollection
//     .find({
//       _id: { $in: usersIDs },
//     })
//     .toArray();
//   response.json({
//     Status: 201,
//     message: "Usuarios encontrados correctamente",
//     docs: userNames,
//   });
// });

router.post("/buscar-nombres-con-ids", async (request, response, next) => {
  const usersCollection = UserModel.collection;
  const { ids } = request.body; // Extraer ids del cuerpo de la solicitud

  if (!ids) {
    return response.json({
      Status: 315,
      message: "No se proporcionarón ID's",
    });
  }

  try {
    const usersIDs = ids.split(",").map((id) => new mongoose.Types.ObjectId(id));
    const userNames = await usersCollection
      .find({ _id: { $in: usersIDs } }, { projection: { nombre: 1 } })
      .toArray();
    response.json({
      Status: 201,
      message: "Usuarios encontrados correctamente",
      docs: userNames,
    });
  } catch (error) {
    console.error("Error fetching user names:", error);
    response.status(500).json({ message: "Error fetching user names" });
  }
});

router.post("/buscar-nombres-profesores", (request, response, next) => {
  let ids_maestros_inscritos = request.body.ids_maestros_inscritos;
  getMaestrosInscritos(ids_maestros_inscritos)
    .then((docs) => {
      response.json({
        Status: 201,
        message: "Usuarios encontrados correctamente",
        docs: docs,
      });
    })
    .catch((error) => {
      response.json({
        Status: 202,
        message: `Los usuarios no se encontrarón en la base de datos`,
        error: error,
      });
    });
  console.log("Maestros obtenidos correctamente");
  // UserModel.find(
  //   {
  //     _id: {
  //       $in: ids_maestros_inscritos,
  //     },
  //   },
  //   function (err, docs) {
  //     console.log(docs);
  //   }
  // );
  // UserModel.find()
  //   .where("_id")
  //   .in(request.body.ids_maestros_inscritos)
  //   .then((docs) => {
  //     response.json({
  //       Status: 201,
  //       message: "Usuarios encontrados correctamente",
  //       docs: docs,
  //     });
  //   })
  //   .catch((error) => {
  //     response.json({
  //       Status: 202,
  //       message: `Los usuarios no se encontrarón en la base de datos`,
  //       error: error,
  //     });
  //   });
});

router.post("/buscar-nombre-profesor", (request, response, next) => {
  UserModel.findById(request.body.maestro_inscrito)
    .then((docs) => {
      // console.log(`docs: ${docs}`);
      response.json({
        Status: 201,
        message: "Usuario encontrado correctamente",
        docs: docs.nombre,
      });
    })
    .catch((error) => {
      response.json({
        Status: 202,
        message: `Los usuarios no se encontrarón en la base de datos`,
        error: error,
      });
    });
  // const { maestros_inscritos } = request.body;
  // let nombres_maestros = [],
  //   er = false;
  // // console.log(`maestros_inscritos: ${maestros_inscritos}`);
  // maestros_inscritos.forEach((id_maestro) => {
  //   // console.log(`Buscando el id: ${id_maestro}`);
  //   UserModel.findById(id_maestro)
  //     .then((docs) => {
  //       // console.log(`docs: ${docs.nombre}`);
  //       nombres_maestros.push(docs.nombre);
  //       console.log(`nombres_maestros0: ${nombres_maestros}`);
  //     })
  //     .catch((error) => {
  //       er = true;
  //     });
  // });
  // console.log(`nombres_maestros1: ${nombres_maestros}`);
  // if (er) {
  //   response.json({
  //     Status: 202,
  //     message: `El usuario con id: ${id_maestro} no se encontró en la base de datos`,
  //     error: error,
  //   });
  // } else {
  //   console.log(`nombres_maestros2: ${nombres_maestros}`);
  //   response.json({
  //     Status: 201,
  //     message: "Usuarios encontrados correctamente",
  //     nombres_maestros: nombres_maestros,
  //   });
  // }
});

router.post("/obtener-data-usuario", (request, response, next) => {
  UserModel.findById(request.body.id_usuario)
    .then((docs) => {
      response.json({
        Status: 201,
        message: "Usuarios encontrados correctamente",
        docs: docs,
      });
    })
    .catch((error) => {
      response.json({
        Status: 202,
        message: `El usuario con id: ${request.body.id_usuario} no se encontró en la base de datos`,
        error: error,
      });
    });
});

router.post("/actualizar-data-usuario", (request, response, next) => {
  UserModel.findByIdAndUpdate(
    { _id: request.body.id_usuario },
    {
      nombre: request.body.nombre,
      email: request.body.email,
      descripcion_personal: request.body.descripcion_personal,
    }
  )
    .then((docs) => {
      console.log(docs);
      response.json({
        Status: 207,
        message: `Usuario (id: ${request.body.id_usuario}) encontrado y modificado correctamente`,
        docs: docs,
      });
    })
    .catch((error) => {
      response.json({
        Status: 202,
        message: `El usuario con id: ${request.body.id_usuario} no se encontró en la base de datos`,
        error: error,
      });
    });
});

router.post("/puede-editar-descrip-personal", (request, response, next) => {
  const token = request.cookies.token;
  // console.log(token);
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
        message: `Invalid token`,
        error: error,
      });
    }
    UserModel.findOne({ email: decodedToken.email })
      .then((docs) => {
        console.log(docs);
        if (docs.email === request.body.email) {
          response.json({
            Status: 208,
            message: `El usuario (email: ${request.body.email}) tiene permisos para editar su descripción personal`,
            permiso: true,
          });
        } else {
          response.json({
            Status: 209,
            message: `El usuario (email: ${decodedToken.email}) no tiene permisos para editar la descripción personal del usuario (email: ${request.body.email}) en edición`,
            permiso: false,
          });
        }
      })
      .catch((error) => {
        response.json({
          Status: 202,
          message: `El usuario con email: ${decodedToken.email} no se encontró en la base de datos`,
          error: error,
        });
      });
  });
});

const verifyAuthToErraseUser = (request, response, next) => {
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
    console.log(
      `Rol de usuario a borrar: ${request.body.role}\nRol de usuario que ejecuta la acción de borrar: ${decodedToken.role}`
    );
    if (
      decodedToken.role === request.body.role ||
      (decodedToken.role === "maestro" && request.body.role === "admin") ||
      (decodedToken.role === "alumno" &&
        (request.body.role === "admin" || request.body.role === "maestro"))
    ) {
      response.json({
        Status: 210,
        message: `El usuario (id: ${request.body.id_usuario}) no puede ser borrado porque no se tiene autorización`,
      });
    } else {
      next();
    }
  });
};

router.post("/borrar-usuario", verifyAuthToErraseUser, (request, response, next) => {
  const { id_usuario } = request.body;
  UserModel.findByIdAndDelete(id_usuario).then((querry) => {
    response.json({
      Status: 206,
      message: `Usuario (id: ${id_usuario}) borrado correctamente`,
    });
  });
  // .catch((error) => {
  //   response.json({
  //     Status: 202,
  //     message: `El usuario con id: ${id_usuario} no se encontró en la base de datos`,
  //     error: error,
  //   });
  // });
});

router.post("/obtener-role-usuario", (request, response, next) => {
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
    // console.log(`Rol del usuario actual (email: ${decodedToken.email}): ${decodedToken.role}`);
    if (decodedToken.role === "admin") {
      response.json({
        Status: 220,
        message: `Se obtuvo el rol del usuario actual (email: ${decodedToken.email})`,
      });
    } else if (decodedToken.role === "maestro") {
      response.json({
        Status: 221,
        message: `Se obtuvo el rol del usuario actual (email: ${decodedToken.email})`,
      });
    } else {
      // decodedToken.role === "alumno"
      response.json({
        Status: 222,
        message: `Se obtuvo el rol del usuario actual (email: ${decodedToken.email})`,
      });
    }
  });
});

router.post("/obtener-id-usuario", (request, response, next) => {
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
    if (decodedToken.id) {
      return response.json({
        Status: 220,
        message: `Se obtuvo el id del usuario actual (email: ${decodedToken.email})`,
        id: decodedToken.id,
      });
    }
  });
});
