import express, { Application } from "express";
import cors from "cors";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
