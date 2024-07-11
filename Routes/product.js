import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const productSchema = {
  description: "Products",
  tags: ["Products"],
  body: {
    type: "object",
    required: ["product_name", "sku", "unit_price"],
    properties: {
      product_name: { type: "string" },
      sku: { type: "string" },
      unit_price: { type: "number" },
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
            product_name: { type: "string" },
            sku: { type: "string" },
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

const productResponseSchema = {
  description: "Products",
  tags: ["Products"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          product_name: { type: "string" },
          sku: { type: "string" },
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

const deleteProductResponseSchema = {
  description: "Product deletion",
  tags: ["Products"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        product_name: { type: "string" },
        sku: { type: "string" },
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
    "/products",
    { schema: productResponseSchema },
    async (req, res) => {
      try {
        const products = await prisma.product.findMany();
        res.code(200).send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res
          .code(500)
          .send({ error: "An error occurred while fetching products" });
      }
    }
  );

  fastify.post("/products", { schema: productSchema }, async (req, res) => {
    const { id, ...newProduct } = req.body;

    try {
      const createdProduct = await prisma.product.create({
        data: newProduct,
      });

      res.code(200).send(createdProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.code(500).send({ error: "An error occurred while creating product" });
    }
  });

  fastify.put(
    "/products/:productId",
    { schema: productSchema },
    async (req, res) => {
      const { productId } = req.params;
      const updatedProduct = req.body;

      try {
        const product = await prisma.product.update({
          where: { id: Number(productId) },
          data: updatedProduct,
        });

        res.code(200).send({
          message: "product updated successfully",
          product,
        });
      } catch (error) {
        console.error("Error updating product:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating product" });
      }
    }
  );

  fastify.delete(
    "/products/:productId",
    { schema: deleteProductResponseSchema },
    async (req, res) => {
      const { productId } = req.params;

      try {
        const deletedProduct = await prisma.product.delete({
          where: { id: Number(productId) },
        });

        res.code(200).send(deletedProduct);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Product not found" });
        } else {
          console.error("Error deleting product:", error);
          res
            .code(500)
            .send({ error: "An error occurred while deleting product" });
        }
      }
    }
  );

  done();
});
