import { Static, Type } from "@sinclair/typebox";

export const HistorialSchema = Type.Object(
  {
    id_marcador: Type.Integer(),
    id_club: Type.Integer(),
    fecha_registro: Type.String({ format: "date-time" }),
  },
  {
    additionalProperties: false,
    $id: "historialSchema",
  }
);

export type HistorialType = Static<typeof HistorialSchema>;
