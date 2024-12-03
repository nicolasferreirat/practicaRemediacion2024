import { Static, Type } from "@sinclair/typebox";

export const SetsSchema = Type.Object(
  {
    id_set: Type.Integer(),
    nombre_set: Type.String({ maxLength: 100 }),
    games_parejaA: Type.Integer(),
    games_parejaB: Type.Integer(),
    ventaja: Type.Boolean(),
    es_supertiebreak: Type.Boolean(),
    id_marcador: Type.Integer(),
  },
  {
    additionalProperties: false,
    $id: "setsSchema",
  }
);

export type SetType = Static<typeof SetsSchema>;
