const https = require('https');
const fs = require('fs');

const apiKey = 'sandbox_sk_pr_default_42675636990551b75e74717b325bf5570b16a800';
const imageURL = ''

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


function add_AI_background(backgroundPrompt) {
    const prompt = transformPrompt(backgroundPrompt)
    const editParams = `background.prompt=${prompt}&background.seed=977565605&outputSize=1000x1000&padding=0.1&shadow.mode=ai.soft`;
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

prompt = "Light wOod countertop"


//add_AI_background()

console.log(transformPrompt(prompt))