import { ReportHandler } from "web-vitals";

console.log("📊 Web Vitals module loaded");

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  console.log("📊 Initializing web vitals reporting...");
  console.log("📊 Performance entry handler:", !!onPerfEntry);

  if (onPerfEntry && onPerfEntry instanceof Function) {
    console.log("📊 Loading web vitals metrics...");
    import("web-vitals")
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        console.log("✅ Web vitals metrics loaded");
        console.log("📊 Setting up performance monitoring for:");
        console.log("   - CLS (Cumulative Layout Shift)");
        console.log("   - FID (First Input Delay)");
        console.log("   - FCP (First Contentful Paint)");
        console.log("   - LCP (Largest Contentful Paint)");
        console.log("   - TTFB (Time to First Byte)");

        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);

        console.log("✅ All web vitals metrics configured");
      })
      .catch((error) => {
        console.error("❌ Failed to load web vitals:", error);
      });
  } else {
    console.log(
      "⚠️ No performance entry handler provided, skipping web vitals setup"
    );
  }
};

console.log("✅ Web Vitals function configured");

export default reportWebVitals;
