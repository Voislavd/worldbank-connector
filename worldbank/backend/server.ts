import express from "express";
import cors from "cors";

const WB_BASE = "https://api.worldbank.org/v2";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/countries", async (_req, res) => {
  try {
    const response = await fetch(
      `${WB_BASE}/country?format=json&per_page=300`,
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.get("/api/indicator/:countryCode/:indicatorCode", async (req, res) => {
  try {
    const { countryCode, indicatorCode } = req.params;
    const dateParam = req.query.date ? `&date=${req.query.date}` : "";
    const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=1000${dateParam}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

const port = process.env.CANVA_BACKEND_PORT || 3001;
app.listen(port, () => {
  console.log(`World Bank proxy server running on port ${port}`);
});
