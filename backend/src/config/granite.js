import "dotenv/config";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const prompt = process.argv[2] || "Hello, Granite!";

(async () => {
  try {
    const output = await replicate.run(
      "ibm-granite/granite-3.3-8b-instruct",
      {
        input: {
          prompt,
          max_tokens: 512,
          temperature: 0.6
        }
      }
    );
    console.log(output.join(""));
  } catch (err) {
    console.error("Terjadi error:", err);
  }
})();
