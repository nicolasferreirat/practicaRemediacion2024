import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { FastifyInstance } from "fastify/types/instance.js";
import { Static, Type } from "@sinclair/typebox";
import bcrypt from "bcrypt";
import db from "../../services/db.js";

/////////////////////////////////////FUNCIONES PARA VALIDAR DATOS///////////////////////////////////////////////////
function validarPassword(password: string) {
  // Verificar si la password tiene más de 8 caracteres
  if (password.length < 8 || password.length > 12) {
    return false;
  }

  // Verificar si contiene al menos una letra mayúscula
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Verificar si contiene al menos una letra minúscula
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Verificar si contiene al menos un número
  if (!/[0-9]/.test(password)) {
    return false;
  }

  // Verificar si contiene caracteres especiales
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return false;
  }

  return true;
}

///////////////////////////////////////////USUARIOSCHEMA////////////////////////////////////////////////////////////

const UsuarioSchema = Type.Object(
  {
    nombre: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    apellido: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    nombre_usuario: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[^@]*$",
    }),
    mail: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8, maxLength: 12 }),
  },
  {
    additionalProperties: true,
    $id: "usuario",
  }
);

const UsuarioPutSchema = Type.Object(
  {
    nombre: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    apellido: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    nombre_usuario: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[^@]*$",
    }),
    mail: Type.String({ format: "email" }),
  },
  {
    additionalProperties: false,
    $id: "usuarioPut",
  }
);

