import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const KOMMO_BASE_URL = "https://h0l0s.kommo.com/api/v4";
const KOMMO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlhNzY1Y2E5OTM2OGJjZDk4ZjA5ZjRlM2ZkYjE3NjkxMGJkM2RlYTk1Njg3YzU5NTc5OTEwY2U3N2IwZGNlNWZiZTkzNTQzYWQ5MzUyYWY4In0.eyJhdWQiOiJiMGUzYzkzNi1lZDA3LTQ3NDAtYjNlOS0wNTNmOGIwNzViOWQiLCJqdGkiOiI5YTc2NWNhOTkzNjhiY2Q5OGYwOWY0ZTNmZGIxNzY5MTBiZDNkZWE5NTY4N2M1OTU3OTkxMGNlNzdiMGRjZTVmYmU5MzU0M2FkOTM1MmFmOCIsImlhdCI6MTc2MTE2NTMyNiwibmJmIjoxNzYxMTY1MzI2LCJleHAiOjE3OTA3MjY0MDAsInN1YiI6IjExNjIyNjM2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyNjQwMjU1LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMzI4NThmM2ItMGQxZC00NGYzLThmYzAtYzBkMWM3OTJhYzUzIiwidXNlcl9mbGFncyI6MSwiYXBpX2RvbWFpbiI6ImFwaS1nLmtvbW1vLmNvbSJ9.JXe3AcLdthq9TdxFv5hBNEibHj-7NlUO_fwg4_JZG9jjjqYa0Qf-SuqXDya19vhO6HnkinHlfeidGTscEM-o1lXQSloO3mrWVE40RYgcigZY1Edow3heQT1pdERm2ClpHvCQJ2ot7kZYw5MbKI0Edz3EbnYO4UowgMYriVnSPXZxi1c4b555LH_22w7Cs3_gkh761_9SR6Dso-zIoAfMdvOcgX0_59SuF0jFFqBlEX0Uik-JPyRD4xvuwEb1omMO_24sMxOf7p1xnRKCdqDqsiyBfZINCrywzwjlXlkHnEC0lnTHkEJCteh6DBXjyU7j3mmG06orVMszXqlFiYlzRg";
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