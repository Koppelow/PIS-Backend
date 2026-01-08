const removeBackground = require('./remove-background');

const imagePath = './input.png';
const savePath = './response.png';

removeBackground(imagePath, savePath)
    .then(message => {
        console.log(message);
    })
    .catch(error => {
        console.error('Error:', error);
    });