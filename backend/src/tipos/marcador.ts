import { Type, Static } from "@sinclair/typebox";

export const MarcadorSchema = Type.Object(
  {
    id_marcador: Type.Integer({ description: "id del marcador " }),
    pin_editar: Type.String({
      minLength: 4,
      maxLength: 4,
      description: "pin para acceder a  editar el marcador",
    }),
    pin_compartir: Type.String({
      minLength: 4,
      maxLength: 4,
      description: "pin para compartir el marcador",
    }),
    descripcion_competencia: Type.String({
      description: "descripción del campeonato en juego",
    }),
    nombre_pareja_A1: Type.String({
      maxLength: 100,
      description: "Nombre del jugador 1 de la pareja A",
    }),
    nombre_pareja_A2: Type.String({
      maxLength: 100,
      description: "Nombre del jugador 2 de la pareja A",
    }),
    nombre_pareja_B1: Type.String({
      maxLength: 100,
      description: "Nombre del jugador 1 de la pareja B",
    }),
    nombre_pareja_B2: Type.String({
      maxLength: 100,
      description: "Nombre del jugador 2 de la pareja B",
    }),
    set1A: Type.Integer({
      minimum: 0,
      description: "Puntos del set 1 para la pareja A",
    }),
    set2A: Type.Integer({
      minimum: 0,
      description: "Puntos del set 1 para la pareja B",
    }),
    set3A: Type.Integer({
      minimum: 0,
      description: "Puntos de desempate del set 1 si aplica",
    }),
    set1B: Type.Integer({
      minimum: 0,
      description: "Puntos del set 2 para la pareja A",
    }),
    set2B: Type.Integer({
      minimum: 0,
      description: "Puntos del set 2 para la pareja B",
    }),
    set3B: Type.Integer({
      minimum: 0,
      description: "Puntos del set 3 para la pareja B",
    }),
    puntosA: Type.Integer({
      minimum: 0,
      description: "Games ganados por la pareja A",
    }),
    puntosB: Type.Integer({
      minimum: 0,
      description: "Games ganados por la pareja B",
    }),
    ventaja: Type.Boolean({
      description: "Si el partido se juega con ventaja o punto de oro",
    }),
    es_supertiebreak: Type.Boolean({
      description: "Si el 3er set es super tiebreak o normal",
    }),
    set_largo: Type.Boolean({
      description: "Si 5-5 a 7 o 5-5 a 6",
    }),
    id_usuario: Type.Integer({
      description: "id del usuario creador del marcador",
    }),
    id_club: Type.Integer({
      description: "id del club donde se juega",
    }),
    duracion_partido: Type.String({
      format: "time",
      description: "duración del partido",
    }),
  },
  {
    additionalProperties: false,
    $id: "marcadorSchema",
  }
);

// Static Type for TypeScript
export type MarcadorType = Static<typeof MarcadorSchema>;
