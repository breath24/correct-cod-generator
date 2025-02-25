// Import the get_chat_response function (assuming it's exported in a separate file)
import get_chat_response from './OpenAIChat.js';  // Adjust the path accordingly
import { supabase } from '../../lib/supabase';


export default async function handler(req, res) {
    console.log("Received a request:", req.method);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { language, functionName, parameters, returnType, description, security } = req.body;

    console.log("language: ", language);
    console.log("functionName: ", functionName);
    console.log("parameters: ", parameters);
    console.log("returnType: ", returnType);
    console.log("description: ", description);
    console.log("security: ", security);

    if (!language || !functionName || !parameters || !returnType || !description) {
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

    // Generate a prompt for the GPT model with security consideration
    const securityClause = security ? 'The code must be protected against common security vulnerabilities including but not limited to: input validation, SQL injection, XSS attacks, buffer overflows, and must follow secure coding practices. ' : '';
    
    const prompt = `Generate a ${language} function named '${functionName}' with the following parameters: ${parameters}. 
    It should return a ${returnType} and perform the following operation: ${description}. 
    ${securityClause}
    Make sure the code follows ${language} best practices and conventions. 
    Only provide the code implementation without any explanation.`;
    console.log("prompt: ", prompt);

    try {
        // Call the get_chat_response function to get the response from GPT-4
        console.log("Calling get_chat_response...");

        const chatResponse = await get_chat_response(prompt);

        if (!chatResponse) {
            console.log("Failed to get response from OpenAI API");
            return res.status(500).json({ error: "Failed to get response from OpenAI API" });
        }else{
            console.log("GPT-4 Response received:", chatResponse);
        }

        // Store the request and response in Supabase
        const { error } = await supabase
            .from('code_generations')
            .insert({
                language,
                function_name: functionName,
                parameters,
                return_type: returnType,
                description,
                security: Boolean(security), // Explicitly convert to boolean
                prompt,
                generated_code: chatResponse,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.log("Error storing data in Supabase:", error);
        }

        // Return the generated code in the response
        res.status(200).json({ code: chatResponse });

    } catch (error) {
        console.log("Error in generating code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}