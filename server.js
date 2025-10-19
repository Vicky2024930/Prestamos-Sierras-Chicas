import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

const configPath = path.join(__dirname, "config.json");

app.get("/api/config", (req, res) => {
  const data = fs.readFileSync(configPath, "utf8");
  res.json(JSON.parse(data));
});

app.post("/api/config", (req, res) => {
  fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

app.post("/login", (req, res) => {
  const { user, pass } = req.body;
  if (user === process.env.ADMIN_USER && pass === process.env.ADMIN_PASS) {
    req.session.authenticated = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, msg: "Credenciales inválidas" });
});

// ✅ CORRECCIÓN: este bloque debe estar dentro del server.js principal
app.post("/enviarCorreo", async (req, res) => {
  const { nombre, tipoCliente, monto, cuotas, frecuencia } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mensaje = `
    Nueva solicitud de préstamo recibida:

    Nombre: ${nombre}
    Tipo de cliente: ${tipoCliente}
    Monto solicitado: $${monto.toLocaleString()}
    Cuotas: ${cuotas}
    Frecuencia: ${frecuencia}
  `;

  const mailOptions = {
    from: `"Préstamos Sierras Chicas" <${process.env.EMAIL_USER}>`,
    to: "nicolascena73@gmail.com",
    subject: "Nueva simulación de préstamo",
    text: mensaje,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📨 Correo enviado correctamente a nicolascena73@gmail.com");
    res.status(200).send("Correo enviado");
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).send("Error al enviar correo");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Servidor funcionando en http://localhost:${PORT}`)
);
