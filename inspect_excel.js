const XLSX = require("xlsx");
const wb = XLSX.readFile("refinedSample.xlsx");
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
console.log("rows", data.length);
for (let i = 0; i < Math.min(data.length, 20); i++) {
  console.log(i + 1, data[i]);
}
