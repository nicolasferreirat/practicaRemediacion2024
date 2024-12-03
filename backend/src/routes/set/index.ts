import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import db from "../../services/db.js";
import { SetType } from "../../tipos/set.js";

const setsRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  //////////////////////////////////////////////// OBTENER SET POR ID de MARCADOR ///////////////////////////////////////////////////
  fastify.get("/:id_marcador", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Set"],
      params: {
        type: "object",
        properties: {
          id_marcador: { type: "number" },
        },
        required: ["id_marcador"],
      },
    },

    handler: async (request, reply) => {
      const { id_marcador } = request.params as { id_marcador: number };
      try {
        const resultado = await db.query(
          "SELECT id_set, nombre_set, games_parejaA, games_parejaB FROM sets WHERE id_marcador = $1",
          [id_marcador]
        );
        const sets = resultado.rows;
        if (sets.length > 0) {
          return sets;
        } else {
          reply.status(404).send({ error: "Marcador set no encontrado" });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener Marcador set" });
      }
    },
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////// CREAR MARCADOR SET ///////////////////////////////////////////////////////////////////////
  fastify.post("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Set"],
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            id_set: { type: "integer" }
          },
        },
      },
    },

    handler: async function (request, reply) {
      const {
        nombre_set,
        games_parejaA,
        games_parejaB,
        id_marcador,
      } = request.body as SetType;
      try {
        await db.query(
          "INSERT INTO sets (nombre_set, games_parejaA, games_parejaB, id_marcador) VALUES ($1, $2, $3, $4)",
          [
            nombre_set,
            games_parejaA,
            games_parejaB,
            id_marcador,
          ]
        );
        reply
          .status(201)
          .send({ mensaje: "marcadorSET ingresado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al insertar marcadorSET" });
      }
    },
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////// MODIFICAR marcadorSET ////////////////////////////////////////////////
  fastify.put("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Set"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
      body: {
        type: "object",
        required: [
          "nombre_set",
          "games_parejaA",
          "games_parejaB",
          "ventaja",
          "es_supertiebreak",
          "id_marcador",
        ],
        properties: {
          nombre_set: { type: "string", maxLength: 100 },
          games_parejaA: { type: "integer" },
          games_parejaB: { type: "integer" },
          ventaja: { type: "boolean" },
          es_supertiebreak: { type: "boolean" },
          id_marcador: { type: "integer" },
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
      const {
        nombre_set,
        games_parejaA,
        games_parejaB,
        ventaja,
        es_supertiebreak,
        id_marcador,
      } = request.body as SetType;

      try {
        const response = await db.query(
          "UPDATE sets SET nombre_set = $1, games_parejaA = $2,  games_parejaB  = $3, ventaja = $4, es_supertiebreak = $5, id_marcador = $6 WHERE id_set = $7",
          [
            nombre_set,
            games_parejaA,
            games_parejaB,
            ventaja,
            es_supertiebreak,
            id_marcador,
            id,
          ]
        );
        console.log(response);
        reply.send({ mensaje: "MarcadorSET actualizado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar marcador" });
      }
    },
  });
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////////////////// ELIMINAR marcadorSET/////////////////////////////////////////////////////////
  fastify.delete("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Sets"],
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
        const result = await db.query("DELETE FROM sets WHERE id_set = $1", [
          id,
        ]);
        console.log(result);
        reply.send({
          mensaje: `marcadorSET con ID: ${id} eliminado correctamente`,
        });
      } catch (error) {
        reply.status(500).send({ error: "Error al eliminar marcadorSET" });
      }
    },
  });
};
export default setsRoute;
