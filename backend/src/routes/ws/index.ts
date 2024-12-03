import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { WebSocket, RawData } from "ws";

const websocketRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  // Mapa para almacenar clientes asociados a cada pin
  const clientesPorPin = new Map<string, Set<WebSocket>>();
  // Mapa para almacenar el último marcador por pin
  const ultimoMarcadorPorPin = new Map<string, string | null>();
  
  fastify.get(
    "/",
    { websocket: true },
    (socket: WebSocket, req: FastifyRequest) => {
      let pin_compartir: string | null = null;

      // Espera el primer mensaje para identificar el pin
      socket.once("message", (message: RawData) => {
        // Se asume que el primer mensaje es el pin
        pin_compartir = message.toString(); 
        console.log(`Cliente conectado con pin ${pin_compartir}`);

        // Crea un conjunto de clientes para este pin si no existe
        if (!clientesPorPin.has(pin_compartir)) {
          clientesPorPin.set(pin_compartir, new Set());
        }
        clientesPorPin.get(pin_compartir)!.add(socket);

        // Enviar el último marcador al cliente recién conectado
        const ultimoMarcador = ultimoMarcadorPorPin.get(pin_compartir);
        if (ultimoMarcador) {
          console.log('enviando marcador')
          socket.send(ultimoMarcador);
        }

        // Configura el evento de mensaje para enviar el marcador a todos los clientes del pin
        socket.on("message", (message: RawData) => {
          const marcadorData = message.toString();
          console.log('recibido',marcadorData)
          ultimoMarcadorPorPin.set(pin_compartir!, marcadorData);

          // Si recibe "termino el partido", cierra la conexión
          if (marcadorData === "Termino el partido") {
            console.log(`Cerrando conexión para el pin ${pin_compartir}`);
            socket.close();
            return;
          }

          clientesPorPin.get(pin_compartir!)?.forEach((client) => {
              console.log(`Mensaje recibido en pin ${pin_compartir}, ${client.OPEN}: ${marcadorData}`);
              client.send(marcadorData);
          });
        });

        socket.on("close", () => {
          clientesPorPin.get(pin_compartir!)?.delete(socket);
          console.log(`Cliente desconectado del pin ${pin_compartir}`);
          if (clientesPorPin.get(pin_compartir!)?.size === 0) {
            clientesPorPin.delete(pin_compartir!);
            ultimoMarcadorPorPin.delete(pin_compartir!);
          }
        });

        socket.on("error", (error: any) => {
          console.log("error: ", error);
        });
      });
    }
  );
};

export default websocketRoutes;
