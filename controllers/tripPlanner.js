const groq = require("../groqConfig.js");
const { toolDefinitions, availableFunctions } = require("../utils/tripTools.js");

// same logic as testChat, but reads from POST body instead of a URL query,
// and returns { reply } to match what chat.ejs expects
module.exports.chat = async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!req.session.tripPlannerHistory) {
      req.session.tripPlannerHistory = [
        {
          role: "system",
          content:
            "You are a travel assistant for WanderLust. You must ONLY state facts (prices, locations, availability) that come from tool results. If a tool returns no results, tell the user plainly that nothing was found — do NOT suggest specific alternative prices, nearby listings, or property types unless you called a tool that actually returned that data. You may make general, clearly-labeled suggestions without inventing specific numbers. Formatting rules: this is a small chat widget, not a document. NEVER use markdown tables.Never mention database id, Use short paragraphs and simple bullet points only. Keep answers concise — for itineraries, use a short bolded day heading followed by 3-5 brief bullets per day, not long sub-sections. Avoid repeating the same information in multiple formats.When listing multiple properties without a specific location filter, just show name and location — don't apologize for omitting price; the user can ask for price/budget filtering separately.For bookings: you MUST call proposeBooking first, then clearly show the user the price and dates, then WAIT for their explicit confirmation in a separate message (like yes, confirm, book it). Only after that explicit confirmation, call confirmBooking. NEVER call confirmBooking in the same response as proposeBooking, and never assume confirmation from ambiguous phrasing.",
        },
      ];
    }

    let messages = req.session.tripPlannerHistory;
    messages.push({ role: "user", content: userMessage });

    const maxRounds = 5;
    let finalReply = null;

    for (let round = 0; round < maxRounds; round++) {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        tools: toolDefinitions,
        tool_choice: "auto",
        temperature: round === 0 ? 0.3 : 0.7,
      });

      const responseMessage = completion.choices[0].message;

      if (!responseMessage.tool_calls) {
        finalReply = responseMessage.content;
        messages.push({ role: "assistant", content: finalReply });
        break;
      }

      // only keep the fields the API actually expects back -- avoids
      // resending any extra SDK-specific fields that might trip validation
      messages.push({
        role: "assistant",
        content: responseMessage.content || null,
        tool_calls: responseMessage.tool_calls,
      });

      for (const toolCall of responseMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);
        const result = await availableFunctions[fnName](fnArgs, req);
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (messages.length > 20) {
      req.session.tripPlannerHistory = [messages[0], ...messages.slice(-15)];
    } else {
      req.session.tripPlannerHistory = messages;
    }

    res.json({ reply: finalReply || "I wasn't able to complete that request — try rephrasing." });
  } catch (err) {
    // THIS is the important part -- log the real error server-side so we can
    // actually see what broke, and always send back valid JSON either way
    console.error("Trip planner chat error:", err);

    let userFacingMessage = "Something went wrong on my end — please try again.";
    if (err.status === 429 || err.message?.includes("rate limit")) {
      userFacingMessage = "I'm getting a lot of requests right now — please wait a few seconds and try again.";
    }

    res.status(500).json({ reply: userFacingMessage });
  }
};