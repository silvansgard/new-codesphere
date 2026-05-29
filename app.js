require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

function formatPhone(phone) {
  phone = phone.replace(/\D/g, "");

  if (phone.startsWith("0")) return "254" + phone.slice(1);
  if (!phone.startsWith("254")) return "254" + phone;
  return phone;
}

app.post("/send-stk", async (req, res) => {
  const { numbers, amount } = req.body;

  if (!numbers || !amount) {
    return res.json({ success: false, message: "Missing data" });
  }

  const phones = numbers.split("\n").map(p => formatPhone(p.trim()));
  let results = [];

  for (let phone of phones) {
    try {
      const response = await axios.post(
        "https://smartcodedesigners.co.ke/api/v1/",
        { phone, amount },
        {
          headers: {
            "Content-Type": "application/json",
            "Api-secret": process.env.API_KEY
          }
        }
      );

      results.push({ phone, status: "Success", response: response.data });

    } catch (err) {
      results.push({
        phone,
        status: "Failed",
        error: err.response?.data || err.message
      });
    }
  }

  res.json({ success: true, results });
});

app.listen(PORT, () => console.log("Server running on port " + PORT));
