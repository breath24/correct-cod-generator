const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const apiKey = process.env.OPENAI_API_KEY;

console.log('API Key:', apiKey); // Ensure the API key is being loaded correctly
const API_URL = 'https://api.openai.com/v1/chat/completions';

async function get_chat_response(prompt) {
    console.log('API Keyyyy:', apiKey); // Ensure the API key is being loaded correctly

    if (!apiKey) {
        console.log('OpenAI API key is not configured');
    }

    try {
        const response = await axios.post(
            API_URL,
            {
                model: "gpt-4", // Specify GPT-4
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200,
            },
            {
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        // console.log("GPT-4 Response received");
        console.log("GPT-4 Response received:", response.data.choices[0].message.content);

        return response.data.choices[0].message.content;

    } catch (error) {
        console.log("Error calling GPT-4 API:", error.response ? error.response.data : error.message);
        throw error; // Re-throw the error to be handled by the caller
    }
}

module.exports = get_chat_response; // Export the function

// get_chat_response("Hello, how are you?");