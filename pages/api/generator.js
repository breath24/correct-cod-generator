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
    
    const prompt = `Generate a ${language} function implementation with the following structure:
    [DESCRIPTION]
    A brief, single-paragraph description of what the function does
    [IMPLEMENTATION]
    ${language} function ${functionName}(${paramsString}) {
        // Your implementation here
    }
    [EXAMPLE]
    // A single, clear example showing how to use the function
    
    Requirements:
    - Parameters: ${parameters}
    - Return type: ${returnType}
    - Operation: ${description}
    ${securityClause}
    
    Important: Provide only clean, executable code in the IMPLEMENTATION section without markdown formatting or code block symbols.`;
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

        // Parse the response into sections
        const sections = {
            description: '',
            implementation: '',
            example: ''
        };

        // Simple parsing logic - adjust based on actual response format
        const responseText = chatResponse.toString();
        const descriptionMatch = responseText.match(/\[DESCRIPTION\](.*?)\[IMPLEMENTATION\]/s);
        const implementationMatch = responseText.match(/\[IMPLEMENTATION\](.*?)\[EXAMPLE\]/s);
        const exampleMatch = responseText.match(/\[EXAMPLE\](.*?)$/s);

        if (descriptionMatch) sections.description = descriptionMatch[1].trim();
        if (implementationMatch) {
            // Clean the implementation to get only executable code
            let implementation = implementationMatch[1].trim();
            implementation = implementation.replace(/```[\w]*\n/g, '');
            implementation = implementation.replace(/```/g, '');
            implementation = implementation.trim();
            sections.implementation = implementation;
        }
        if (exampleMatch) sections.example = exampleMatch[1].trim();

        // Store the structured data in Supabase
        const { error } = await supabase
            .from('code_generations')
            .insert({
                language,
                function_name: functionName,
                parameters,
                return_type: returnType,
                description,
                security: Boolean(security),
                prompt,
                generated_code: sections.implementation,
                description_section: sections.description,
                example_section: sections.example,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.log("Error storing data in Supabase:", error);
        }

        // Return all sections instead of just the implementation
        res.status(200).json({
            description: sections.description,
            code: sections.implementation,
            example: sections.example
        });

    } catch (error) {
        console.log("Error in generating code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}