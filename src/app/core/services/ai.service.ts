import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { Order } from '../order.service';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  async analyzeOrders(orders: Order[]): Promise<string> {
    try {
      const prompt = `
        You are an expert business analyst. Analyze the following list of orders and provide a concise, professional summary in HTML format (using only <h3>, <p>, <ul>, and <li> tags). 
        
        Orders:
        ${JSON.stringify(orders)}

        Include:
        1. Overall business health.
        2. Status distribution summary.
        3. Top categories.
        4. Any potential issues or anomalies (e.g., too many rejected orders, specific types having delays).
        5. 3 actionable recommendations to improve efficiency.
        
        Keep it professional, data-driven, and brief.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || '<p>Analysis returned no content.</p>';
    } catch (error) {
      console.error('Gemini AI Analysis failed:', error);
      return '<p>Analysis currently unavailable. Please try again later.</p>';
    }
  }
}
