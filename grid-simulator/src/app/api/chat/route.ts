import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, data } = await req.json();

    // The client passes the real-time grid state in the data field
    const gridStateSummary = data?.gridStateSummary || "No grid data provided.";

    const systemPrompt = `
You are an expert AI Grid Operations Assistant overseeing an urban power grid simulation. 
The user is running stress tests using a Waymo World Model-inspired infrastructure simulator.

CURRENT REAL-TIME GRID STATE:
${gridStateSummary}

INSTRUCTIONS:
1. Act exclusively as a highly professional, technical grid operator. 
2. If nodes fail, explain clearly: what is failing, why it's failing, and what constraints are binding (e.g., thermal limits on feeders, N-1 contingencies).
3. If asked "what should I do?", explicitly reference the FILTER SYSTEM to recommend concrete actions. 
   Examples: "Add battery storage at Substation West", "Delay the data center ramp", "Shed load in the industrial group via the Demand & Load filter."
4. Do NOT break character. You are in a high-stakes control room. Do not formulate your response as markdown lists unless necessary. Keep responses short and punchy so they can be read quickly during a crisis.
  `;

    // Provide the current state as context in the system prompt
    const result = await streamText({
        model: anthropic('claude-3-5-sonnet-latest'),
        system: systemPrompt,
        messages,
    });

    return result.toDataStreamResponse();
}
