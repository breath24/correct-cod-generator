// Import the get_chat_response function (assuming it's exported in a separate file)
import get_chat_response from './OpenAIChat.js';  // Adjust the path accordingly
import { supabase } from '../../lib/supabase';
const { ESLint } = require("eslint");


export default async function handler(req, res) {
    console.log("Received a request:", req.method);

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { language, functionName, parameters, returnType, description, security, generateTests } = req.body;

    console.log("language: ", language);
    console.log("functionName: ", functionName);
    console.log("parameters: ", parameters);
    console.log("returnType: ", returnType);
    console.log("description: ", description);
    console.log("security: ", security);
    console.log("generateTests: ", generateTests);

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
    
    const testCaseClause = generateTests ? `
[TEST_CASES]
// Include comprehensive test cases for the function, covering:
// - Normal cases
// - Edge cases
// - Error cases
// Use appropriate testing framework syntax (Jest for JavaScript, unittest for Python)` : '';

    const prompt = `Generate a ${language} function implementation with the following structure:
    [DESCRIPTION]
    A brief, single-paragraph description of what the function does
    [IMPLEMENTATION]
    ${language} function ${functionName}(${paramsString}) {
        // Your implementation here
    }
    [EXAMPLE]
    // A single, clear example showing how to use the function
    // ${testCaseClause}
    
    Requirements:
    - Parameters: ${parameters}
    - Return type: ${returnType}
    - Operation: ${description}
    ${securityClause}
    
    Important instructions:
    1. Provide only clean, executable code in the IMPLEMENTATION section
    2. Do not include any language identifiers or prefixes (like "javascript", "python", etc.)
    3. Do not use markdown formatting or code block symbols
    4. Start the implementation directly with the function declaration${generateTests ? '\n5. Provide complete test cases using the appropriate testing framework' : ''}`;
    console.log("prompt: ", prompt);

    try {
        // Call the get_chat_response function to get the response from GPT-4
        console.log("Calling get_chat_response...");

        try {
            const chatResponse = await get_chat_response(prompt);
        
            if (!chatResponse) {
                console.log("Failed to get response from OpenAI API");
                return res.status(502).json({ 
                    error: "OpenAI service is temporarily unavailable",
                    code: "SERVICE_UNAVAILABLE"
                });
            }
            console.log("GPT-4 Response received:", chatResponse);
        } catch (error) {
            console.log("Error in generating code:", error);
            if (error.name === 'FetchError' || error.code === 'ECONNREFUSED') {
                return res.status(502).json({ 
                    error: "OpenAI service is temporarily unavailable",
                    code: "SERVICE_UNAVAILABLE"
                });
            }
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Parse the response into sections
        const sections = {
            description: '',
            implementation: '',
            example: '',
            testCases: ''
        };

        // Simple parsing logic - adjust based on actual response format
        const responseText = chatResponse.toString();
        const descriptionMatch = responseText.match(/\[DESCRIPTION\](.*?)\[IMPLEMENTATION\]/s);
        const implementationMatch = responseText.match(/\[IMPLEMENTATION\](.*?)\[EXAMPLE\]/s);
        const exampleMatch = responseText.match(/\[EXAMPLE\](.*?)\[TEST_CASES\]/s);
        const testCasesMatch = generateTests ? responseText.match(/\[TEST_CASES\](.*?)$/s) : null;

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
        if (testCasesMatch) sections.testCases = testCasesMatch[1].trim();
        
        console.log("Syntax Check:");
        let count_error_found=0;
        if (language.toLowerCase() === "javascript") {
            try {
                const eslint = new ESLint({
                    overrideConfig: {
                        rules: {
                            "semi": "error",
                            "no-undef": "error",
                            "no-unused-vars": "warn",
                            "no-unreachable": "error",
                            "quotes": ["error", "single"],
                            "no-extra-parens": "warn"
                        }
                    }
                });
                
                const results = await eslint.lintText(sections.implementation);
                if (results[0].messages.length > 0) {
                    results[0].messages.forEach(message => {
                        if (message.severity === 2)
                        {
                            count_error_found++;
                            console.log(`Error at line ${message.line}: ${message.message}`);
                        }
                    });
                } 
                if(count_error_found===0) console.log(`The code is syntactically checked and no errors found.`);
            } catch (error) {
                console.error("ESLint error:", error);
            }
        }

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
                //test_cases: sections.testCases,
                created_at: new Date().toISOString()
            });

        if (error) {
            console.log("Error storing data in Supabase:", error);
        }

        // Return all sections instead of just the implementation
        res.status(200).json({
            description: sections.description,
            code: sections.implementation,
            example: sections.example,
            syntax_check: (count_error_found==0) ? "Passed" : "Failed",
            testCases: generateTests ? sections.testCases : null
        });

    } catch (error) {
        console.log("Error in generating code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}