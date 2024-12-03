import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { FastifyInstance } from "fastify/types/instance.js";
import db from "../../services/db.js";
import { HistorialSchema, HistorialType } from "../../tipos/historiales.js";

const partidosHistorialRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.addSchema(HistorialSchema);
  //---------------------------------------------OBTENER PARTIDOS del HISTORIAL---------------------------------------------------------------
  fastify.get("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Historial"],
    },

    handler: async (request, reply) => {
      try {
        const resultado = await db.query(
          `SELECT h.id_marcador, h.id_club, h.fecha_registro,
                 m.pin_editar, m.pin_compartir, m.descripcion_competencia,
                 m.nombre_pareja_A1, m.nombre_pareja_A2, m.nombre_pareja_B1,
                 m.nombre_pareja_B2, m.ventaja, m.es_supertiebreak, m.set_largo,
                 c.nombre_club
          FROM HISTORIAL h
          JOIN MARCADORES m ON h.id_marcador = m.id_marcador
          JOIN CLUBES c ON h.id_club = c.id_club`
        );
        const historial = resultado.rows;
        if (historial.length > 0) {
          return historial;
        } else {
          reply.status(404).send({ error: "Historial no encontrado" });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener historial" });
      }
    },
  });
  //------------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------AGREGAR PARTIDO A HISTORIAL------------------------------------------------
  fastify.post("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Historial"],
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
      const { id_marcador, id_club, fecha_registro } =
        request.body as HistorialType;

      try {
        // Verifica si el marcador ya está en el historial
        const historialCheck = await db.query(
          "SELECT * FROM HISTORIAL WHERE id_marcador = $1",
          [id_marcador]
        );

        if (historialCheck.rowCount !== 0) {
          return reply.status(400).send({
            error: "Este marcador ya existe en el historial",
          });
        }

        // Inserta el marcador en el historial especificado
        await db.query(
          "INSERT INTO HISTORIAL (id_marcador, id_club, fecha_registro) VALUES ($1, $2, $3)",
          [id_marcador, id_club, fecha_registro]
        );

        reply.status(201).send({
          mensaje: "Marcador ingresado correctamente en el historial",
        });
      } catch (error) {
        console.error("Error al insertar en el historial:", error);
        reply.status(500).send({ error: "Error al insertar en el historial" });
      }
    },
  });
  //-----------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------ELIMINAR PARTIDO DE HISTORIAL----------------------------------------------
  fastify.delete("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Historial"],
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
        const result = await db.query(
          "DELETE FROM HISTORIAL WHERE id_marcador = $1",
          [id]
        );
        console.log(result);
        reply.send({
          mensaje: `Partido con ID: ${id} eliminado correctamente del historial`,
        });
      } catch (error) {
        reply
          .status(500)
          .send({ error: "Error al eliminar partido del historial" });
      }
    },
  });
  //-----------------------------------------------------------------------------------------------------------------------
  //-------------------------OBTENER PARTIDOS DE UN HISTORIAL (SERVER SIDE FILTERING Y PAGINATION)-------------------------
  fastify.get("/ssf", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Historial"],
      querystring: {
        type: "object",
        properties: {
          club: { type: "string" },
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
        club,
        jugador,
        fechaInicio,
        fechaFin,
        page = 1,
        limit = 10,
      } = request.query as {
        club?: string;
        jugador?: string;
        fechaInicio: { type: "string"; format: "date" };
        fechaFin: { type: "string"; format: "date" };
        page: number;
        limit: number;
      };

      const offset = (page - 1) * limit;

      try {
        let query = `
          SELECT h.id_marcador, h.id_club, m.fecha_creacion, m.duracion_partido,
                 m.pin_editar, m.pin_compartir, m.descripcion_competencia,
                 m.nombre_pareja_A1, m.nombre_pareja_A2, m.nombre_pareja_B1,
                 m.nombre_pareja_B2, m.ventaja, m.es_supertiebreak, m.set_largo,
                 c.nombre_club
          FROM HISTORIAL h
          JOIN MARCADORES m ON h.id_marcador = m.id_marcador
          JOIN CLUBES c ON h.id_club = c.id_club
        `;
        const params: any[] = [];

        if (club) {
          query += ` WHERE c.nombre_club ILIKE $${params.length + 1}`;
          params.push(`%${club}%`);
        }

        if (jugador) {
          query += params.length > 0 ? " AND " : " WHERE ";
          query += `(
            m.nombre_pareja_A1 ILIKE $${params.length + 1} OR
            m.nombre_pareja_A2 ILIKE $${params.length + 1} OR
            m.nombre_pareja_B1 ILIKE $${params.length + 1} OR
            m.nombre_pareja_B2 ILIKE $${params.length + 1}
          )`;
          params.push(`%${jugador}%`);
        }

        if (fechaInicio && fechaFin) {
          query += ` AND h.fecha_registro BETWEEN $${
            params.length + 1
          }::timestamp AND $${params.length + 2}::timestamp`;
          params.push(fechaInicio, fechaFin);
        } else if (fechaInicio) {
          query += ` AND h.fecha_registro >= $${params.length + 1}::timestamp`;
          params.push(fechaInicio);
        } else if (fechaFin) {
          query += ` AND h.fecha_registro <= $${params.length + 1}::timestamp`;
          params.push(fechaFin);
        }

        const paginatedQuery =
          query +
          ` ORDER BY h.fecha_registro DESC LIMIT $${
            params.length + 1
          } OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const resultado = await db.query(paginatedQuery, params);

        const totalQuery = await db.query(
          `SELECT COUNT(*) FROM HISTORIAL h
          JOIN MARCADORES m ON h.id_marcador = m.id_marcador
          JOIN CLUBES c ON h.id_club = c.id_club
          ${query.slice(query.indexOf("WHERE"))}`,
          params.slice(0, params.length - 2)
        );

        reply.send({
          partidos: resultado.rows,
          total: parseInt(totalQuery.rows[0].count, 10),
          page,
          limit,
        });
      } catch (error) {
        reply
          .status(500)
          .send({ error: "Error al obtener historial de partidos" });
      }
    },
  });
};

export default partidosHistorialRoute;
