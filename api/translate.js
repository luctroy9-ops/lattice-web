export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, sentence } = req.body;
    
    // THIS is where your API key lives. Vercel hides this from the public.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt + "\n\nUser sentence: " + sentence }] }],
                generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
            })
        });

        if (!response.ok) throw new Error(`Google API failed: ${response.status}`);
        
        const data = await response.json();
        const aiText = data.candidates[0].content.parts[0].text;
        
        // Send the pure JSON back to the frontend
        res.status(200).json(JSON.parse(aiText));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
