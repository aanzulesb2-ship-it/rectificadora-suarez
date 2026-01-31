import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function generateTaskWithGemini(description) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Genera una tarea detallada para un taller de rectificación de motores basada en esta descripción: "${description}". Incluye título, descripción, prioridad, tiempo estimado y pasos necesarios. Responde en formato JSON con campos: title, description, priority (alta/media/baja), estimatedTime (en horas), steps (array de strings).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parsear JSON
    const task = JSON.parse(text);
    return task;
  } catch (error) {
    console.error('Error generando tarea con Gemini:', error);
    return null;
  }
}

export async function generateReportWithGemini(data) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analiza estos datos de un taller de rectificación y genera un reporte ejecutivo: ${JSON.stringify(data)}. Incluye resumen, insights y recomendaciones. Responde en texto natural.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Error generando reporte con Gemini:', error);
    return 'Error al generar reporte.';
  }
}
