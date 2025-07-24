const fs = require('fs');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('story-spark-a2jdn-739943fb5562.json', 'utf8'));

// Extract the private key
const privateKey = jsonData.private_key;

// Convert to the format needed for .env
const envKey = `"${privateKey.replace(/\n/g, '\\n')}"`;

console.log('Add this to your .env file:');
console.log('');
console.log('GOOGLE_PRIVATE_KEY=' + envKey);
console.log('');
console.log('Or if you want to copy just the key part:');
console.log('');
console.log(envKey); 