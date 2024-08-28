import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const vendorSchema = {
  description: "Vendor",
  tags: ["Vendor"],
  body: {
    type: "object",
    required: [
      "vendor_id",
      "vendor_name",
      "vendor_address",
      "vendor_phone",
      "vendor_tax_number",
    ],
    properties: {
      vendor_id: { type: "string" },
      vendor_name: { type: "string" },
      vendor_address: { type: "string" },
      vendor_phone: { type: "string" },
      vendor_tax_number: { type: "string" },
    },
  },
  response: {
    200: {
      description: "Successful vendor",
      type: "object",
      properties: {
        message: { type: "string" },
        token: { type: "string" },
        user: {
          type: "object",
          properties: {
            vendor_id: { type: "string" },
            vendor_name: { type: "string" },
            vendor_address: { type: "string" },
            vendor_phone: { type: "string" },
            vendor_tax_number: { type: "string" },
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

const vendorResponseSchema = {
  description: "Vendor",
  tags: ["Vendor"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          vendor_id: { type: "string" },
          vendor_name: { type: "string" },
          vendor_address: { type: "string" },
          vendor_phone: { type: "string" },
          vendor_tax_number: { type: "string" },
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

const deleteVendorResponseSchema = {
  description: "Vendor deletion",
  tags: ["Vendor"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        id: { type: "number" },
        vendor_id: { type: "string" },
        vendor_name: { type: "string" },
        vendor_address: { type: "string" },
        vendor_phone: { type: "string" },
        vendor_tax_number: { type: "string" },
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
      description: "Vendor not found",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default fp(function (fastify, opts, done) {
  fastify.get("/vendor", { schema: vendorResponseSchema }, async (req, res) => {
    try {
      const vendors = await prisma.vendor.findMany();
      res.code(200).send(vendors);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.code(500).send({ error: "An error occurred while fetching vendor" });
    }
  });

  fastify.post("/vendor", { schema: vendorSchema }, async (req, res) => {
    const { id, ...newVendor } = req.body;

    try {
      const createdVendor = await prisma.vendor.create({
        data: newVendor,
      });

      res.code(200).send(createdVendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.code(500).send({ error: "An error occurred while creating vendor" });
    }
  });

  fastify.put(
    "/vendor/:vendorId",
    { schema: vendorSchema },
    async (req, res) => {
      const { vendorId } = req.params;
      const updatedVendor = req.body;

      try {
        const vendor = await prisma.vendor.update({
          where: { id: Number(vendorId) },
          data: updatedVendor,
        });

        res.code(200).send({
          message: "vendor updated successfully",
          vendor,
        });
      } catch (error) {
        console.error("Error updating vendor:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating vendor" });
      }
    }
  );

  fastify.delete(
    "/vendor/:vendorId",
    { schema: deleteVendorResponseSchema },
    async (req, res) => {
      const { vendorId } = req.params;

      try {
        const deletedVendor = await prisma.vendor.delete({
          where: { id: Number(vendorId) },
        });

        res.code(200).send(deletedVendor);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "vendor not found" });
        } else {
          console.error("Error deleting vendor:", error);
          res
            .code(500)
            .send({ error: "An error occurred while deleting vendor" });
        }
      }
    }
  );

  done();
});
