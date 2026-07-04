// module.exports = async function pdfHandler(payload) {
//   await new Promise((r) => setTimeout(r, 800));

//   if (Math.random() < 0.4) {
//     throw new Error("PDF generation failed");
//   }

//   console.log("📄 PDF generated");

//   return true;
// };

//Failed version for testing DLQ

module.exports = async function pdfHandler(payload) {
  throw new Error("PDF generation failed");
};