type usuarioType = Static<typeof UsuarioSchema>;
///////////////////////////////////////////////RUTAS////////////////////////////////////////////////////////////////
const usuarioRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  //---------------------------------------------AGREGAR SCHEMAS----------------------------------------------------------------------

  fastify.addSchema(UsuarioSchema);
  fastify.addSchema(UsuarioPutSchema);

  //----------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------MANEJO DE ERRORES---------------------------------------------------------------------
  fastify.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      const validationError = error.validation[0];
      let errorMessage = "Bad Request";

      if (
        validationError.keyword === "minLength" &&
        validationError.instancePath === "/nombre"
      ) {
        errorMessage = "El nombre debe tener al menos 2 caracteres.";
      } else if (
        validationError.keyword === "maxLength" &&
        validationError.instancePath === "/nombre"
      ) {
        errorMessage = "El nombre no puede tener más de 30 caracteres.";
      } else if (
        validationError.keyword === "pattern" &&
        validationError.instancePath === "/nombre"
      ) {
        errorMessage = "El nombre solo debe contener letras.";
      }

      if (
        validationError.keyword === "minLength" &&
        validationError.instancePath === "/apellido"
      ) {
        errorMessage = "El apellido debe tener al menos 2 caracteres.";
      } else if (
        validationError.keyword === "maxLength" &&
        validationError.instancePath === "/apellido"
      ) {
        errorMessage = "El apellido no puede tener más de 30 caracteres.";
      } else if (
        validationError.keyword === "pattern" &&
        validationError.instancePath === "/apellido"
      ) {
        errorMessage = "El apellido solo debe contener letras.";
      }

      if (
        validationError.keyword === "format" &&
        validationError.instancePath === "/mail"
      ) {
        errorMessage = "El correo no tiene un formato válido.";
      }

      return reply.status(400).send({ error: errorMessage });
    }

    reply.status(error.statusCode || 500).send({ error: error.message });
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //-------------------------------------------GET ALL (ruta autenticada)-------------------------------------------------------
  fastify.get("/", {
    //onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              nombre: { type: "string" },
              apellido: { type: "string" },
              nombre_usuario: { type: "string" },
              mail: { type: "string" },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await db.query(
          "SELECT id, nombre, apellido, nombre_usuario, mail FROM usuarios"
        );
        const usuarios = result.rows;
        return usuarios;
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener usuarios" });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //------------------------------------------GET por id (ruta autenticada) ----------------------------------------------------
  fastify.get("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      response: {
        200: Type.Array(
          Type.Pick(UsuarioSchema, [
            "id",
            "nombre",
            "apellido",
            "nombre_usuario",
            "mail",
          ])
        ),
      },
    },

    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const resultado = await db.query(
          "SELECT id, nombre, apellido, nombre_usuario, mail FROM usuarios WHERE id = $1",
          [id]
        );
        const usuario = resultado.rows;
        console.log(usuario);
        if (usuario.length > 0) {
          return usuario;
        } else {
          reply.status(404).send({ error: "Usuario no encontrado" });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener usuario en get/id" });
      }
    },
  });

  //----------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------VALIDACION DE CORREO Y NOMBRE DE USUARIO---------------------------------------------

  // POST para validar correos electrónicos
  fastify.post("/validarCorreo", {
    schema: {
      tags: ["Usuarios"],
      body: {
        type: "object",
        required: ["mail"],
        properties: {
          mail: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            existe: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { mail } = request.body as { mail: string };
      let userId = null;

      // Verificar si el JWT está presente en el encabezado
      const authorizationHeader = request.headers["authorization"];
      if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
        const token = authorizationHeader.split(" ")[1]; // Obtener el token después de "Bearer"
        try {
          // Decodificar el token para obtener el `userId`
          const decoded: any = fastify.jwt.decode(token);
          userId = decoded.id;
        } catch (error) {
          console.log("Error al decodificar el token:", error);
        }
      }

      if (userId) {
        try {
          // Verificar si el correo electrónico ya existe en la base de datos, excluyendo al usuario actual
          const correo = await db.query(
            "SELECT mail FROM usuarios WHERE mail = $1 AND id != $2",
            [mail, userId]
          );

          if (correo.rows.length > 0) {
            // Si el correo ya existe
            return reply.send({ existe: true });
          }

          // Si el correo no existe, devolver false
          reply.send({ existe: false });
        } catch (error) {
          console.error("Error al validar correo electrónico:", error);
          reply
            .status(500)
            .send({ error: "Error al validar el correo electrónico." });
        }
      } else {
        try {
          // Verificar si el correo electrónico ya existe en la base de datos
          const correo = await db.query(
            "SELECT mail FROM usuarios WHERE mail = $1",
            [mail]
          );

          if (correo.rows.length > 0) {
            // Si el correo ya existe
            return reply.send({ existe: true });
          }

          // Si el correo no existe, devolver false
          reply.send({ existe: false });
        } catch (error) {
          console.error("Error al validar correo electrónico:", error);
          reply
            .status(500)
            .send({ error: "Error al validar el correo electrónico." });
        }
      }
    },
  });

  // POST para validar nombres de usuarios
  fastify.post("/validarNombreUsuario", {
    schema: {
      tags: ["Usuarios"],
      body: {
        type: "object",
        required: ["nombre_usuario"],
        properties: {
          nombre_usuario: { type: "string" },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            existe: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { nombre_usuario } = request.body as { nombre_usuario: string };
      let userId = null;

      // Verificar si el JWT está presente en el encabezado
      const authorizationHeader = request.headers["authorization"];
      if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
        const token = authorizationHeader.split(" ")[1]; // Obtener el token después de "Bearer"
        try {
          // Decodificar el token para obtener el `userId`
          const decoded: any = fastify.jwt.decode(token);
          userId = decoded.id;
        } catch (error) {
          console.log("Error al decodificar el token:", error);
        }
      }

      if (userId) {
        try {
          // Verificar si el nombre de usuario ya existe en la base de datos, excluyendo el usuario actual
          const user = await db.query(
            "SELECT nombre_usuario FROM usuarios WHERE nombre_usuario = $1 AND id != $2",
            [nombre_usuario, userId]
          );

          if (user.rows.length > 0) {
            // Si el nombre de usuario ya existe
            return reply.send({ existe: true });
          }

          // Si el nombre de usuario no existe, continuar con la lógica
          reply.send({ existe: false });
        } catch (error) {
          console.error("Error al validar nombre de usuario:", error);
          reply
            .status(500)
            .send({ error: "Error al validar el nombre de usuario." });
        }
      } else {
        try {
          // Verificar si el nombre de usuario ya existe en la base de datos
          const user = await db.query(
            "SELECT nombre_usuario FROM usuarios WHERE nombre_usuario = $1",
            [nombre_usuario]
          );

          if (user.rows.length > 0) {
            // Si el nombre de usuario ya existe
            return reply.send({ existe: true });
          }

          // Si el nombre de usuario no existe, continuar con la lógica
          reply.send({ existe: false });
        } catch (error) {
          console.error("Error al validar nombre de usuario:", error);
          reply
            .status(500)
            .send({ error: "Error al validar el nombre de usuario." });
        }
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------------POST USUARIO--------------------------------------------------------------
  fastify.post("/", {
    schema: {
      tags: ["Usuarios"],
      body: { $ref: "usuario#" },
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            id_usuario: { type: "number" },
          },
        },
      },
    },
    preHandler: async function (request, reply) {
      const { password } = request.body as usuarioType;
      if (!validarPassword(password)) {
        return reply.status(400).send({ error: "La contraseña no es válida." });
      }
    },

    handler: async function (request, reply) {
      const { nombre, apellido, nombre_usuario, mail, password } =
        request.body as usuarioType;
      try {
        const saltRounds = 10;
        const passwordEncriptada = await bcrypt.hash(password, saltRounds);

        const resultado = await db.query(
          "INSERT INTO USUARIOS (nombre, apellido, nombre_usuario, mail, password) VALUES ($1, $2, $3, $4, $5) RETURNING id",
          [nombre, apellido, nombre_usuario, mail, passwordEncriptada]
        );
        const id = resultado.rows[0].id;
        console.log(id);
        reply
          .status(201)
          .send({ mensaje: "Usuario ingresado correctamente", id_usuario: id });
        // fastify.mailer.sendMail({
        //   from: process.env.USER,
        //   to: mail,
        //   subject: "Te has registrado correctamente",
        //   html: `<b> Has completado el proceso de registro de usuario </b>`
        // })

      } catch (error: any) {
        if (error.code === "23505") {
          reply.status(400).send({
            error: "El nombre de usuario o correo ya están registrados.",
          });
        } else {
          console.error("Error al crear usuario:", error);
          reply.status(500).send({ error: "Error interno del servidor" });
        }
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------POST validarPassword (ruta autenticada)------------------------------------------------
  fastify.post("/validarPassword", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      body: {
        type: "object",
        required: ["password"],
        properties: {
          password: { type: "string" },
        },
      },

      response: {
        200: {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            valido: { type: "boolean" },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const { password } = request.body as { password: string };
      const userId = (request.user as any).id;

      try {
        // Buscar el usuario en la base de datos
        const { rows } = await db.query(
          "SELECT * FROM usuarios WHERE id = $1",
          [userId]
        );
        const usuario = rows[0];

        if (!usuario) {
          return reply.status(404).send({ error: "Usuario no encontrado." });
        }

        // Verificar la contraseña actual
        const isPasswordValid = await bcrypt.compare(
          password,
          usuario.password
        );
        if (!isPasswordValid) {
          return reply.status(400).send({
            error: "La contraseña actual es incorrecta.",
            valido: true,
          });
        }

        // Si la contraseña es válida, enviar respuesta de éxito
        reply.status(200).send({ mensaje: "Contraseña válida." });
      } catch (error) {
        console.error("Error al validar contraseña actual:", error);
        reply
          .status(500)
          .send({ error: "Error al validar la contraseña actual." });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //-------------------------------------------PUT Usuario (ruta autenticada)---------------------------------------------------
  fastify.put("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      body: { $ref: "usuarioPut#" },
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            token: { type: "string" },
          },
        },
      },
    },

    preHandler: async function (request, reply) {
      const { id } = request.params as { id: string };
      const userId = (request.user as any).id; // Obtener el ID del token JWT
      const { nombre_usuario, mail } = request.body as usuarioType;

      const idNumerico = Number(id);
      const userIdNumerico = Number(userId);

      if (idNumerico !== userIdNumerico) {
        return reply
          .status(403)
          .send({ error: "Solo puedes editar tu propio usuario" });
      }

      try {
        // Verificar si el email ya está registrado por otro usuario
        const mailCheck = await db.query(
          "SELECT * FROM USUARIOS WHERE mail = $1 AND id != $2",
          [mail, id]
        );
        if (mailCheck.rowCount != 0) {
          return reply
            .status(400)
            .send({ error: "El email ya está registrado por otro usuario." });
        }

        // Verificar si el nombre de usuario ya está registrado por otro usuario
        const usuarioCheck = await db.query(
          "SELECT * FROM USUARIOS WHERE nombre_usuario = $1 AND id != $2",
          [nombre_usuario, id]
        );
        if (usuarioCheck.rowCount != 0) {
          return reply.status(400).send({
            error: "El nombre de usuario ya está registrado por otro usuario.",
          });
        }
      } catch (error) {
        return reply
          .status(500)
          .send({ error: "Error en la validación de usuario." });
      }
    },

    handler: async function (request, reply) {
      const { id } = request.params as { id: string };
      const { nombre, apellido, nombre_usuario, mail } =
        request.body as usuarioType;

      try {
        // Actualizar el usuario en la base de datos
        const response = await db.query(
          "UPDATE usuarios SET nombre = $1, apellido = $2, nombre_usuario = $3, mail = $4 WHERE id = $5",
          [nombre, apellido, nombre_usuario, mail, id]
        );
        console.log(response);
        const token = fastify.jwt.sign({
          id: id,
          nombre_usuario: nombre_usuario,
        });
        reply.send({ mensaje: "Usuario actualizado correctamente", token });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar usuario" });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //----------------------------------------------PUT password (ruta autenticada)-----------------------------------------------
  fastify.put("/cambiarPassword", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      body: {
        type: "object",
        required: ["nuevaPassword"],
        properties: {
          actualPassword: { type: "string", minLength: 8, maxLength: 12 },
          nuevaPassword: { type: "string", minLength: 8, maxLength: 12 },
        },
      },
      response: {
        200: {
          type: "object",
          properties: {
            mensaje: { type: "string" },
          },
        },
      },
    },
    preHandler: async (request, reply) => {
      const { actualPassword } = request.body as { actualPassword: string };
      const { nuevaPassword } = request.body as { nuevaPassword: string };
      const userId = (request.user as any).id;
      console.log(userId);

      const user = await db.query("SELECT * FROM usuarios WHERE id = $1", [
        userId,
      ]);
      const usuario = user.rows[0];

      if (
        !usuario ||
        !(await bcrypt.compare(actualPassword, usuario.password))
      ) {
        return reply
          .status(400)
          .send({ error: "La contraseña actual es incorrecta." });
      }
      if (!validarPassword(nuevaPassword)) {
        return reply.status(400).send({ error: "La contraseña no es válida." });
      }
      if (actualPassword === nuevaPassword) {
        return reply.status(400).send({
          error: "La contraseña nueva es igual a la contraseña actual.",
        });
      }
    },
    handler: async (request, reply) => {
      const { nuevaPassword } = request.body as { nuevaPassword: string };
      const userId = (request.user as any).id;

      try {
        const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
        await db.query("UPDATE usuarios SET password = $1 WHERE id = $2", [
          hashedPassword,
          userId,
        ]);
        reply.send({ mensaje: "Contraseña actualizada correctamente." });
      } catch (error) {
        console.error("Error al actualizar contraseña:", error);
        reply.status(500).send({ error: "Error al actualizar contraseña." });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------

  //----------------------------------------------DELETE (ruta autenticada)-----------------------------------------------------
  fastify.delete("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Usuarios"],
      params: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
          },
        },
      },
    },

    handler: async function (request, reply) {
      const { id } = request.params as { id: number };
      const userId = (request.user as any).id; // Obtener el ID del token JWT

      const idNumerico = Number(id);
      const userIdNumerico = Number(userId);

      if (idNumerico !== userIdNumerico) {
        return reply
          .status(403)
          .send({ error: "Solo puedes eliminar tu propio usuario" });
      }
      console.log("delete recibido", request.params);
      try {
        const result = await db.query("DELETE FROM usuarios WHERE id = $1", [
          id,
        ]);
        console.log(result);
        reply.send({ mensaje: `Usuario con ID ${id} eliminada correctamente` });
      } catch (error) {
        reply.status(500).send({ error: "Error al eliminar usuario" });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------
};

export default usuarioRoute;
