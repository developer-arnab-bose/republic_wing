import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import requestIp from "request-ip";

const app = express();
dotenv.config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

const admin = "mails.republic@gmail.com";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mails.republic@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

const mail = async (to, subject, body) => {
  try {
    const info = await transporter.sendMail({
      from: "WING OF TECHNOLOGY <wing-of-technology@republicwing.com>",
      to,
      subject,
      html: body,
    });

    return [true, info];
  } catch (error) {
    return [false, error];
  }
};

const auth = (rq, rs, next) => {
  const token = rq.cookies.token;
  if (!token) {
    return rs.status(401).json({
      message: "OTP Problem"
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN); // Gtting the token from cookie and decoding it
    rq.otp = decoded;
    return next();
  } catch (error) {
    console.log(error);
    return rs.status(401).json({
      message: "Wrong OTP"
    })
  }
}

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/otpGen",
  body('email').trim().isEmail().isLength({ min: 3 }),
  async (req, res) => {
    if (!validationResult(req).isEmpty()) {
      return res.send("500");
    }

    const email = req.body.email;
    const otp = Math.floor(Math.random() * 1000000).toString().padStart("0", 6);
    const [success, data] = await mail(email, `OTP for Republic Wing - ${otp}`, `<h2>Your OTP is ${otp}</h2>`);

    if (success) {
      const token = jwt.sign({ email, otp }, process.env.JWT_TOKEN);
      res.cookie("token", token);
      res.send("200");
    } else {
      res.send("500");
    }

  }
);

app.post("/contact",
  auth,
  body('name').trim().isLength({ min: 3 }),
  body('country').trim(),
  body('phone').trim().isLength({ min: 10, max: 10 }),
  body('company').trim(),
  body('otp').trim().isLength({ max: 6, min: 6 }),
  body('service').trim(),
  body('project').trim(),
  async (req, res) => {

    if (!validationResult(req).isEmpty()) {
      return res.send("500");
    }

    const { name, country, phone, company, otp, service, project } = req.body
    const cookieOtp = req.otp.otp;

    if (cookieOtp == otp) {
      const [success, data] = await mail(admin, `Data Comming for ${req.otp.email}`, `
        <h3>Name: ${name}</h3>
        <h3>Email: ${req.otp.email}</h3>
        <h3>Mobile: ${country}${phone}</h3>
        <h3>Company: ${company}</h3>
        <h3>Access OTP: ${otp}</h3>
        <h3>Service: ${service}</h3>
        <h3>Project: ${project}</h3>
        `);
      if (success) {
        return res.send("200");
      } else {
        return res.send("500");
      }
    } else {
      return res.send("500");
    }
  }
);

app.post("/review",
  body('feedback_name').trim(),
  body('service_code').trim(),
  body('service_rating').trim().isLength({ max: 5 }),
  body('design_rating').trim().isLength({ max: 5 }),
  async (req, res) => {

    if (!validationResult(req).isEmpty()) {
      return res.send("500");
    }

    const { feedback, code, service, design } = req.body;
    const [success, data] = await mail(admin, `Reviews for Republic Wing from ${requestIp.getClientIp(req)}`, `
      <h3>FeedBack Name: ${feedback}</h3>
      <h3>Serivice Code: ${code}</h3>
      <h3>Service Rating: ${service} Star(s)</h3>
      <h3>Design Rating: ${design} Star(s)</h3>
      <h3>Access Ip: ${requestIp.getClientIp(req)}</h3>
      `);

    if (success) {
      res.send("200");
    } else {
      res.send("500");
    }

  }
);

app.get("/about", (req, res) => {
  res.render("about");
})
app.get("/privacy", (req, res) => {
  res.render("privacy");
})
app.get("/refund", (req, res) => {
  res.render("refund");
})
app.get("/ship", (req, res) => {
  res.render("ship");
})
app.get("/terms", (req, res) => {
  res.render("terms");
})

console.log(`Listening on port ${process.env.PORT}`);
app.listen(process.env.PORT);