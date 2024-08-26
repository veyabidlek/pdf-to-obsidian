import express from "express";
import cors from "cors";
import globalRouter from "./global-router";
import { logger } from "./logger";
import "dotenv/config";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("Frontend url kaida");
}

app.use(logger);
app.use(cors({ origin: `${process.env.FRONTEND_URL}` }));
app.use(express.json());
app.use("/api/", globalRouter);

const port: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
app.listen(port, () => console.log("Server is listening on port: ", port));
