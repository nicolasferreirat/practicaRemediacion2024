import { Static, Type } from "@sinclair/typebox";

export const AmericanoSchema = Type.Object(
  {
    id_americano: Type.Integer(),
    descripcion_torneo: Type.String({ maxLength: 100 }),
    numeroRonda: Type.Integer(),
    jugador1: Type.String({ maxLength: 100 }),
    jugador2: Type.String({ maxLength: 100 }),
    jugador3: Type.String({ maxLength: 100 }),
    jugador4: Type.String({ maxLength: 100 }),
    jugador5: Type.String({ maxLength: 100 }),
    jugador6: Type.String({ maxLength: 100 }),
    jugador7: Type.String({ maxLength: 100 }),
    jugador8: Type.String({ maxLength: 100 }),
    puntosJ1: Type.Integer(),
    puntosJ2: Type.Integer(),
    puntosJ3: Type.Integer(),
    puntosJ4: Type.Integer(),
    puntosJ5: Type.Integer(),
    puntosJ6: Type.Integer(),
    puntosJ7: Type.Integer(),
    puntosJ8: Type.Integer(),
    puesto1: Type.String({ maxLength: 100 }),
    puntos1: Type.Integer(),
    puesto2: Type.String({ maxLength: 100 }),
    puntos2: Type.Integer(),
    puesto3: Type.String({ maxLength: 100 }),
    puntos3: Type.Integer(),
  },
  {
    additionalProperties: false,
    $id: "americanosSchema",
  }
);

export type AmericanoType = Static<typeof AmericanoSchema>;
