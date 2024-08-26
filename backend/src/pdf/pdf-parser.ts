import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import axios from "axios";
import archiver from "archiver";

const upload = multer({ dest: "uploads/" });
const pdfRouter = Router();
const BACKEND_URL = process.env.BACKEND_URL;
if (!BACKEND_URL) {
  throw new Error("Backend URL is not set in .env");
}
pdfRouter.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  console.log("File upload initiated."); // Log file upload initiation

  try {
    //@ts-ignore
    console.log("Uploaded file details:", req.file);
    //@ts-ignore
    const dataBuffer = fs.readFileSync(req.file.path);
    console.log("PDF file read successfully.");

    const data = await pdfParse(dataBuffer);
    console.log("PDF parsed successfully. Text length:", data.text.length);

    console.log("Sending parsed text to gpt endpoint...");
    const response = await axios.post(`${BACKEND_URL}/api/summarize`, {
      data: data.text,
    });
    console.log("Received response from summarization endpoint.");

    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
      console.log("Temporary directory created:", tempDir);
    }

    response.data.notes.forEach((note) => {
      const filePath = path.join(tempDir, `${note.fileName}.md`);
      fs.writeFileSync(filePath, note.content);
      console.log(`Markdown file created: ${filePath}`);
    });

    const zipFilePath = path.join(__dirname, "notes.zip");
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`Archive created: ${archive.pointer()} total bytes`);

      res.download(zipFilePath, "notes.zip", () => {
        console.log("ZIP file sent to client.");
        fs.unlinkSync(zipFilePath);
        fs.rmdirSync(tempDir, { recursive: true });
        console.log("Temporary files and directory cleaned up.");
      });
    });

    archive.pipe(output);

    fs.readdirSync(tempDir).forEach((file) => {
      const filePath = path.join(tempDir, file);
      archive.file(filePath, { name: file });
      console.log(`File added to ZIP: ${filePath}`);
    });

    archive.finalize();
    console.log("ZIP archive finalized.");
  } catch (error) {
    console.error("Error in /upload-pdf:", error);
    res.status(500).send("Error processing request");
  } finally {
    //@ts-ignore
    if (req.file && req.file.path) {
      //@ts-ignore
      fs.unlinkSync(req.file.path);
      console.log("Uploaded PDF file cleaned up.");
    }
  }
});

export default pdfRouter;
