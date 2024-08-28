import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "./plugins/swagger.js";
import Fastify from "fastify";
import dotenv from "dotenv";
import login from "./Routes/login.js";
import customer from "./Routes/customer.js";
import product from "./Routes/product.js";
import service from "./Routes/servics.js";
import expenses from "./Routes/expenses.js";
import pic from "./Routes/pic.js";
import warehouse from "./Routes/warehouse.js";
import vendor from "./Routes/vendor.js";
import cors from "@fastify/cors";
import transaction from "./Routes/transaction.js";

dotenv.config();

async function main() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.register(fastifySwagger, {
    prefix: "/docs",
    exposeRoute: true,
  });
  fastify.register(fastifySwaggerUi);
  fastify.register(login);
  fastify.register(customer);
  fastify.register(product);
  fastify.register(service);
  fastify.register(pic);
  fastify.register(expenses);
  fastify.register(warehouse);
  fastify.register(vendor);
  fastify.register(transaction);

  const corsOptions = {
    origin: "*",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Authorization,Content-Type",
  };
  fastify.register(cors, corsOptions);

  await fastify.ready();
  return fastify;
}

(async () => {
  try {
    const server = await main();
    server.listen({
      port: Number(process.env.APP_PORT) ?? 3000,
      host: process.env.APP_HOST ?? "localhost",
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
