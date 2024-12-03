import { FastifyPluginAsync } from "fastify";
import db from "../../../services/db.js";
import bcrypt from "bcrypt";
import { Type } from "@sinclair/typebox";

const LoginSchema = Type.Object(
  {
    mail: Type.Optional(Type.String({ format: "email" })), // Opcional para que pueda ingresar con cualquiera
    nombre_usuario: Type.Optional(Type.String()),
    password: Type.String(),
  },
  {
    additionalProperties: false,
    $id: "login",
  }
);

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addSchema(LoginSchema);
  //POST Login
  fastify.post("/", {
    schema: {
      tags: ["Usuarios"],
      body: { $ref: "login#" },
    },
    handler: async function (request, reply) {
      const { mail, nombre_usuario, password } = request.body as {
        mail?: string;
        nombre_usuario?: string;
        password: string;
      };

      try {
        // Búsqueda basada en mail o nombre_usuario
        const resultado = await db.query(
          "SELECT * FROM usuarios WHERE mail = $1 OR nombre_usuario = $2",
          [mail, nombre_usuario]
        );
        const usuario = resultado.rows[0];

        if (!usuario) {
          return reply.status(404).send({ error: "Usuario no encontrado" });
        }

        const passwordMatch = await bcrypt.compare(password, usuario.password);

        if (!passwordMatch) {
          return reply.status(401).send({ error: "Contraseña incorrecta" });
        }

        // Devuelve un token
        const token = fastify.jwt.sign({ id: usuario.id, nombre_usuario: usuario.nombre_usuario });
        reply.send({ token });
      } catch (error) {
        reply.status(500).send({ error: "Error al autenticar usuario" });
      }
    },
  });
};

export default auth;
