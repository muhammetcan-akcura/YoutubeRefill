import XLSX from "xlsx"
function exportToXLSX(data) {
    // Worksheet oluştur
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Workbook oluştur
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Refill Data");
    
    // Dosyayı indir
    XLSX.writeFile(wb, "refill_data.xlsx");
}

// Kullanım
const myData = []


exportToXLSX(myData);