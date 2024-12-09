import { Router } from "express";
import webpush from "../config/webpush.config.js";

const router = Router();

const subscriptions = []; // Aquí almacenaremos las suscripciones temporalmente

// Ruta para registrar una suscripción
router.post("/subscribe", (req, res) => {
  const subscription = req.body;

  if (!subscription) {
    return res.status(400).json({ error: "No se proporcionó una suscripción válida" });
  }

  subscriptions.push(subscription);
  res.status(201).json({ message: "Suscripción registrada con éxito" });
});

// Ruta para enviar notificaciones
router.post("/send-notification", async (req, res) => {
  const { title, message } = req.body;

  const payload = JSON.stringify({
    title: title || "Notificación",
    body: message || "Este es un mensaje de prueba",
  });

  try {
    for (const subscription of subscriptions) {
      await webpush.sendNotification(subscription, payload);
    }
    res.status(200).json({ message: "Notificaciones enviadas con éxito" });
  } catch (error) {
    console.error("Error al enviar notificaciones:", error);
    res.status(500).json({ error: "Error enviando notificaciones" });
  }
});

export default router;
