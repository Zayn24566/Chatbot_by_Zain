import Groq from 'groq-sdk';

export async function handler(event, context) {
  // Enforce POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Invalid message state.' }) 
      };
    }

    // Instantiates Groq using process.env.GROQ_API_KEY under the hood
    const groq = new Groq();

    // Context / Behavioral Persona definition
    const systemPrompt = {
      role: 'system',
      content: 'You are an elite, concise, and helpful AI programming assistant.'
    };

    // Inject history context pipeline manually
    const unifiedPayload = [systemPrompt, ...messages];

    const completion = await groq.chat.completions.create({
      messages: unifiedPayload,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const reply = completion.choices[0]?.message?.content || "No context returned.";

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (error) {
    console.error('Serverless Function Runtime Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
}