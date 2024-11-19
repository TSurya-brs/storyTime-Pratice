import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";

const checkToken = expressAsyncHandler(async (req, res, next) => {
  let token;
  const authorizationHeader = req.headers.authorization;

  //It is undefined by default
  //when we give key and value in the headers(postman) then we see the value in the req.headers.authorization
  //   console.log(authorizationHeader);

  if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
    token = authorizationHeader.split(" ")[1];
    console.log(token);

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decodedToken);
      req.user = await User.findById(decodedToken.userId);

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Invalid Token");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized");
  }
});

export { checkToken };
