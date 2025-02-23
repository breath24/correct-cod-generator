/* export default function handler(req, res) {
  res.status(200).json({ message: "Welcome to Easy Info!" });
} */

export default function handler(req, res) {

  console.log("✅ Received a request:", req.method);
  
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  
    const { functionName, parameters, returnType, description } = req.body;
  
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
  
    // Generate JavaScript function
    const generatedCode = `XXX`;
  
    res.status(200).json({ code: generatedCode });
  }   