import { Static, Type } from "@sinclair/typebox";

export const ClubSchema = Type.Object(
  {
    id_club: Type.Integer(),
    nombre_club: Type.String(),
    direccion: Type.String(),
    cant_pistas: Type.Integer(),
    logo: Type.Optional(Type.String()), 
    foto: Type.Optional(Type.String()),
  },
  {
    additionalProperties: false,
    $id: "clubesSchema",
  }
);

export type clubType = Static<typeof ClubSchema>;
