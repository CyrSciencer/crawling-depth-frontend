import axios from "axios";

console.log("🌐 API service module loaded");

const fetchData = async () => {
  console.log("📡 Initializing data fetch operation...");

  console.log(
    "🔗 Making API request to: http://localhost:8000/api/v1/crawling-depth"
  );

  //get data
  try {
    const response = await axios.get(
      "http://localhost:8000/api/v1/crawling-depth"
    );
    console.log("✅ API request successful");
    console.log("📥 Response data:", response.data);

    // console.log(search);
  } catch (error: any) {
    console.error("❌ API request failed:", error);
    console.error("🔍 Error details:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    console.log(error.response);
  }
};

console.log("🚀 Executing fetchData function...");
fetchData();
console.log("✅ fetchData function executed");
