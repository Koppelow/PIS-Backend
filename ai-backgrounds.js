const https = require('https');
const fs = require('fs');
const apiKey = 'sandbox_sk_pr_default_42675636990551b75e74717b325bf5570b16a800';

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

// for testing purposes
function add_AI_background(backgroundPrompt, imageURL, outputSize) {
    const prompt = transformPrompt(backgroundPrompt)
    const editParams = `background.prompt=${prompt}&background.seed=977565605&outputSize=${outputSize}&padding=0.1&shadow.mode=ai.soft`;
    const options = {
    hostname: 'image-api.photoroom.com',
    port: 443,
    path: `/v2/edit?${editParams}&imageUrl=${imageURL}`,
    method: 'GET',
    headers: {
        'x-api-key': apiKey
    }
    };
    const req = https.request(options, res => {
    if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream('image.jpg');
        res.pipe(fileStream);
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
}

prompt = "snow storm";
photoURL = 'https://cdn.shopify.com/s/files/1/0647/3459/3122/files/Main_95e88b38-78df-40e6-b2a8-a8388f7d9bf0.jpg?v=1763995283';
outputSize = "1000x1000"
add_AI_background(transformPrompt(prompt), photoURL, outputSize);