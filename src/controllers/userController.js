import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailVerificationLink } from "../utils/utils.js";

const createUser = async (req, res, next) => {
  const { first_name, last_name, email, password } = req.body;
  // console.log(first_name, last_name, email, password);
  try {
    //Checking if any fields are empty
    if (!first_name || !last_name || !email || !password) {
      const error = new Error("Please fill in all fields");
      error.statusCode = 404;
      return next(error);
    }

    //Checking for vaild email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      const err = new Error("Invalid email");
      err.statusCode = 400;
      return next(err);
    }
    // res.send("Email is in corect format");

    //Checking if any user is already registered with the same email
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      const err = new Error("User already exists with this email");
      err.statusCode = 400;
      return next(err);
    }
    // res.send("Email is valid, No user registered with this email");

    // //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // res.send(hashedPassword);

    //Token generation
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });
    // res.send(token);

    try {
      const verificationEmailResponse = await sendEmailVerificationLink(
        email,
        token,
        first_name
      );
      if (verificationEmailResponse.error) {
        const err = new Error("Error sending verification email");
        err.statusCode = 500;
        return next(err);
      }

      // //creating a user and saving to database
      const user = await User.create({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        verify_token: token,
        verify_token_expires: Date.now() + 7200000,
      });
      // res.status(201).send("User created successfully");

      res
        .status(201)
        .send(
          "Registered successfully. Please check your mail for verification link."
        );
    } catch (error) {
      return next(error);
    }
  } catch (err) {
    return next(err);
  }
};

export { createUser };
