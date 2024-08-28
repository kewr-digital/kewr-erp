import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const warehouseSchema = {
  description: "Warehouse",
  tags: ["Warehouse"],
  body: {
    type: "object",
    required: ["warehouse_id", "warehouse_name", "location"],
    properties: {
      warehouse_id: { type: "string" },
      warehouse_name: { type: "string" },
      location: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Successful warehouse",
      type: "object",
      properties: {
        message: { type: "string" },
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            warehouse_id: { type: "string" },
            warehouse_name: { type: "string" },
            location: { type: "string" },
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

const warehouseResponseSchema = {
  description: "Warehouse",
  tags: ["Warehouse"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          warehouse_id: { type: "string" },
          warehouse_name: { type: "string" },
          location: { type: "string" },
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

const deleteWarehouseResponseSchema = {
  description: "Warehouse deletion",
  tags: ["Warehouse"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        warehouse_id: { type: "string" },
        warehouse_name: { type: "string" },
        location: { type: "string" },
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
      description: "Warehouse not found",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default fp(function (fastify, opts, done) {
  fastify.get(
    "/warehouse",
    { schema: warehouseResponseSchema },
    async (req, res) => {
      try {
        const warehouses = await prisma.warehouse.findMany();
        res.code(200).send(warehouses);
      } catch (error) {
        console.error("Error fetching warehouse:", error);
        res
          .code(500)
          .send({ error: "An error occurred while fetching warehouse" });
      }
    }
  );

  fastify.post("/warehouse", { schema: warehouseSchema }, async (req, res) => {
    const { id, ...newWarehouse } = req.body;

    try {
      const createdWarehouse = await prisma.warehouse.create({
        data: newWarehouse,
      });

      res.code(200).send(createdWarehouse);
    } catch (error) {
      console.error("Error creating warehouse:", error);
      res
        .code(500)
        .send({ error: "An error occurred while creating warehouse" });
    }
  });

  fastify.put(
    "/warehouse/:warehouseId",
    { schema: warehouseSchema },
    async (req, res) => {
      const { warehouseId } = req.params;
      const updatedWarehouse = req.body;

      try {
        const warehouse = await prisma.warehouse.update({
          where: { id: Number(warehouseId) },
          data: updatedWarehouse,
        });

        res.code(200).send({
          message: "warehouse updated successfully",
          warehouse,
        });
      } catch (error) {
        console.error("Error updating warehouse:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating warehouse" });
      }
    }
  );

  fastify.delete(
    "/warehouse/:warehouseId",
    { schema: deleteWarehouseResponseSchema },
    async (req, res) => {
      const { warehouseId } = req.params;

      try {
        const deletedWarehouse = await prisma.warehouse.delete({
          where: { id: Number(warehouseId) },
        });

        res.code(200).send(deletedWarehouse);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Warehouse not found" });
        } else {
          console.error("Error deleting warehouse:", error);
          res
            .code(500)
            .send({ error: "An error occurred while deleting warehouse" });
        }
      }
    }
  );

  done();
});
