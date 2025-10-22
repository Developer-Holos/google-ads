import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const KOMMO_BASE_URL = "https://h0l0s.kommo.com/api/v4";
const KOMMO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjlhNzY1Y2E5OTM2OGJjZDk4ZjA5ZjRlM2ZkYjE3NjkxMGJkM2RlYTk1Njg3YzU5NTc5OTEwY2U3N2IwZGNlNWZiZTkzNTQzYWQ5MzUyYWY4In0.eyJhdWQiOiJiMGUzYzkzNi1lZDA3LTQ3NDAtYjNlOS0wNTNmOGIwNzViOWQiLCJqdGkiOiI5YTc2NWNhOTkzNjhiY2Q5OGYwOWY0ZTNmZGIxNzY5MTBiZDNkZWE5NTY4N2M1OTU3OTkxMGNlNzdiMGRjZTVmYmU5MzU0M2FkOTM1MmFmOCIsImlhdCI6MTc2MTE2NTMyNiwibmJmIjoxNzYxMTY1MzI2LCJleHAiOjE3OTA3MjY0MDAsInN1YiI6IjExNjIyNjM2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMyNjQwMjU1LCJiYXNlX2RvbWFpbiI6ImtvbW1vLmNvbSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMzI4NThmM2ItMGQxZC00NGYzLThmYzAtYzBkMWM3OTJhYzUzIiwidXNlcl9mbGFncyI6MSwiYXBpX2RvbWFpbiI6ImFwaS1nLmtvbW1vLmNvbSJ9.JXe3AcLdthq9TdxFv5hBNEibHj-7NlUO_fwg4_JZG9jjjqYa0Qf-SuqXDya19vhO6HnkinHlfeidGTscEM-o1lXQSloO3mrWVE40RYgcigZY1Edow3heQT1pdERm2ClpHvCQJ2ot7kZYw5MbKI0Edz3EbnYO4UowgMYriVnSPXZxi1c4b555LH_22w7Cs3_gkh761_9SR6Dso-zIoAfMdvOcgX0_59SuF0jFFqBlEX0Uik-JPyRD4xvuwEb1omMO_24sMxOf7p1xnRKCdqDqsiyBfZINCrywzwjlXlkHnEC0lnTHkEJCteh6DBXjyU7j3mmG06orVMszXqlFiYlzRg";
const FIELD_ID_GCLID = 2972781;

app.get("/api/redirect-wsp", async (req, res) => {
  const { phone, gclid, text } = req.query;
  console.log("📩 Recibido:", { phone, gclid });
  try {
    if (gclid) {
      // Buscar contacto existente
      const { data } = await axios.get(`${KOMMO_BASE_URL}/contacts?query=${phone}`, {
        headers: { Authorization: `Bearer ${KOMMO_TOKEN}` },
      });
      const existing = data?._embedded?.contacts?.[0];
      if (existing) {
        await axios.patch(`${KOMMO_BASE_URL}/contacts`, [
          {
            id: existing.id,
            custom_fields_values: [
              { field_id: FIELD_ID_GCLID, values: [{ value: gclid }] },
            ],
          },
        ], {
          headers: {
            Authorization: `Bearer ${KOMMO_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`✅ GCLID ${gclid} actualizado en contacto ${existing.id}`);
      } else {
        await axios.post(`${KOMMO_BASE_URL}/contacts`, [
          {
            name: "Contacto desde Google Ads",
            custom_fields_values: [
              { field_id: FIELD_ID_GCLID, values: [{ value: gclid }] },
            ],
            _embedded: {
              phones: [{ value: phone }],
            },
          },
        ], {
          headers: {
            Authorization: `Bearer ${KOMMO_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
        console.log(`✅ Nuevo contacto creado con GCLID ${gclid}`);
      }
    }

    // Redirigir a WhatsApp
    res.redirect(`https://wa.me/${phone}?text=${text}`);
  } catch (err) {
    console.error("❌ Error enviando GCLID a Kommo:", err.response?.data || err.message);
    res.redirect(`https://wa.me/${phone}?text=${text}`);
  }
});

app.listen(3000, () => console.log("🚀 Servidor activo en http://localhost:3000"));