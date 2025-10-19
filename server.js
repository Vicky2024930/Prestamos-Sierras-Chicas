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
