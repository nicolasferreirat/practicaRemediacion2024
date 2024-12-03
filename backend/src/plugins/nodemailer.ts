import nodemailer = require("nodemailer");
import fp from "fastify-plugin";

export default fp(async (fastify) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.USER,
            pass: process.env.PASS,
        },
    });

    fastify.decorate("mailer", transporter);
});

declare module "fastify" {
    interface FastifyInstance {
        mailer: any;
    }
}