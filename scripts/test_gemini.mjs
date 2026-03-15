const apiKey = "AIzaSyCp_8cZ0fZ3xUbM3Kf-tt5hdmrTiSYaYVA";

async function testGemini() {
    console.log("Testing Gemini API...\n");
    
    const body = {
        contents: [
            { role: "user", parts: [{ text: "Hola, responde con una sola palabra: funciona" }] }
        ],
        generationConfig: { maxOutputTokens: 50 }
    };

    // Test 1: gemini-1.5-flash non-streaming (simplest)
    console.log("Test 1: gemini-1.5-flash generateContent...");
    const r1 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
    );
    console.log(`  Status: ${r1.status}`);
    const t1 = await r1.text();
    console.log(`  Response: ${t1.slice(0, 800)}\n`);

    // Test 2: list models
    console.log("Test 2: List available models...");
    const r2 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log(`  Status: ${r2.status}`);
    const t2 = await r2.json();
    const names = (t2.models || []).map((m) => m.name).slice(0, 10);
    console.log(`  Available models: ${names.join(", ")}`);
    if (t2.error) console.log(`  Error: ${JSON.stringify(t2.error)}`);
}

testGemini().catch(console.error);
