import { FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { FastifyInstance } from "fastify/types/instance.js";
import { MarcadorType } from "../../tipos/marcador.js";
import db from "../../services/db.js";

const marcadorRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  //---------------------------------------------OBTENER MARCADOR POR ID-----------------------------------------------------------------
  fastify.get("/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_editar: { type: "number" },
        },
        required: ["pin_editar"],
      },
    },

    handler: async (request, reply) => {
      const { pin_editar } = request.params as { pin_editar: number };
      try {
        const resultado = await db.query(
          `SELECT id_marcador AS "id_marcador",
                  pin_compartir AS "pin_compartir", 
                  descripcion_competencia AS "descripcion_competencia", 
                  nombre_pareja_A1 AS "nombre_pareja_A1", 
                  nombre_pareja_A2 AS "nombre_pareja_A2", 
                  nombre_pareja_B1 AS "nombre_pareja_B1", 
                  nombre_pareja_B2 AS "nombre_pareja_B2", 
                  set1A AS "set1A", 
                  set1B AS "set1B", 
                  set2A AS "set2A",
                  set2B AS "set2B", 
                  set3A AS "set3A",
                  set3B AS "set3B", 
                  puntosA AS "puntosA", 
                  puntosB AS "puntosB", 
                  ventaja AS "ventaja",
                  es_supertiebreak AS "es_supertiebreak",
                  set_largo AS "set_largo",
                  fecha_creacion AS "fecha_creacion", 
                  duracion_partido AS "duracion_partido" 
            FROM marcadores 
            WHERE pin_editar = $1`,
          [pin_editar]
        );
        
        const marcador = resultado.rows;
        if (marcador.length > 0) {
          return marcador[0];
        } else {
          reply.status(404).send({ error: "Marcador no encontrado" });
        }
      } catch (error) {
        reply.status(500).send({ error: "Error al obtener Marcador" });
      }
    },
  });
  //---------------------------------------------CREAR MARCADOR-----------------------------------------------------------------
  fastify.post("/", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            id_marcador: { type: "integer" },
            pin_editar: { type: "string" },
            fecha_creacion: { type: "string", format: "date-time" }, 
          },
        },
      },
    },
  
    handler: async function (request, reply) {
      const {
        pin_editar,
        pin_compartir,
        descripcion_competencia,
        nombre_pareja_A1,
        nombre_pareja_A2,
        nombre_pareja_B1,
        nombre_pareja_B2,
        ventaja,
        es_supertiebreak,
        set_largo,
        id_usuario,
        id_club,
        duracion_partido,
      } = request.body as MarcadorType;
      try {
        // Verificar que los pins no estén duplicados
        const pinEditarCheck = await db.query(
          "SELECT * FROM marcadores WHERE pin_editar = $1",
          [pin_editar]
        );
        if (pinEditarCheck.rowCount != 0) {
          return reply
            .status(400)
            .send({ error: "El pin para editar el marcador ya está en uso." });
        }
  
        const pinCompartirCheck = await db.query(
          "SELECT * FROM marcadores WHERE pin_compartir = $1",
          [pin_compartir]
        );
        if (pinCompartirCheck.rowCount != 0) {
          return reply.status(400).send({
            error: "El pin para compartir el marcador ya está en uso.",
          });
        }
  
        // Insertar el nuevo marcador
        const result = await db.query(
          `INSERT INTO marcadores (
                    pin_editar, pin_compartir, descripcion_competencia, 
                    nombre_pareja_A1, nombre_pareja_A2, nombre_pareja_B1, nombre_pareja_B2, 
                    set1A, set2A, set3A, set1B, set2B, set3B, puntosA, puntosB, 
                    ventaja, es_supertiebreak, set_largo, id_usuario, id_club, fecha_creacion, duracion_partido
             ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, 
                    0, 0, 0, 0, 0, 0, 0, 0, 
                    $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, $13
             ) RETURNING id_marcador, fecha_creacion`,
          [
            pin_editar,
            pin_compartir,
            descripcion_competencia,
            nombre_pareja_A1,
            nombre_pareja_A2,
            nombre_pareja_B1,
            nombre_pareja_B2,
            ventaja,
            es_supertiebreak,
            set_largo,
            id_usuario,
            id_club,
            duracion_partido,
          ]
        );
  
        const id_marcador = result.rows[0].id_marcador;
        const fecha_creacion = result.rows[0].fecha_creacion;
  
        reply.status(201).send({
          mensaje: "Marcador creado correctamente",
          id_marcador: id_marcador,
          pin_editar: pin_editar,
          fecha_creacion: fecha_creacion, 
        });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: "Error al crear marcador" });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------
  //----------------------------------------INICIALIZAR MARCADOR---------------------------------------------------------------
  fastify.put("/iniciar/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_editar: { type: "string" }, 
        },
        required: ["pin_editar"],
      },
      body: {
        type: "object",
        required: ["fecha_creacion"], 
        properties: {
          fecha_creacion: { type: "string", format: "date-time" }, 
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
      const { pin_editar } = request.params as { pin_editar: string }; 
      const { fecha_creacion } = request.body as { fecha_creacion: string }; 
  
      try {
        await db.query(
          `UPDATE marcadores 
           SET fecha_creacion = $1
           WHERE pin_editar = $2`,
          [fecha_creacion, pin_editar]
        );
        reply.send({ mensaje: "Marcador iniciado correctamente" });
      } catch (error) {
        console.error("Error al iniciar marcador:", error);
        reply.status(500).send({ error: "Error al iniciar marcador" });
      }
    },
  });

  //--------------------------------------------EDITAR MARCADOR----------------------------------------------------------------
  fastify.put("/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_editar: { type: "string" },
        },
        required: ["pin_editar"],
      },
      body: {
        type: "object",
        required: [
          "descripcion_competencia",
          "nombre_pareja_A1",
          "nombre_pareja_A2",
          "nombre_pareja_B1",
          "nombre_pareja_B2",
          "set1A",
          "set2A",
          "set3A",
          "set1B",
          "set2B",
          "set3B",
          "puntosA",
          "puntosB",
        ],
        properties: {
          descripcion_competencia: { type: "string", maxLength: 100 },
          nombre_pareja_A1: { type: "string", maxLength: 100 },
          nombre_pareja_A2: { type: "string", maxLength: 100 },
          nombre_pareja_B1: { type: "string", maxLength: 100 },
          nombre_pareja_B2: { type: "string", maxLength: 100 },
          set1A: { type: "integer" },
          set2A: { type: "integer" },
          set3A: { type: "integer" },
          set1B: { type: "integer" },
          set2B: { type: "integer" },
          set3B: { type: "integer" },
          puntosA: { type: "integer" },
          puntosB: { type: "integer" },
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
      const { pin_editar } = request.params as { pin_editar: string };
      const {
        descripcion_competencia,
        nombre_pareja_A1,
        nombre_pareja_A2,
        nombre_pareja_B1,
        nombre_pareja_B2,
        set1A,
        set2A,
        set3A,
        set1B,
        set2B,
        set3B,
        puntosA,
        puntosB,
        duracion_partido,
      } = request.body as MarcadorType;
  
      try {
        const response = await db.query(
          `UPDATE marcadores 
           SET descripcion_competencia = $1, 
               nombre_pareja_A1 = $2, 
               nombre_pareja_A2 = $3, 
               nombre_pareja_B1 = $4, 
               nombre_pareja_B2 = $5, 
               set1A = $6, 
               set2A = $7, 
               set3A = $8, 
               set1B = $9, 
               set2B = $10, 
               set3B = $11, 
               puntosA = $12, 
               puntosB = $13, 
               duracion_partido = $14 
           WHERE pin_editar = $15`,
          [
            descripcion_competencia,
            nombre_pareja_A1,
            nombre_pareja_A2,
            nombre_pareja_B1,
            nombre_pareja_B2,
            set1A,
            set2A,
            set3A,
            set1B,
            set2B,
            set3B,
            puntosA,
            puntosB,
            duracion_partido,
            pin_editar,
          ]
        );
        response; 
        reply.send({ mensaje: "Marcador actualizado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar marcador" });
      }
    },
  });
  
  //----------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------FINALIZAR MARCADOR----------------------------------------------------------------
  fastify.put("/finalizar/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_editar: { type: "string" },
        },
        required: ["pin_editar"],
      },
      body: {
        type: "object",
        required: [
          "descripcion_competencia",
          "nombre_pareja_A1",
          "nombre_pareja_A2",
          "nombre_pareja_B1",
          "nombre_pareja_B2",
        ],
        properties: {
          descripcion_competencia: { type: "string", maxLength: 100 },
          nombre_pareja_A1: { type: "string", maxLength: 100 },
          nombre_pareja_A2: { type: "string", maxLength: 100 },
          nombre_pareja_B1: { type: "string", maxLength: 100 },
          nombre_pareja_B2: { type: "string", maxLength: 100 },
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
      const { pin_editar } = request.params as { pin_editar: string };
      const {
        descripcion_competencia,
        nombre_pareja_A1,
        nombre_pareja_A2,
        nombre_pareja_B1,
        nombre_pareja_B2,
        duracion_partido,
      } = request.body as MarcadorType;

      try {
        const response = await db.query(
          "UPDATE marcadores SET descripcion_competencia = $1, nombre_pareja_A1 = $2,  nombre_pareja_A2  = $3, nombre_pareja_B1 = $4, nombre_pareja_B2 = $5, duracion_partido = $6 WHERE pin_editar = $7",
          [
            descripcion_competencia,
            nombre_pareja_A1,
            nombre_pareja_A2,
            nombre_pareja_B1,
            nombre_pareja_B2,
            duracion_partido,
            pin_editar,
          ]
        );
        response;

        await db.query(
          "UPDATE marcadores SET pin_editar = NULL, pin_compartir = NULL WHERE pin_editar = $1",
          [pin_editar]
        );

        reply.send({ mensaje: "Marcador actualizado correctamente" });
      } catch (error) {
        reply.status(500).send({ error: "Error al actualizar marcador" });
      }
    },
  });
  
  //----------------------------------------------------------------------------------------------------------------------------

  //--------------------------------------------ELIMINAR MARCADOR---------------------------------------------------------------
  fastify.delete("/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_editar: { type: "string" },
        },
        required: ["pin_editar"],
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
      const { pin_editar } = request.params as { pin_editar: string };

      try {
        const result = await db.query(
          "DELETE FROM marcadores WHERE pin_editar = $1",
          [pin_editar]
        );
        console.log(result);
        reply.send({
          mensaje: `Marcador con pin de editar: ${pin_editar} eliminado correctamente`,
        });
      } catch (error) {
        reply.status(500).send({ error: "Error al eliminar marcador" });
      }
    },
  });
  //----------------------------------------------------------------------------------------------------------------------------
  //---------------------------------------------VALIDAR PIN para COMPARTIR-----------------------------------------------------------------
  fastify.get("/verificar-pinC/:pin_compartir", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_compartir: { type: "string" },
        },
        required: ["pin_compartir"],
      },
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            valido: { type: "boolean" },
          },
        },
      },
    },

    handler: async (request, reply) => {
      const { pin_compartir } = request.params as { pin_compartir: string };
      try {
        const resultado = await db.query(
          "SELECT 1 FROM marcadores WHERE pin_compartir = $1",
          [pin_compartir]
        );
        const result = resultado.rows;
        if (result.length > 0) {
          reply.send({
            valido: true,
            mensaje: "El PIN es válido y el marcador está activo.",
          });
        } else {
          reply.send({
            valido: false,
            mensaje: "PIN inválido o el marcador no está activo.",
          });
        }
      } catch (error) {
        console.error("Error al verificar el PIN:", error);
        reply
          .status(500)
          .send({ error: "Error al verificar el PIN en la base de datos." });
      }
    },
  });

  ////////////////////////validar pin para editar////////////////////////////////

  fastify.get("/verificar-pinE/:pin_editar", {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ["Marcadores"],
      params: {
        type: "object",
        properties: {
          pin_compartir: { type: "string" },
        },
        required: ["pin_editar"],
      },
      response: {
        "2xx": {
          type: "object",
          properties: {
            mensaje: { type: "string" },
            valido: { type: "boolean" },
          },
        },
      },
    },

    handler: async (request, reply) => {
      const { pin_editar } = request.params as { pin_editar: string };
      try {
        const resultado = await db.query(
          "SELECT 1 FROM marcadores WHERE pin_editar = $1",
          [pin_editar]
        );
        const result = resultado.rows;
        if (result.length > 0) {
          reply.send({
            valido: true,
            mensaje: "El PIN es válido y el marcador está activo.",
          });
        } else {
          reply.send({
            valido: false,
            mensaje: "PIN inválido o el marcador no está activo.",
          });
        }
      } catch (error) {
        console.error("Error al verificar el PIN:", error);
        reply
          .status(500)
          .send({ error: "Error al verificar el PIN en la base de datos." });
      }
    },
  });
};

export default marcadorRoute;
