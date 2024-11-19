import express from "express";
import dotenv from "dotenv";

//Database connection
import connectdb from "./src/config/db.js";

//Error Handler
import { notFound, errorHandler } from "./src/middleware/errMiddleware.js";

//Routes
import languageRoute from "./src/routes/languageRoute.js";
import categoryRoute from "./src/routes/categoryRoute.js";
import userRoute from "./src/routes/userRoute.js";

const port = 9000;
const app = express();

dotenv.config();
connectdb();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.get("/", async (req, res) => {
//   res.send("Hello World");
// });

app.get("/test", (req, res, next) => {
  const err = new Error("Something went wrong");
  return next(err);
});

//Route calling
app.use("/api/languages", languageRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/users", userRoute);

//Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`server connected to port ${port}`);
});
