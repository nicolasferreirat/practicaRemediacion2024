import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  FastifyPluginAsync,
} from "fastify";
import got from "got";
import db from "../../../../services/db.js";
import { UsuarioType } from "../../../../tipos/usuario.js";

interface GoogleCallbackQuery {
  code: string; // Parámetro 'code' que Google envía en la URL
}

interface GoogleUserInfo {
  //id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

const googleRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: any
): Promise<void> => {
  fastify.get(
    "/callback",
    async function (
      request: FastifyRequest<{ Querystring: GoogleCallbackQuery }>,
      reply: FastifyReply
    ) {
      const { code } = request.query;

      if (!code) {
        return reply
          .status(400)
          .send({ error: "No se recibió el código de autorización." });
      }

      try {
        const { token: googletoken } =
          await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
            request
          );

        const userInfo: GoogleUserInfo = await got
          .get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
              Authorization: `Bearer ${googletoken.access_token}`,
            },
          })
          .json();
        console.log("userinfo:", userInfo);

        const res = await db.query("SELECT * FROM usuarios WHERE mail=$1", [
          userInfo.email,
        ]);

        if (res.rowCount === 0) {
          const formUrl = `https://${
            process.env.FRONT_URL
          }/registro?email=${encodeURIComponent(userInfo.email)}&imagen=${encodeURIComponent(userInfo.picture)}`;
          return reply.redirect(formUrl);
        }

        const usuario: UsuarioType = res.rows[0];
        const token = fastify.jwt.sign({ id: usuario.id, nombre_usuario: usuario.nombre_usuario });

        const redirectUrl = `http://localhost/auth/callback?token=${token}`;
        return reply.redirect(redirectUrl);
      } catch (error) {
        console.error("Error al obtener el token de Google:", error);
        return reply
          .status(500)
          .send({ error: "Error en el intercambio de token." });
      }
    }
  );

  fastify.post(
    "/validarToken",
    async function (request: FastifyRequest, reply: FastifyReply) {
      const body = request.body as any;

      const token = body.token;

      if (typeof token !== "string") {
        return reply
          .status(400)
          .send({ valid: false, error: "Invalid token format" });
      }

      try {
        await fastify.jwt.verify(token);
        reply.send({ valid: true });
      } catch (err) {
        reply.send({ valid: false });
      }
    }
  );
};

export default googleRoutes;
