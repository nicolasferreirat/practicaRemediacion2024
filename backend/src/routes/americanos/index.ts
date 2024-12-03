import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import { AmericanoType } from "../../tipos/americano.js";
import db from "../../services/db.js";

interface QueryParams {
  descripcion_torneo?: string;
  jugador?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}

const americanosRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  //////////////////////////// RUTA PARA CREAR EL AMERICANO ///////////////////////////////////////////////////////
  fastify.post("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Americano"],
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            id_americano: { type: "integer" },
          },
        },
      },
    },

    handler: async function (request, reply) {
      console.log("llegue al handler");
      const {
        descripcion_torneo,
        jugador1,
        jugador2,
        jugador3,
        jugador4,
        jugador5,
        jugador6,
        jugador7,
        jugador8,
      } = request.body as AmericanoType;

      try {
        const result = await db.query(
          "INSERT INTO AMERICANOS (descripcion_torneo, jugador1, jugador2, jugador3, jugador4, jugador5, jugador6, jugador7, jugador8) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_americano",
          [
            descripcion_torneo,
            jugador1,
            jugador2,
            jugador3,
            jugador4,
            jugador5,
            jugador6,
            jugador7,
            jugador8,
          ]
        );

        const idAmericano = result.rows[0].id_americano;

        // Enviar respuesta conmensaje y id_americano
        reply.status(201).send({
          mensaje: "americano ingresado correctamente",
          id_americano: idAmericano,
        });
      } catch (error) {
        reply.status(500).send({ error: "Error al insertar americano" });
      }
    },
  });

  /////////////////////////// RUTA PARA OBTENER TODOS LOS AMERICANOS /////////////////////////////////////////////
  fastify.get("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Americano"],
      response: {
        200: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id_americano: { type: "integer" },
              descripcion_torneo: { type: "string", maxLength: 100 },
              jugador1: { type: "string", maxLength: 100 },
              jugador2: { type: "string", maxLength: 100 },
              jugador3: { type: "string", maxLength: 100 },
              jugador4: { type: "string", maxLength: 100 },
              jugador5: { type: "string", maxLength: 100 },
              jugador6: { type: "string", maxLength: 100 },
              jugador7: { type: "string", maxLength: 100 },
              jugador8: { type: "string", maxLength: 100 },
              puesto1: { type: "string", maxLength: 100 },
              puntos1: { type: "integer" },
              puesto2: { type: "string", maxLength: 100 },
              puntos2: { type: "integer" },
              puesto3: { type: "string", maxLength: 100 },
              puntos3: { type: "integer" },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const result = await db.query(
          "SELECT id_americano, descripcion_torneo, jugador1, jugador2, jugador3, jugador4, jugador5, jugador6, jugador7, jugador8, puesto1, puntos1, puesto2, puntos2, puesto3, puntos3 FROM AMERICANOS"
        );
        const americano = result.rows;
        return americano;
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener americanos" });
      }
    },
  });

  ////////////////////////// OBTENER AMERICANO POR ID ////////////////////////////////////////////////////////////////////
  fastify.get("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Americano"],
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },

    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      try {
        const resultado = await db.query(
          "SELECT descripcion_torneo, jugador1, jugador2, jugador3, jugador4, jugador5, jugador6, jugador7, jugador8, puesto1, puntos1, puesto2, puntos2, puesto3, puntos3 FROM AMERICANOS WHERE id_americano = $1",
          [id]
        );
        const americano = resultado.rows;
        if (americano.length > 0) {
          return americano;
        } else {
          reply
            .status(404)
            .send({ error: `Americano con id: ${id} no encontrado` });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener Americano" });
      }
    },
  });

  /////////////////////// RUTA CREADA PARA IR GUARDANDO LOS puntos DE CADA jugador luego de cada partido//////////////////////////
  fastify.put("/rondas/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Americano"],
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
          "puntosJ1",
          "puntosJ2",
          "puntosJ3",
          "puntosJ4",
          "puntosJ5",
          "puntosJ6",
          "puntosJ7",
          "puntosJ8",
          "numeroRonda",
        ],
        properties: {
          puntosJ1: { type: "integer" },
          puntosJ2: { type: "integer" },
          puntosJ3: { type: "integer" },
          puntosJ4: { type: "integer" },
          puntosJ5: { type: "integer" },
          puntosJ6: { type: "integer" },
          puntosJ7: { type: "integer" },
          puntosJ8: { type: "integer" },
          numeroRonda: { type: "integer" },
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
        puntosJ1,
        puntosJ2,
        puntosJ3,
        puntosJ4,
        puntosJ5,
        puntosJ6,
        puntosJ7,
        puntosJ8,
        numeroRonda,
      } = request.body as AmericanoType;

      try {
        const response = await db.query(
          "UPDATE AMERICANOS SET puntosJ1 = $1, puntosJ2 = $2, puntosJ3 = $3, puntosJ4 = $4, puntosJ5 = $5, puntosJ6 = $6, puntosJ7 = $7, puntosJ8 = $8, numeroRonda = $9  WHERE id_americano = $10",
          [
            puntosJ1,
            puntosJ2,
            puntosJ3,
            puntosJ4,
            puntosJ5,
            puntosJ6,
            puntosJ7,
            puntosJ8,
            numeroRonda,
            id,
          ]
        );
        console.log(response);
        reply.send({
          mensaje:
            "Puntos de cada jugador actualizados correctamente en el Americano",
        });
      } catch (error) {
        reply.status(500).send({
          error: "Error al actualizar puntos de jugadores en americano",
        });
      }
    },
  });

  /////////////////////// RUTA CREADA PARA GUARDAR EL AMERICANO CUANDO SE FINALIZA///////////////////////////////
  fastify.put("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Americano"],
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
          "descripcion_torneo",
          "jugador1",
          "jugador2",
          "jugador3",
          "jugador4",
          "jugador5",
          "jugador6",
          "jugador7",
          "jugador8",
          "puesto1",
          "puntos1",
          "puesto2",
          "puntos2",
          "puesto3",
          "puntos3",
        ],
        properties: {
          descripcion_torneo: { type: "string", maxLength: 100 },
          jugador1: { type: "string", maxLength: 100 },
          jugador2: { type: "string", maxLength: 100 },
          jugador3: { type: "string", maxLength: 100 },
          jugador4: { type: "string", maxLength: 100 },
          jugador5: { type: "string", maxLength: 100 },
          jugador6: { type: "string", maxLength: 100 },
          jugador7: { type: "string", maxLength: 100 },
          jugador8: { type: "string", maxLength: 100 },
          puesto1: { type: "string", maxLength: 100 },
          puntos1: { type: "integer" },
          puesto2: { type: "string", maxLength: 100 },
          puntos2: { type: "integer" },
          puesto3: { type: "string", maxLength: 100 },
          puntos3: { type: "integer" },
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
        descripcion_torneo,
        jugador1,
        jugador2,
        jugador3,
        jugador4,
        jugador5,
        jugador6,
        jugador7,
        jugador8,
        puesto1,
        puntos1,
        puesto2,
        puntos2,
        puesto3,
        puntos3,
      } = request.body as AmericanoType;

      // Obtener la fecha actual
      const fechaRegistro = new Date().toISOString();

      try {
        const response = await db.query(
          "UPDATE AMERICANOS SET descripcion_torneo = $1, jugador1 = $2, jugador2 = $3, jugador3 = $4, jugador4 = $5, jugador5 = $6, jugador6 = $7, jugador7 = $8, jugador8 = $9, puesto1 = $10, puntos1 = $11, puesto2 = $12, puntos2 = $13, puesto3 = $14, puntos3 = $15, fecha_registro = $16 WHERE id_americano = $17",
          [
            descripcion_torneo,
            jugador1,
            jugador2,
            jugador3,
            jugador4,
            jugador5,
            jugador6,
            jugador7,
            jugador8,
            puesto1,
            puntos1,
            puesto2,
            puntos2,
            puesto3,
            puntos3,
            fechaRegistro,
            id,
          ]
        );
        console.log(response);
        reply.send({ mensaje: "Americano actualizado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar americano" });
      }
    },
  });

  //////////////////// RUTA PARA MOSTRAR EN EL HISTORIAL Y HACER PAGINACION Y SERVER SIDE FILTERING////////////////
  fastify.get("/americanosSSF", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Historial"],
      querystring: {
        type: "object",
        properties: {
          descripcion_torneo: { type: "string" },
          jugador: { type: "string" },
          fechaInicio: { type: "string", format: "date" },
          fechaFin: { type: "string", format: "date" },
          page: { type: "number", minimum: 1 },
          limit: { type: "number", minimum: 1, default: 10 },
        },
      },
    },
    handler: async (request, reply) => {
      const {
        descripcion_torneo,
        jugador,
        fechaInicio,
        fechaFin,
        page = 1,
        limit = 10,
      } = request.query as QueryParams;

      const offset = (page - 1) * limit;

      try {
        let query = `
          SELECT 
            id_americano, descripcion_torneo, jugador1, jugador2, jugador3, jugador4,
            jugador5, jugador6, jugador7, jugador8, puesto1, puntos1, puesto2, puntos2,
            puesto3, puntos3, fecha_registro
          FROM AMERICANOS
        `;
        const params: any[] = [];
        let whereClause = [];

        if (descripcion_torneo) {
          whereClause.push(`descripcion_torneo ILIKE $${params.length + 1}`);
          params.push(`%${descripcion_torneo}%`);
        }

        if (jugador) {
          whereClause.push(`
            (jugador1 ILIKE $${params.length + 1} OR 
             jugador2 ILIKE $${params.length + 1} OR 
             jugador3 ILIKE $${params.length + 1} OR 
             jugador4 ILIKE $${params.length + 1} OR 
             jugador5 ILIKE $${params.length + 1} OR 
             jugador6 ILIKE $${params.length + 1} OR 
             jugador7 ILIKE $${params.length + 1} OR 
             jugador8 ILIKE $${params.length + 1})
          `);
          params.push(`%${jugador}%`);
        }

        if (fechaInicio && fechaFin) {
          whereClause.push(
            `fecha_registro BETWEEN $${params.length + 1}::timestamp AND $${
              params.length + 2
            }::timestamp`
          );
          params.push(fechaInicio, fechaFin);
        } else if (fechaInicio) {
          whereClause.push(
            `fecha_registro >= $${params.length + 1}::timestamp`
          );
          params.push(fechaInicio);
        } else if (fechaFin) {
          whereClause.push(
            `fecha_registro <= $${params.length + 1}::timestamp`
          );
          params.push(fechaFin);
        }

        if (whereClause.length > 0) {
          query += ` WHERE ${whereClause.join(" AND ")}`;
        }

        const paginatedQuery =
          query +
          ` ORDER BY fecha_registro DESC LIMIT $${params.length + 1} OFFSET $${
            params.length + 2
          }`;
        params.push(limit, offset);

        const resultado = await db.query(paginatedQuery, params);

        const totalQuery = await db.query(
          `SELECT COUNT(*) FROM AMERICANOS ${
            whereClause.length > 0 ? `WHERE ${whereClause.join(" AND ")}` : ""
          }`,
          params.slice(0, params.length - 2)
        );

        console.log("Resultado de la consulta:", resultado.rows);
        console.log("Total de registros:", totalQuery.rows);

        reply.send({
          americanos: resultado.rows,
          total: parseInt(totalQuery.rows[0].count, 10),
          page,
          limit,
        });
      } catch (error) {
        console.error(error);
        reply
          .status(500)
          .send({ error: "Error al obtener el historial de americanos" });
      }
    },
  });
};

export default americanosRoute;

/*descripcion_torneo, 
    jugador1,
    jugador2,
    jugador3,
    jugador4,
    jugador5,
    jugador6,
    jugador7,
    jugador8,
    puesto1,
    puntos1,
    puesto2,
    puntos2,
    puesto3,
    puntos3*/
