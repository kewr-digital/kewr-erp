import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import fp from "fastify-plugin";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const loginSchema = {
  description: "Login user",
  tags: ["Auth"],
  body: {
    type: "object",
    required: ["username", "password"],
    properties: {
      username: { type: "string" },
      password: { type: "string" },
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
            username: { type: "string" },
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

export default fp(function (fastify, opts, done) {
  fastify.post("/login", { schema: loginSchema }, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .code(400)
        .send({ error: "Username and password are required" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        return res.code(401).send({ error: "Invalid username or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.code(401).send({ error: "Invalid username or password" });
      }

      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
        },
        JWT_SECRET,
        { expiresIn: "12h" }
      );

      res.code(200).send({
        message: "Login successful",
        token,
        user: { username: user.username },
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.code(500).send({ error: "An error occurred while logging in" });
    }
  });

  done();
});
