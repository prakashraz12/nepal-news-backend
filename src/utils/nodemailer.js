import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env",
});

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
    },
});
