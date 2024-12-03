import { FastifyPluginAsync } from "fastify";

import db from "../../services/db.js";
import { ClubSchema, clubType } from "../../tipos/clubes.js";

const clubesRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.addSchema(ClubSchema);

  // Ruta GET para obtener un club por ID
  fastify.get("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Clubes"],
      params: {
        type: "object",
        properties: {
          id: { type: "number" },
        },
        required: ["id"],
      },
    },

    handler: async (request, reply) => {
      const { id } = request.params as { id: number };
      try {
        const resultado = await db.query(
          "SELECT id_club, nombre_club, direccion, cant_pistas FROM clubes WHERE id_club = $1",
          [id]
        );
        const club = resultado.rows;
        if (club.length > 0) {
          return club[0];
        } else {
          reply.status(404).send({ error: "Club no encontrado" });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener club" });
      }
    },
  });


  // Ruta GET para obtener todos los clubes
  fastify.get("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Clubes"],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id_club: { type: 'integer' },
              nombre_club: { type: 'string' },
              direccion: { type: 'string' },
              cant_pistas: { type: 'integer' },
              contacto: { type: 'string' },
            }
          }
        }
      }
    },
    

    handler: async (request, reply) => {
      try {
        const resultado = await db.query(
          "SELECT id_club, nombre_club, direccion, contacto, cant_pistas, logo, foto FROM clubes"
        );
        const clubes = resultado.rows.map(club => ({
          ...club,
          logo: club.logo ? club.logo.toString('base64') : null, 
          foto: club.foto ? club.foto.toString('base64') : null, 
        }));
        return clubes;
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener club" });
      }
    },
  });

  //------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------CREAR CLUB-----------------------------------------------------------------
  fastify.post("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Clubes"],
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
      const { nombre_club, direccion, cant_pistas } = request.body as clubType;
      try {
        const nombreCheck = await db.query(
          "SELECT * FROM clubes WHERE nombre_club = $1",
          [nombre_club]
        );
        const direccionCheck = await db.query(
          "SELECT * FROM clubes WHERE direccion = $1",
          [direccion]
        );

        if (nombreCheck.rowCount && direccionCheck.rowCount != 0) {
          return reply
            .status(400)
            .send({ error: "Este club ya está registrado" });
        }

        await db.query(
          "INSERT INTO clubes (nombre_club, direccion, cant_pistas) VALUES ($1, $2, $3)",
          [nombre_club, direccion, cant_pistas]
        );
        reply.status(201).send({ mensaje: "Club ingresado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al insertar club" });
      }
    },
  });
  //-----------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------EDITAR CLUB----------------------------------------------------------------
  fastify.put("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Clubes"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      body: {
        type: "object",
        required: ["nombre_club", "direccion", "cant_pistas"],
        properties: {
          nombre_club: { type: "string", minLength: 2, maxLength: 30 },
          direccion: { type: "string", minLength: 2, maxLength: 30 },
          contacto: { type: "string", minLength: 7, maxLength: 12 },
          cant_pistas: { type: "string", minLength: 1 },
        },
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
      const { id } = request.params as { id: string };
      const { nombre_club, direccion, cant_pistas } = request.body as clubType;

      try {
        const response = await db.query(
          "UPDATE clubes SET nombre_club = $1, direccion = $2, cant_pistas = $3 WHERE id_club = $4",
          [nombre_club, direccion, cant_pistas, id]
        );
        console.log(response);
        reply.send({ mensaje: "Club actualizado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar club" });
      }
    },
  });
  //------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------ELIMINAR CLUB---------------------------------------------------------------
  fastify.delete("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Clubes"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
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
      const { id } = request.params as { id: string };
      try {
        const result = await db.query("DELETE FROM clubes WHERE id_club = $1", [
          id,
        ]);
        console.log(result);
        reply.send({ mensaje: `Club con ID: ${id} eliminado correctamente` });
      } catch (error) {
        reply.status(500).send({ error: "Error al eliminar club" });
      }
    },
  });
  //-----------------------------------------------------------------------------------------------------------------------
};

export default clubesRoutes;
