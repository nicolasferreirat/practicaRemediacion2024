import { FastifyPluginAsync } from "fastify";

import db from "../../services/db.js";


const imagenRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  // Ruta GET para obtener la imagen de perfil de un usuario por su id
  fastify.get("/:id_usuario", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Imagenes"],
      params: {
        type: "object",
        properties: {
          id_usuario: { type: "number" },
        },
        required: ["id_usuario"],
      },
      response: {
        "2xx": {
          type: "object",
          properties: {
            imagen: { type: "string", contentEncoding: "base64", nullable: true },
          },
        },
      },
    },
  
    handler: async (request, reply) => {
      const { id_usuario } = request.params as { id_usuario: number };
  
      try {
        const resultado = await db.query(
          "SELECT imagen FROM usuarios WHERE id = $1",
          [id_usuario]
        );
  
        if (resultado.rows.length > 0 && resultado.rows[0].imagen) {
          // Convierte el buffer de la imagen a base64
          const imagenBase64 = resultado.rows[0].imagen.toString("base64");
          return { imagen: imagenBase64 };
        } else {
          // Devuelve null si no hay imagen
          return { imagen: null };
        }
      } catch (error) {
        console.error("Error al obtener la imagen:", error);
        reply.status(500).send({ error: "Error al obtener la imagen de perfil" });
      }
    },
  });
  //------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------SUBIR IMAGEN-----------------------------------------------------------------
  fastify.post("/:id_usuario", {
    schema: {
      tags: ["Imagenes"],
      params: {
        type: "object",
        properties: {
          id_usuario: { type: "number" },
        },
        required: ["id_usuario"],
      },
      body: {
        type: "object",
        properties: {
          imagen: { type: "string", contentEncoding: "base64" },
        },
        required: ["imagen"],
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
      const { id_usuario } = request.params as { id_usuario: number };
      const { imagen } = request.body as { imagen: string };
      
      try {
        // Convierte la imagen base64 en un buffer para almacenarla en BYTEA
        const imagenBuffer = Buffer.from(imagen, "base64");
  
        await db.query(
          "UPDATE usuarios SET imagen = $1 WHERE id = $2",
          [imagenBuffer, id_usuario]
        );
  
        reply.status(200).send({ mensaje: "Imagen de perfil actualizada correctamente" });
      } catch (error) {
        console.error("Error al actualizar la imagen:", error);
        reply.status(500).send({ error: "Error al actualizar la imagen de perfil" });
      }
    },
  });
  //-----------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------EDITAR IMAGEN----------------------------------------------------------------
  
  //------------------------------------------------------------------------------------------------------------------------
};

export default imagenRoutes;
