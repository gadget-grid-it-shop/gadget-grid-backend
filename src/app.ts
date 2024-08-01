import express, {Application} from "express";
import config from "./app/config";
import cors from "cors";
import router from "./app/routes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);

export default app;
