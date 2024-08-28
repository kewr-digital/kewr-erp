import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const transactionSchema = {
  description: "Transaction",
  tags: ["Transaction"],
  body: {
    type: "object",
    required: [
      "transaction_id",
      "transaction_date",
      "order_id",
      "user_id",
      "amount",
      "transaction_type",
    ],
    properties: {
      transaction_id: { type: "string" },
      transaction_date: { type: "number" },
      order_id: { type: "number" },
      user_id: { type: "number" },
      amount: { type: "number" },
      transaction_type: { type: "string" },
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
            transaction_id: { type: "string" },
            transaction_date: { type: "number" },
            order_id: { type: "number" },
            user_id: { type: "number" },
            amount: { type: "number" },
            transaction_type: { type: "string" },
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

const transactionsResponseSchema = {
  description: "Transaction",
  tags: ["Transaction"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "number" },
          transaction_id: { type: "string" },
          transaction_date: { type: "number" },
          order_id: { type: "number" },
          user_id: { type: "number" },
          amount: { type: "number" },
          transaction_type: { type: "string" },
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

const deleteTransactionResponseSchema = {
  description: "Transaction deletion",
  tags: ["Transaction"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        transaction_id: { type: "string" },
        transaction_date: { type: "number" },
        order_id: { type: "number" },
        user_id: { type: "number" },
        amount: { type: "number" },
        transaction_type: { type: "string" },
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
      description: "transaction not found",
      type: "object",
      properties: {
        error: { type: "string" },
      },
    },
  },
};

export default fp(function (fastify, opts, done) {
  fastify.get(
    "/transactions",
    { schema: transactionsResponseSchema },
    async (req, res) => {
      try {
        const transactions = await prisma.transaction.findMany();
        return res.code(200).send(transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        return res
          .code(500)
          .send({ error: "An error occurred while fetching transactions" });
      }
    }
  );

  fastify.post(
    "/transactions",
    { schema: transactionSchema },
    async (req, res) => {
      const { id, transaction_date, ...newTransaction } = req.body;
      newTransaction.transaction_date = new Date(transaction_date);

      try {
        const createdTransaction = await prisma.transaction.create({
          data: newTransaction,
        });
        return res.code(200).send(createdTransaction);
      } catch (error) {
        fastify.log.error(error);
        return res
          .code(500)
          .send({ error: "An error occurred while creating transaction" });
      }
    }
  );

  fastify.put(
    "/transactions/:id",
    { schema: transactionSchema },
    async (req, res) => {
      const { id } = req.params;
      const { transaction_date, ...updatedTransaction } = req.body;
      updatedTransaction.transaction_date = new Date(transaction_date);

      try {
        const transaction = await prisma.transaction.update({
          where: { id: Number(id) },
          data: updatedTransaction,
        });

        res.code(200).send({
          message: "Transaction updated successfully",
          transaction,
        });
      } catch (error) {
        console.error("Error updating transaction:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating transaction" });
      }
    }
  );

  fastify.delete(
    "/transactions/:transactionId",
    { schema: deleteTransactionResponseSchema },
    async (req, res) => {
      const { transactionId } = req.params;

      try {
        const deletedTransaction = await prisma.transaction.delete({
          where: { id: Number(transactionId) },
        });

        res.code(200).send(deletedTransaction);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Transaction not found" });
        } else {
          console.error("Error deleting transaction:", error);
          res.code(500).send({
            error: "An error occurred while deleting the transaction",
          });
        }
      }
    }
  );

  done();
});
