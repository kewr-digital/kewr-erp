import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const customerSchema = {
  description: "Customers",
  tags: ["Customers"],
  body: {
    type: "object",
    required: [
      "customer_id",
      "customer_name",
      "customer_type",
      "image",
      "address",
      "phone",
      "email",
      "credit_balance",
    ],
    properties: {
      customer_id: { type: "string" },
      customer_name: { type: "string" },
      customer_type: { type: "string" },
      image: { type: "string" },
      address: { type: "string" },
      phone: { type: "string" },
      email: { type: "string" },
      credit_balance: { type: "number" },
    },
  },
  response: {
    200: {
      description: "Successful login",
      type: "object",
      properties: {
        message: { type: "string" },
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            id: { type: "number" },
            customer_id: { type: "string" },
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

const customerResponseSchema = {
  description: "Customers",
  tags: ["Customers"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          customer_id: { type: "string" },
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

const deleteCustomerResponseSchema = {
  description: "Customer deletion",
  tags: ["Customers"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        customer_id: { type: "string" },
        customer_name: { type: "string" },
        customer_type: { type: "string" },
        image: { type: "string" },
        address: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        credit_balance: { type: "number" },
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
    "/customers",
    { schema: customerResponseSchema },
    async (req, res) => {
      try {
        const customers = await prisma.customer.findMany();
        return res.code(200).send(customers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        return res
          .code(500)
          .send({ error: "An error occurred while fetching customers" });
      }
    }
  );

  fastify.post("/customers", { schema: customerSchema }, async (req, res) => {
    const { id, ...newCustomer } = req.body;
    try {
      const createdCustomer = await prisma.customer.create({
        data: newCustomer,
      });
      return res.code(200).send(createdCustomer);
    } catch (error) {
      fastify.log.error(error);
      return res
        .code(500)
        .send({ error: "An error occurred while creating customer" });
    }
  });

  fastify.put(
    "/customers/:customerId",
    { schema: customerSchema },
    async (req, res) => {
      const { customerId } = req.params;
      const updatedCustomer = req.body;

      try {
        const customer = await prisma.customer.update({
          where: { id: Number(customerId) },
          data: updatedCustomer,
        });

        res.code(200).send({
          message: "Customer updated successfully",
          customer,
        });
      } catch (error) {
        console.error("Error updating customer:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating customer" });
      }
    }
  );

  fastify.delete(
    "/customers/:customerId",
    { schema: deleteCustomerResponseSchema },
    async (req, res) => {
      const { customerId } = req.params;

      try {
        const deletedCustomer = await prisma.customer.delete({
          where: { id: Number(customerId) },
        });

        res.code(200).send(deletedCustomer);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Customer not found" });
        } else {
          console.error("Error deleting customer:", error);
          res
            .code(500)
            .send({ error: "An error occurred while deleting the customer" });
        }
      }
    }
  );

  done();
});
