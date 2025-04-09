const { GoogleGenerativeAI } = require("@google/generative-ai");

// Lưu API key trong biến môi trường hoặc thay thế trực tiếp ở đây (không khuyến khích)
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("⚠️ Missing API key. Please set API_KEY as environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function testGemini() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Viết một đoạn thơ 4 câu về mùa xuân.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Kết quả từ Gemini API:");
    console.log(text);
  } catch (error) {
    console.error("❌ Lỗi khi gọi Gemini API:", error.message || error);
  }
}

testGemini();
