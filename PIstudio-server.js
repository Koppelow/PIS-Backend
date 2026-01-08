const express = require("express");
const https = require("https");
const fs = require("fs");
const transformPrompt = require("./ai-backgrounds");


const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const apiKey = process.env.photoroomkey
// Image editing response
app.post("/aibackground", async (req, res) => {
  try {
    const { prompt, imageURL, outputSize } = req.body;

    // tokenize and normalize the prompt
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
      headers: {
        "x-api-key": apiKey,
      },
    };

    const apiReq = https.request(options, apiRes => {
      if (apiRes.statusCode === 200) {
        // Stream image directly back to frontend
        res.setHeader("Content-Type", "image/jpeg");
        apiRes.pipe(res);
      } else {
        res.status(apiRes.statusCode).json({
          error: `Request failed with status code ${apiRes.statusCode}`,
        });
      }
    });

    apiReq.on("error", error => {
      console.error(error);
      res.status(500).json({ error: "Image request failed" });
    });

    apiReq.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = 3010;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", err => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${PORT} is already in use. Please use a different port.`);
    } else {
      console.error("An error occurred:", err);
    }
  });
