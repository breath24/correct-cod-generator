import { useState } from "react";

export default function Home() {
  const [functionName, setFunctionName] = useState("");
  const [parameters, setParameters] = useState("");
  const [returnType, setReturnType] = useState("");
  const [description, setDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");

  const handleGenerate = async () => {
    const response = await fetch("/api/generator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ functionName, parameters, returnType, description }),
    });

    console.log("functionName: ", functionName);

    const data = await response.json();
    setGeneratedCode(data.code);
  };

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      {/* Left Side: Form */}
      <div style={{ flex: 1, paddingRight: "20px" }}>
        <h1>Correct Cod Generator</h1>
        <label>Function Name:</label>
        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Enter function name"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <label>Parameters (name: type, ...):</label>
        <input
          type="text"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          placeholder="e.g. x: number, y: number"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <label>Return Type:</label>
        <input
          type="text"
          value={returnType}
          onChange={(e) => setReturnType(e.target.value)}
          placeholder="e.g. number"
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <label>Function Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the function..."
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />

        <button onClick={handleGenerate} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Generate
        </button>
      </div>

      {/* Right Side: Generated Code */}
      <div style={{ flex: 1, backgroundColor: "#f4f4f4", padding: "20px", borderRadius: "5px" }}>
        <h2>Generated Code:</h2>
        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {generatedCode || "Generated code will appear here..."}
        </pre>
      </div>
    </div>
  );
}