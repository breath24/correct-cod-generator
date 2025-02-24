import { useState } from "react";

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [functionName, setFunctionName] = useState("");
  const [parameters, setParameters] = useState("");
  const [returnType, setReturnType] = useState("");
  const [description, setDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    // Check for empty required fields
    if (!functionName.trim()) {
      alert("Please enter a function name");
      return;
    }
    if (!parameters.trim()) {
      alert("Please specify function parameters");
      return;
    }
    if (!returnType.trim()) {
      alert("Please specify return type");
      return;
    }
    if (!description.trim()) {
      alert("Please provide a function description");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          language,
          functionName, 
          parameters, 
          returnType, 
          description,
          securityEnabled
        }),
      });

      const data = await response.json();
      setGeneratedCode(data.code);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    display: "block",
    marginBottom: "15px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "16px",
    transition: "border-color 0.3s"
  };

  return (
    <div style={{ 
      display: "flex", 
      padding: "20px", 
      minHeight: "100vh",
      backgroundColor: "#f0f2f5"
    }}>
      {/* Left Side: Form */}
      <div style={{ 
        flex: 1, 
        paddingRight: "20px",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginRight: "20px"
      }}>
        <h1 style={{ color: "#1a73e8", marginBottom: "20px" }}>Function Generator</h1>
        <p style={{ marginBottom: "25px", color: "#666", lineHeight: "1.5" }}>
          This tool helps you generate correct functions based on your specifications. 
          Simply fill in the details below including the function name, parameters, return type, and a 
          description of what the function is supposed do.
        </p>

        <label style={{ color: "#444", fontWeight: "500" }}>Programming Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            display: "block",
            marginBottom: "15px",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "16px"
          }}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>

        <label style={{ color: "#444", fontWeight: "500" }}>Function Name:</label>
        <input
          type="text"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          placeholder="Enter function name"
          style={inputStyle}
        />

        <label style={{ color: "#444", fontWeight: "500" }}>Parameters (name: type, ...):</label>
        <input
          type="text"
          value={parameters}
          onChange={(e) => setParameters(e.target.value)}
          placeholder="e.g. x: number, y: number"
          style={inputStyle}
        />

        <label style={{ color: "#444", fontWeight: "500" }}>Return Type:</label>
        <input
          type="text"
          value={returnType}
          onChange={(e) => setReturnType(e.target.value)}
          placeholder="e.g. number"
          style={inputStyle}
        />

        <label style={{ color: "#444", fontWeight: "500" }}>Function Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the function..."
          style={inputStyle}
        />

        <div style={{ 
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <input
            type="checkbox"
            id="security"
            checked={securityEnabled}
            onChange={(e) => setSecurityEnabled(e.target.checked)}
            style={{ 
              width: "20px",
              height: "20px",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              backgroundColor: securityEnabled ? "#4CAF50" : "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              transition: "background-color 0.3s"
            }}
          />
          <label 
            htmlFor="security" 
            style={{ 
              color: "#444", 
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            I want a very secure code
          </label>
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={isLoading}
          style={{
            padding: "12px 24px",
            cursor: isLoading ? "not-allowed" : "pointer",
            backgroundColor: isLoading ? "#ccc" : "#1a73e8",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            transition: "background-color 0.3s",
            position: "relative"
          }}
        >
          {isLoading ? "Generating..." : "Generate"}
          {isLoading && (
            <div style={{
              position: "absolute",
              bottom: "-20px",
              left: "0",
              width: "100%",
              height: "3px",
              backgroundColor: "#f0f0f0",
              borderRadius: "3px"
            }}>
              <div style={{
                width: "30%",
                height: "100%",
                backgroundColor: "#1a73e8",
                borderRadius: "3px",
                transition: "transform 0.3s ease-in-out",
                transform: `translateX(${Math.random() * 70}%)`
              }}/>
            </div>
          )}
        </button>
      </div>

      {/* Right Side: Generated Code */}
      <div style={{ 
        flex: 1, 
        backgroundColor: "#2d2d2d", 
        padding: "30px", 
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ color: "#fff", marginBottom: "20px" }}>Generated Code:</h2>
        <pre style={{ 
          whiteSpace: "pre-wrap", 
          wordWrap: "break-word",
          color: "#e6e6e6",
          fontSize: "14px",
          fontFamily: "monospace",
          backgroundColor: "#1e1e1e",
          padding: "20px",
          borderRadius: "8px"
        }}>
          {generatedCode || "Generated code will appear here..."}
        </pre>
        <p style={{
          color: "#888",
          fontSize: "12px",
          marginTop: "15px",
          fontStyle: "italic",
          textAlign: "center"
        }}>
          Note: Generated code may be truncated if too long. 
          <a 
            href="#" 
            style={{
              color: "#1a73e8",
              textDecoration: "none",
              marginLeft: "5px"
            }}
            onClick={(e) => {
              e.preventDefault();
              alert("This feature coming soon!");
            }}
          >
            Contact us
          </a> for extended size limits.
        </p>
      </div>
    </div>
  );
}