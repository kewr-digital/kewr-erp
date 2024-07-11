import fp from "fastify-plugin";
import fastifySwaggerUi from "@fastify/swagger-ui";

export default fp(
  function (fastify, opts, done) {
    const swaggerUiOptions = {
      routePrefix: "/docs",
      exposeRoute: true,
    };

    fastify.register(fastifySwaggerUi, swaggerUiOptions);

    done();
  },
  { dependencies: ["@fastify/swagger"] }
);
