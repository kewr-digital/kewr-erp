import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const serviceSchema = {
  description: "Services",
  tags: ["Services"],
  body: {
    type: "object",
    required: ["service_code", "service_name", "unit_price"],
    properties: {
      service_code: { type: "string" },
      service_name: { type: "string" },
      unit_price: { type: "number" },
    },
  },
  response: {
    200: {
      description: "Successful service",
      type: "object",
      properties: {
        message: { type: "string" },
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "number" },
            service_code: { type: "string" },
            service_name: { type: "string" },
            unit_price: { type: "number" },
          },
        },
      },
    },
    400: {
      description: "Bad request",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    401: {
      description: "Unauthorized",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      description: "Internal server error",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const serviceResponseSchema = {
  description: "Services",
  tags: ["Services"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          service_code: { type: "string" },
          service_name: { type: "string" },
          unit_price: { type: "number" },
        },
      },
    },
    400: {
      description: "Bad request",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    401: {
      description: "Unauthorized",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      description: "Internal server error",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

const deleteServiceResponseSchema = {
  description: "Service deletion",
  tags: ["Services"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        service_code: { type: "string" },
        service_name: { type: "string" },
        unit_price: { type: "number" },
      },
    },
    400: {
      description: "Bad request",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    401: {
      description: "Unauthorized",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    500: {
      description: "Internal server error",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
    404: {
      description: "Customer not found",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default fp(function (fastify, opts, done) {
  fastify.get(
    "/services",
    { schema: serviceResponseSchema },
    async (req, res) => {
      try {
        const services = await prisma.service.findMany();
        res.code(200).send(services);
      } catch (error) {
        console.error("Error fetching services:", error);
        res
          .code(500)
          .send({ error: "An error occurred while fetching services" });
      }
    }
  );

  fastify.post("/services", { schema: serviceSchema }, async (req, res) => {
    const { id, ...newService } = req.body;

    try {
      const createdService = await prisma.service.create({
        data: newService,
      });

      res.code(200).send(createdService);
    } catch (error) {
      console.error("Error creating service:", error);
      res.code(500).send({ error: "An error occurred while creating service" });
    }
  });

  fastify.put(
    "/services/:serviceId",
    { schema: serviceSchema },
    async (req, res) => {
      const { serviceId } = req.params;
      const updatedService = req.body;

      try {
        const service = await prisma.service.update({
          where: { id: Number(serviceId) },
          data: updatedService,
        });

        res.code(200).send({
          message: "service updated successfully",
          service,
        });
      } catch (error) {
        console.error("Error updating service:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating service" });
      }
    }
  );

  fastify.delete(
    "/services/:serviceId",
    { schema: deleteServiceResponseSchema },
    async (req, res) => {
      const { serviceId } = req.params;

      try {
        const deletedService = await prisma.service.delete({
          where: { id: Number(serviceId) },
        });

        res.code(200).send(deletedService);
      } catch (error) {
        console.error("Error deleting service:", error);
        res
          .code(500)
          .send({ error: "An error occurred while deleting service" });
      }
    }
  );

  done();
});
