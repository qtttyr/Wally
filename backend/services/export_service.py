from fpdf import FPDF
import csv
import io

class ExportService:
    def generate_pdf_report(self, expenses: list, user_name: str) -> io.BytesIO:
        pdf = FPDF()
        pdf.add_page()
        # Fallback to standard font if DejaVu doesn't exist
        try:
            pdf.add_font("DejaVu", "", "backend/utils/fonts/DejaVuSans.ttf", uni=True)
            pdf.set_font("DejaVu", size=16)
        except Exception:
            pdf.set_font("Arial", size=16) # Arial doesn't support Cyrillic well in FPDF, but good for fallback
        
        pdf.cell(200, 10, txt=f"Report: {user_name}", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", size=10) # Just using latin to avoid crash if font missing
        pdf.cell(40, 10, "Date", 1)
        pdf.cell(80, 10, "Description", 1)
        pdf.cell(40, 10, "Category", 1)
        pdf.cell(30, 10, "Amount", 1)
        pdf.ln()
        
        total = 0
        for exp in expenses:
            pdf.cell(40, 10, str(exp.get('date', '')), 1)
            pdf.cell(80, 10, str(exp.get('description', '')[:30]), 1)
            pdf.cell(40, 10, str(exp.get('category_id', '')), 1)
            pdf.cell(30, 10, f"{exp.get('amount', 0)}", 1)
            pdf.ln()
            total += exp.get('amount', 0)
            
        pdf.ln(5)
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Total: {total}", ln=True, align='R')
        
        output = io.BytesIO()
        pdf.output(output)
        output.seek(0)
        return output

    def generate_csv_report(self, expenses: list) -> str:
        output = io.StringIO()
        if not expenses:
            return ""
            
        fieldnames = ['id', 'user_id', 'amount', 'category_id', 'date', 'description', 'receipt_url', 'created_at']
        # Filter available keys
        avail_keys = list(expenses[0].keys())
        
        writer = csv.DictWriter(output, fieldnames=avail_keys)
        writer.writeheader()
        writer.writerows(expenses)
        
        return output.getvalue()

export_service = ExportService()
