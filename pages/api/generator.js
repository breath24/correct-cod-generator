// Import the get_chat_response function (assuming it's exported in a separate file)
import get_chat_response from './OpenAIChat.js';  // Adjust the path accordingly

export default async function handler(req, res) {
    console.log("✅ Received a request:", req.method);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { functionName, parameters, returnType, description } = req.body;

    console.log("functionName: ", functionName);
    console.log("parameters: ", parameters);
    console.log("returnType: ", returnType);
    console.log("description: ", description);

    if (!functionName || !parameters || !returnType || !description) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Process parameters (convert from string to formatted list)
    const paramsArray = parameters
      .split(",")
      .map((param) => param.trim())
      .filter((param) => param.includes(":"))
      .map((param) => {
        const [name, type] = param.split(":").map((p) => p.trim());
        return name;
      });

    const paramsString = paramsArray.join(", ");

    // Generate a prompt for the GPT model
    const prompt = `Generate a JavaScript function named '${functionName}' with the following parameters: ${parameters}. It should return a ${returnType} and perform the following operation: ${description}.`;
    console.log("prompt: ", prompt);

    try {
        // Call the get_chat_response function to get the response from GPT-4
        console.log("Calling get_chat_response...");

        const chatResponse = await get_chat_response(prompt);

        if (!chatResponse) {
            console.log("Failed to get response from OpenAI API");
            return res.status(500).json({ error: "Failed to get response from OpenAI API" });
        }else{
            console.log("📩 GPT-4 Response received:", chatResponse);
        }

        // Return the generated code in the response
        res.status(200).json({ code: chatResponse });

    } catch (error) {
        console.log("Error in generating code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}