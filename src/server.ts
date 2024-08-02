import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";

const main = () => {
  try {
    mongoose.connect(config.database_url as string);

    app.listen(config.port, () => {
      console.log(`IT shop server running on port ${config.port}`);
    });
  } catch (err) {
    console.log("Something went wrong", err);
  }
};

main();
