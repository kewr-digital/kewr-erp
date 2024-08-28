import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const picSchema = {
  description: "Pics",
  tags: ["Pics"],
  body: {
    type: "object",
    required: ["pic_id", "user_id", "warehouse_id"],
    properties: {
      pic_id: { type: "string" },
      user_id: { type: "number" },
      warehouse_id: { type: "number" },
    },
  },
  response: {
    200: {
      description: "Successful product",
      type: "object",
      properties: {
        message: { type: "string" },
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            pic_id: { type: "string" },
            user_id: { type: "number" },
            warehouse_id: { type: "number" },
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

const picResponseSchema = {
  description: "Pics",
  tags: ["Pics"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          pic_id: { type: "string" },
          user_id: { type: "number" },
          warehouse_id: { type: "number" },
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

const deletePicResponseSchema = {
  description: "Pics deletion",
  tags: ["Pics"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        pic_id: { type: "string" },
        user_id: { type: "number" },
        warehouse_id: { type: "number" },
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
      description: "Pic not found",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default fp(function (fastify, opts, done) {
  fastify.get("/pics", { schema: picResponseSchema }, async (req, res) => {
    try {
      const pics = await prisma.pIC.findMany();
      res.code(200).send(pics);
    } catch (error) {
      console.error("Error fetching pics:", error);
      res.code(500).send({ error: "An error occurred while fetching pics" });
    }
  });

  fastify.post("/pics", { schema: picSchema }, async (req, res) => {
    const { id, ...newPic } = req.body;

    try {
      const createdPic = await prisma.pIC.create({
        data: newPic,
      });

      res.code(200).send(createdPic);
    } catch (error) {
      console.error("Error creating pic:", error);
      res.code(500).send({ error: "An error occurred while creating pic" });
    }
  });

  fastify.put("/pics/:picId", { schema: picSchema }, async (req, res) => {
    const { picId } = req.params;
    const updatedPic = req.body;

    try {
      const product = await prisma.pIC.update({
        where: { id: Number(picId) },
        data: updatedPic,
      });

      res.code(200).send({
        message: "pic updated successfully",
        product,
      });
    } catch (error) {
      console.error("Error updating pic:", error);
      res.code(500).send({ error: "An error occurred while updating pic" });
    }
  });

  fastify.delete(
    "/pics/:picId",
    { schema: deletePicResponseSchema },
    async (req, res) => {
      const { picId } = req.params;

      try {
        const deletedPic = await prisma.pIC.delete({
          where: { id: Number(picId) },
        });

        res.code(200).send(deletedPic);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Product not found" });
        } else {
          console.error("Error deleting pic:", error);
          res.code(500).send({ error: "An error occurred while deleting pic" });
        }
      }
    }
  );

  done();
});
