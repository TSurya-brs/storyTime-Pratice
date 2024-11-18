import express from "express";
import dotenv from "dotenv";

//Database connection
import connectdb from "./src/config/db.js";

// import SpotifyWebApi from "spotify-web-api-node";

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

// app.get("/spotifytoken", async (req, res) => {
//   const spotifyApi = new SpotifyWebApi({
//     clientId: "e48f95910e544c6fa757c5ec72678f57",
//     clientSecret: "3a9869b4ff394151b0d666acc58f534a",
//   });

//   const spotifyCredentials = await spotifyApi.clientCredentialsGrant();
//   console.log(spotifyCredentials);

//   const spotifytoken = spotifyCredentials.body;
//   res.status(200).send(spotifytoken);
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
