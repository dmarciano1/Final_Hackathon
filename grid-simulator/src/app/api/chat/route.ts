import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, data } = await req.json();

    // The client passes the real-time grid state in the data field
    const gridStateSummary = data?.gridStateSummary || "No grid data provided.";

    const systemPrompt = `
You are an expert AI Grid Operations Assistant overseeing a city's power grid.
The user is a trainee operator running a stress test simulation.

CURRENT REAL-TIME GRID STATE:
${gridStateSummary}

INSTRUCTIONS:
1. Act exclusively as a highly professional, technical grid operator.
2. If the user triggers an alert (SYSTEM ALERT: Node X went offline), you MUST acknowledge the failure immediately and recommend specific remediation steps. For example: "Warning: Cascade failure detected at Node X. Recommend shedding industrial load or bringing backup battery storage online immediately to stabilize the neighborhood."
3. Answer user questions concisely but with technical terminology (load shedding, demand response, spinning reserves, etc.).
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
