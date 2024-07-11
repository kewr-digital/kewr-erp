import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const expensesSchema = {
  description: "Expenses",
  tags: ["Expenses"],
  body: {
    type: "object",
    required: [
      "expense_id",
      "expense_name",
      "description",
      "amount",
      "expense_date",
      "category",
      "user_id",
    ],
    properties: {
      address: { type: "string" },
      credit_balance: { type: "number" },
      customer_name: { type: "string" },
      customer_type: { type: "string" },
      email: { type: "string" },
      image: { type: "string" },
      phone: { type: "string" },
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
            customer_id: { type: "number" },
            address: { type: "string" },
            credit_balance: { type: "number" },
            customer_name: { type: "string" },
            customer_type: { type: "string" },
            email: { type: "string" },
            image: { type: "string" },
            phone: { type: "string" },
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

const expensesResponseSchema = {
  description: "Expenses",
  tags: ["Expenses"],
  response: {
    200: {
      description: "Successful response",
      type: "array",
      items: {
        type: "object",
        properties: {
          customer_id: { type: "number" },
          address: { type: "string" },
          credit_balance: { type: "number" },
          customer_name: { type: "string" },
          customer_type: { type: "string" },
          email: { type: "string" },
          image: { type: "string" },
          phone: { type: "string" },
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

const deleteExpensesResponseSchema = {
  description: "Expenses deletion",
  tags: ["Expenses"],
  response: {
    200: {
      description: "Successful deletion",
      type: "object",
      properties: {
        customer_id: { type: "number" },
        address: { type: "string" },
        credit_balance: { type: "number" },
        customer_name: { type: "string" },
        customer_type: { type: "string" },
        email: { type: "string" },
        image: { type: "string" },
        phone: { type: "string" },
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
    "/expenses",
    { schema: expensesResponseSchema },
    async (req, res) => {
      try {
        const expenses = await prisma.expense.findMany();
        return res.code(200).send(expenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        return res
          .code(500)
          .send({ error: "An error occurred while fetching expenses" });
      }
    }
  );

  fastify.post("/expenses", { schema: expensesSchema }, async (req, res) => {
    const { expense_id, ...newExpense } = req.body;
    try {
      const createdExpense = await prisma.expense.create({
        data: newExpense,
      });
      return res.code(200).send(createdExpense);
    } catch (error) {
      fastify.log.error(error);
      return res
        .code(500)
        .send({ error: "An error occurred while creating expenses" });
    }
  });

  fastify.put(
    "/expenses/:expenseId",
    { schema: expensesSchema },
    async (req, res) => {
      const { expenseId } = req.params;
      const updatedExpense = req.body;

      try {
        const expense = await prisma.expense.update({
          where: { expense_id: Number(expenseId) },
          data: updatedExpense,
        });

        res.code(200).send({
          message: "Expense updated successfully",
          customer,
        });
      } catch (error) {
        console.error("Error updating expense:", error);
        res
          .code(500)
          .send({ error: "An error occurred while updating expense" });
      }
    }
  );

  fastify.delete(
    "/expenses/:expenseId",
    { schema: deleteExpensesResponseSchema },
    async (req, res) => {
      const { expenseId } = req.params;

      try {
        const deletedExpense = await prisma.expense.delete({
          where: { expense_id: Number(expenseId) },
        });

        res.code(200).send(deletedExpense);
      } catch (error) {
        if (error.code === "P2025") {
          res.code(404).send({ error: "Expense not found" });
        } else {
          console.error("Error deleting expense:", error);
          res
            .code(500)
            .send({ error: "An error occurred while deleting the expense" });
        }
      }
    }
  );

  done();
});
