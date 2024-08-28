import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const serviceSchema = {
  description: "Create or update a service",
  tags: ["Services"],
  body: {
    type: "object",
    required: ["service_code", "service_name", "unit_price", "customer_id"],
    properties: {
      service_code: { type: "string" },
      service_name: { type: "string" },
      unit_price: { type: "number" },
      customer_id: { type: "number" },
    },
  },
  response: {
    200: {
      description: "Successful operation",
      type: "object",
      properties: {
        message: { type: "string" },
        service: {
          type: "object",
          properties: {
            id: { type: "number" },
            service_code: { type: "string" },
            service_name: { type: "string" },
            unit_price: { type: "number" },
            customer_id: { type: "number" },
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
  description: "Get all services",
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
          customer_id: { type: "number" },
          customer: {
            type: "object",
            properties: {
              id: { type: "number" },
              customer_code: { type: "string" },
              customer_name: { type: "string" },
              customer_type: { type: "string" },
              image: { type: "string" },
              address: { type: "string" },
              phone: { type: "string" },
              email: { type: "string" },
              credit_balance: { type: "number" },
            },
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

const deleteServiceResponseSchema = {
  description: "Delete a service",
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
        customer_id: { type: "number" },
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
    404: {
      description: "Service not found",
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

export default fp(function (fastify, opts, done) {
  fastify.get(
    "/services",
    { schema: serviceResponseSchema },
    async (req, res) => {
      try {
        const services = await prisma.service.findMany({
          include: {
            customer: true, // Fetch associated customer data
          },
        });
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
    const { service_code, service_name, unit_price, customer_id } = req.body;

    try {
      const createdService = await prisma.service.create({
        data: {
          service_code,
          service_name,
          unit_price,
          customer: { connect: { id: customer_id } },
        },
      });

      res.code(200).send({
        message: "Service created successfully",
        service: createdService,
      });
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
      const { service_code, service_name, unit_price, customer_id } = req.body;

      try {
        const updatedService = await prisma.service.update({
          where: { id: Number(serviceId) },
          data: {
            service_code,
            service_name,
            unit_price,
            customer_id,
          },
        });

        res.code(200).send({
          message: "Service updated successfully",
          service: updatedService,
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
