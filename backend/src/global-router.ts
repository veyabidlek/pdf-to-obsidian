import { Router } from "express";
import gptRouter from "./gpt/gpt-router";
import pdfRouter from "./pdf/pdf-parser";
const globalRouter = Router();

globalRouter.use(gptRouter);
globalRouter.use(pdfRouter);

export default globalRouter;
