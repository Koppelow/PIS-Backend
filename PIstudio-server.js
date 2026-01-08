import express from "express";
import cors from "cors";
import transformPrompt from "./ai-backgrounds"

const app = express();
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(express.json());

const apiKey = 'sandbox_sk_pr_default_42675636990551b75e74717b325bf5570b16a800';

// Image editing response
app.post("/aibackground", async (req, res) => {
    try {
        const { prompt, imageURL, outputSize } = req.body;
        const p = transformPrompt(prompt) // tokenize and normalize the prompt
        const editParams = `background.prompt=${p}&background.seed=977565605&outputSize=${outputSize}&padding=0.1&shadow.mode=ai.soft`;
        const options = {
            hostname: 'image-api.photoroom.com',
            port: 443,
            path: `/v2/edit?${editParams}&imageUrl=${imageURL}`,
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        };
        const req = https.request(options, r => {
            if (r.statusCode === 200) {
                res.json(r); // fill in response  
                const fileStream = fs.createWriteStream('image.jpg');
                r.pipe(res);
                fileStream.on('finish', () => {
                fileStream.close();
                console.log('Download completed.');
                });
            } else {
                console.log("Request failed with status code", res.statusCode);
            }
        });
        req.on('error', error => {
        console.error(error);
        });
        req.end();
              
    } catch (error) {
        if (error.response) {
            // OpenAI API error handling
            return res.status(error.response.status || 500).json({
                error: error.response.data || "An error occurred with OpenAI's API.",
            });
        }
        res.status(500).json({ error: error.message });
    }
});


// Start the server
app.listen(3010, () => {
    console.log('Server is running on port 3010');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is already in use. Please use a different port.`);
    } else {
        console.error('An error occurred:', err);
    }
});