import express, {Application} from "express";
import config from "./app/config";
import cors from "cors";
import router from "./app/routes";
import {globalErrorHandler} from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
