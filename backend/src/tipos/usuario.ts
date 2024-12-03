import { Static, Type } from "@sinclair/typebox";

const UsuarioSchema = Type.Object(
  {
    id: Type.Number(),
    nombre: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    apellido: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[a-zA-Z ]+$",
    }),
    nombre_usuario: Type.String({
      minLength: 2,
      maxLength: 30,
      pattern: "^[^@]*$",
    }),
    mail: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8, maxLength: 12 }),
  },
  {
    additionalProperties: true,
    $id: "usuario",
  }
);

export type UsuarioType = Static<typeof UsuarioSchema>;
