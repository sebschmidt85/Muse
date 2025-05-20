import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY);
    const { prompt, context } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a world class assistant within a an app for taking notes. You will take what the user has already written in their note as context, and then answer the actual question keeping the context in mind. If the user's context contains a list, you will return your answer in the form of a list. If the user's context contains a table, you will answer the question using a table."
        },
        {
          role: "user",
          content: `Context: ${context}\n\nQuestion: ${prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return NextResponse.json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
} 