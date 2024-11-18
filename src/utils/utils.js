import nodemailer from "nodemailer";
import ejs from "ejs";

import { fileURLToPath } from "url";
import { dirname } from "path";
const currentFilePath = import.meta.url;
const currentDirectory = dirname(fileURLToPath(currentFilePath));

// console.log(currentDirectory);

//creating a nodemailer
const mail = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "surya.nyros@gmail.com",
    pass: "djjwjkyxtopaesmw",
  },
});

const sendEmailVerificationLink = async (email, token, name) => {
  try {
    const renderedContent = await ejs.renderFile(
      `${currentDirectory}/../templates/confirm_email.ejs`,
      { token, name }
    );

    const mailOptions = {
      from: "surya.nyros@gmail.com",
      to: email,
      subject: "Storytime - Email Confirmation",
      html: renderedContent,
    };

    const verificationInfo = await mail.sendMail(mailOptions);
    console.log("Email sent successfully");
    return verificationInfo;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { error };
  }
};

export { sendEmailVerificationLink };
