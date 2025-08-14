// Test SuperClaude endpoint implementation
const testEndpoint = async () => {
  const baseUrl = "http://localhost:3008";
  
  // Test GET endpoint with all features enabled
  console.log("Testing GET /api/endpoint with all features...");
  
  try {
    const response = await fetch(`${baseUrl}/api/endpoint?c7=true&seq=true&magic=true&memory=true&serena=true&persona=true`);
    const data = await response.json();
    
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("✅ Endpoint is working!");
      console.log("Enabled features:", data.features);
    } else {
      console.log("❌ Endpoint returned error:", data.error);
    }
  } catch (error) {
    console.error("❌ Failed to connect to endpoint:", error.message);
  }
};

// Run the test
testEndpoint();