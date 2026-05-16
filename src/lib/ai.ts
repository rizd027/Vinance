import { User } from "../types";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_URL = "/api-groq/chat/completions";

export interface AITransactionResult {
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  note: string;
}

export const aiService = {
  async parseVoiceCommand(text: string): Promise<AITransactionResult | null> {
    const prompt = `Extract transaction details from this text (in Indonesian or English): "${text}". 
    Return strictly a JSON object with these fields:
    - "type": "Income" or "Expense"
    - "category": a short category name (e.g. Makanan, Transportasi, Gaji, etc.)
    - "amount": the number value only
    - "note": a short description
    
    If the text is unclear, make your best guess. Respond ONLY with the JSON.`;

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-maverick-17b-128e-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("Groq API Error:", data.error);
        return null;
      }
      const content = data.choices[0].message.content;
      console.log("AI Voice Response:", content);
      
      // Clean up potential markdown formatting in response
      const jsonStr = content.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr) as AITransactionResult;
    } catch (error) {
      console.error("AI Voice Parse Error:", error);
      return null;
    }
  },

  async scanReceipt(base64Image: string): Promise<AITransactionResult | null> {
    // Note: base64Image should include the data:image/jpeg;base64, prefix
    const prompt = `Analisis struk/receipt ini dan ekstrak detail transaksinya.
    Kembalikan dalam format JSON:
    {
      "type": "Expense",
      "category": "mencakup kategori seperti Makanan, Transportasi, Belanja, dll",
      "amount": total harga akhir (angka saja),
      "note": nama toko atau item utama
    }
    Gunakan Bahasa Indonesia untuk kategori dan note. Kembalikan HANYA JSON.`;

    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: base64Image }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 1024
        })
      });

      const data = await response.json();
      if (data.error) {
        console.error("Groq Vision API Error:", data.error);
        return null;
      }
      const content = data.choices[0].message.content;
      console.log("AI Vision Response:", content);
      
      // Clean up potential markdown formatting in response
      const jsonStr = content.replace(/```json\n?|```/g, '').trim();
      return JSON.parse(jsonStr) as AITransactionResult;
    } catch (error) {
      console.error("AI Vision Parse Error:", error);
      return null;
    }
  }
};
