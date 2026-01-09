const express = require("express");
const https = require("https");
const cors = require("cors");
const app = express();

// Define specific options for clarity
const corsOptions = {
  origin: "http://localhost:3000", // Better than '*' for security
  methods: "GET,POST,OPTIONS",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204 // Some legacy browsers choke on 204
};

// Apply CORS before any routes
app.use(cors(corsOptions));

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const apiKey = process.env.photoroomkey;


function transformPrompt(prompt) {
    list = prompt.toLowerCase().trim().split(/\s+/);
    ret_str = ""
    for (let i = 0; i < list.length; i++) {
        ret_str = ret_str + list[i]
        if (i != list.length - 1) {
            ret_str = ret_str + "+"
        }
    }
    return ret_str;
}

app.get("/aibackground", (req, res) => {
  res.send("AI Background endpoint is alive!");
});

// Main POST endpoint
app.post("/aibackground", async (req, res) => {
  try {
    const { prompt, imageURL, outputSize } = req.body;

    const p = transformPrompt(prompt);
    const size = outputSize || "1024";

    const editParams =
      `background.prompt=${p}` +
      `&background.seed=977565605` +
      `&outputSize=${size}` +
      `&padding=0.1` +
      `&shadow.mode=ai.soft`;

    const options = {
      hostname: "image-api.photoroom.com",
      port: 443,
      path: `/v2/edit?${editParams}&imageUrl=${imageURL}`,
      method: "GET",
      headers: { "x-api-key": apiKey },
    };

    const apiReq = https.request(options, apiRes => {
      if (apiRes.statusCode === 200) {
        res.setHeader("Content-Type", "image/jpeg");
        apiRes.pipe(res);
      } else {
        res.status(apiRes.statusCode).json({
          error: `Request failed with status code ${apiRes.statusCode}`,
        });
      }
    });

    apiReq.on("error", err => {
      console.error(err);
      res.status(500).json({ error: "Image request failed" });
    });

    apiReq.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listen only on IPv4 localhost
const PORT = 3010;
app.listen(3010, "0.0.0.0", () => {
    console.log("Server is running on port 3010");
});
