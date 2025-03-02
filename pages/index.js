import { useState, useEffect } from "react";

export default function Home() {
  const [language, setLanguage] = useState("javascript");
  const [functionName, setFunctionName] = useState("");
  const [parameters, setParameters] = useState("");
  const [returnType, setReturnType] = useState("");
  const [description, setDescription] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [codeDescription, setCodeDescription] = useState("");
  const [codeExample, setCodeExample] = useState("");
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [syntaxChecked, setSyntaxChecked] = useState("");
  const [generateTests, setGenerateTests] = useState(false);
  const [testCases, setTestCases] = useState("");

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Initial check
      setIsMobile(window.innerWidth <= 768);

      // Add resize listener
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      window.addEventListener('resize', handleResize);
      return () =>  window.removeEventListener('resize', handleResize);
    }
  }, []);

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
          security: securityEnabled,
          generateTests
        }),
      });

      if (response.status === 500) {
        setGeneratedCode("Sorry, we are experiencing an internal problem. Please try again later.");
        setCodeDescription("");
        setCodeExample("");        // setWarningMessage("Sorry, we are experiencing a high number of requests. Please try again later.");
        setSyntaxChecked("");
        setTestCases("");
        return;
      } else if (response.status === 502) {
        setGeneratedCode("Sorry, our AI is too busy. Please try again in a few minutes.");
        setCodeDescription("");
        setCodeExample("");
        setSyntaxChecked("");
        setTestCases("");
        return;
      }

      const data = await response.json();
      setGeneratedCode(data.code);
      setCodeDescription(data.description);
      setCodeExample(data.example);
      setSyntaxChecked(data.syntax_check);
      setTestCases(data.testCases);
    } catch (error) {
      console.error('Error:', error);
      alert("An error occurred. Please try again.");
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

  const containerStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    gap: "20px"
  };

  const formStyle = {
    flex: 1,
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginRight: isMobile ? 0 : "20px",
    marginBottom: isMobile ? "20px" : 0
  };

  const codeStyle = {
    flex: isMobile ? "none" : 1,
    backgroundColor: "#2d2d2d",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: isMobile ? "100%" : "auto"
  };

  return (
    <div style={containerStyle}>
      {/* Left/Top Side: Form */}
      <div style={formStyle}>
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

        <div style={{ 
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <input
            type="checkbox"
            id="generateTests"
            checked={generateTests}
            onChange={(e) => setGenerateTests(e.target.checked)}
            style={{ 
              width: "20px",
              height: "20px",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
              backgroundColor: generateTests ? "#4CAF50" : "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              transition: "background-color 0.3s"
            }}
          />
          <label 
            htmlFor="generateTests" 
            style={{ 
              color: "#444", 
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Generate test cases
          </label>
        </div>

        <div style={{ textAlign: "center" }}>
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
      </div>

      {/* Right/Bottom Side: Generated Code */}
      <div style={codeStyle}>
        {/* <h2 style={{ color: "#fff", marginBottom: "20px" }}>Generated Result:</h2> */}
        
        {/* Description Section */}
        {codeDescription && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", marginBottom: "10px" }}>Description:</h3>
            <div style={{ 
              color: "#e6e6e6",
              backgroundColor: "#1e1e1e",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "14px"
            }}>
              {codeDescription}
            </div>
          </div>
        )}

        {/* Implementation Section */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ color: "#fff", marginBottom: "10px" }}>Implementation:</h3>
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
        </div>

        {/* Syntax Check Section */}
        {syntaxChecked && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", marginBottom: "10px" }}>Syntax Check:</h3>
            <div style={{ 
              color: "#e6e6e6",
              backgroundColor: syntaxChecked === "Passed" ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
              padding: "15px",
              borderRadius: "8px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              border: `1px solid ${syntaxChecked === "Passed" ? "#4CAF50" : "#f44336"}`
            }}>
              <span style={{ 
                color: syntaxChecked === "Passed" ? "#4CAF50" : "#f44336",
                fontSize: "18px" 
              }}>
                {syntaxChecked === "Passed" ? "✓" : "✕"}
              </span>
              {syntaxChecked}
            </div>
          </div>
        )}

        {/* Example Section */}
        {codeExample && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", marginBottom: "10px" }}>Example Usage:</h3>
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
              {codeExample}
            </pre>
          </div>
        )}

        {/* Test Cases Section */}
        {generateTests && testCases && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", marginBottom: "10px" }}>Test Cases:</h3>
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
              {testCases}
            </pre>
          </div>
        )}

        {/* Footnote */}
        <div style={{
          color: "#999",
          fontSize: "12px",
          marginTop: "20px",
          borderTop: "1px solid #444",
          paddingTop: "10px"
        }}>
          Note: Generated code may be truncated if too long. Contact us for extended size limits.
        </div>
      </div>
    </div>
  );
}