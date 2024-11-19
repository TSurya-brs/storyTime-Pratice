import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmailVerificationLink } from "../utils/utils.js";
import SpotifyWebApi from "spotify-web-api-node";
import Language from "../models/languageModel.js";

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

//Verifing email--we will get the "Get" request to here
const verifyEmail = async (req, res, next) => {
  try {
    // console.log(req.params.verify_token);
    const user = await User.findOne({ verify_token: req.params.verify_token });
    if (!user) {
      return res.status(404).send("User not found so,Invalid token");
    } else if (user.verify_token_expires <= Date.now()) {
      if (!user.verified) {
        await user.deleteOne();
        return res
          .status(409)
          .send("Verification link is expired.Please register again");
      } else {
        return res.status(409).send("Please login to continue");
      }
    } else if (user.verified === true) {
      return res.status(200).json("Email already verified please login");
    } else {
      user.verified = true;
      await user.save();
      return res.status(201).json("Email verified successfully,Please login");
    }
  } catch (error) {
    return next(error);
  }
};

//Login User
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const err = new Error("Please enter both email and password");
    err.statusCode = 400;
    return next(err);
  }

  //Checking for vaild email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    const err = new Error("Invalid email");
    err.statusCode = 400;
    return next(err);
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      return next(err);
    }
    if (!user.verified) {
      const err = new Error(
        "Email verification is pending .So,please first verify your email"
      );
      err.statusCode = 409;
      return next(err);
    }
    console.log("username is correct");

    //Password Checking
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const err = new Error("Invalid password");
      err.statusCode = 401;
      return next(err);
    }
    console.log("Password is correct");

    //Token Generation
    const token = jwt.sign(
      { userId: user._id, email, password },
      process.env.JWT_SECRET,
      {
        expiresIn: 2592000,
      }
    );
    user.token = token;
    await user.save();

    //Generate spotify token

    const spotifyAPI = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const spotifyCredentials = await spotifyAPI.clientCredentialsGrant();
    //   console.log(spotifyCredentials);

    const spotifyToken = spotifyCredentials.body;
    //This is for clinet purpose
    const expiresIn = 2592000;
    console.log("Spotify api is generated");
    res.status(200).json({ token, spotifyToken, expiresIn });
  } catch (error) {
    return next(error);
  }
};

//Generating newspotify token when it was  expired
const generateSpotifyRefreshToken = async (req, res, next) => {
  try {
    const spotifyAPI = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });

    const spotifyCredentials = await spotifyAPI.clientCredentialsGrant();
    const spotifyToken = spotifyCredentials.body;

    console.log("Spotify api is re- generated");
    res.status(200).json({ spotifyToken });
  } catch (error) {
    const err = new Error("Something went wrong, please try again");
    err.statusCode = 401;
    return next(err);
  }
};

//User profile endpoint
const getUserProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  console.log("user:", user);

  if (user) {
    const profileData = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      languages: user.languages,
    };
    res.status(200).json({ profileData });
  } else {
    res.status(404);
    const err = new Error("User not found");
    err.statusCode = 404;
    return next(err);
  }
};

//Updating the user profile
const updateUserProfile = async (req, res, next) => {
  const { fist_name, last_name, email } = req.body;
  try {
    const user = await User.findById(req.user._id);
  } catch (error) {}
};

export {
  createUser,
  verifyEmail,
  loginUser,
  generateSpotifyRefreshToken,
  getUserProfile,
  updateUserProfile,
};
