import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const KOMMO_BASE_URL = "https://h0l0s.kommo.com/api/v4";
const KOMMO_TOKEN = process.env.KOMMO_TOKEN || "TU_TOKEN_AQUI";
const FIELD_ID_GCLID = 2972781; // Campo GCLID en LEADS
const PIPELINE_ID = 11886423; // Cambia por el ID real de tu pipeline
const STATUS_ID = 91568983;  // Cambia por la etapa inicial del lead

app.get("/api/redirect-wsp", async (req, res) => {
  const { phone, gclid, text } = req.query;
  console.log("📩 Recibido:", { phone, gclid });

  try {
    // 🔹 Buscar contacto existente
    const { data } = await axios.get(`${KOMMO_BASE_URL}/contacts?query=${phone}`, {
      headers: { Authorization: `Bearer ${KOMMO_TOKEN}` },
    });
    const contact = data?._embedded?.contacts?.[0];

    // 🔹 Crear lead con GCLID
    await axios.post(
      `${KOMMO_BASE_URL}/leads`,
      [
        {
          name: "Lead desde Google Ads",
          pipeline_id: PIPELINE_ID,
          status_id: STATUS_ID,
          custom_fields_values: [
            { field_id: FIELD_ID_GCLID, values: [{ value: gclid }] },
          ],
          _embedded: {
            contacts: [
              contact
                ? { id: contact.id }
                : {
                    name: "Nuevo contacto Google Ads",
                    custom_fields_values: [
                      { field_code: "PHONE", values: [{ value: phone }] },
                    ],
                  },
            ],
          },
        },
      ],
      {
        headers: {
          Authorization: `Bearer ${KOMMO_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ Lead creado o actualizado con GCLID ${gclid}`);

    // Redirigir a WhatsApp
    res.redirect(`https://wa.me/${phone}?text=${text}`);
  } catch (err) {
    console.error("❌ Error enviando GCLID a Kommo:");
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    res.redirect(`https://wa.me/${phone}?text=${text}`);
  }
});

app.listen(3000, () => console.log("🚀 Servidor activo en http://localhost:3000"));