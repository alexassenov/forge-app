// Client-side service that calls our backend API
// This ensures the API key remains secure on the server and works for all users.

const API_BASE = "/api/ai";

export async function generateSprintFromHighlight(highlight: string, source: string) {
  try {
    const response = await fetch(`${API_BASE}/sprint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ highlight, source }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Sprint failed:", error);
    return {
      principle: "Action over Theory",
      challenge: `Apply the core lesson from: "${highlight.substring(0, 30)}..." in one specific action today.`,
      durationDays: 3
    };
  }
}

export async function generateChallengeFromReflection(improvement: string, mistake: string) {
  try {
    const response = await fetch(`${API_BASE}/reflection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ improvement, mistake }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Reflection failed:", error);
    return {
      challenge: `Focus exclusively on ${improvement || "your core goal"} for the next 24 hours.`
    };
  }
}

export async function generateFinancialQuote(goals: string[]) {
  try {
    const response = await fetch(`${API_BASE}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Quote failed:", error);
    return {
      quote: "DISCIPLINE IS THE ONLY PATH TO FREEDOM. FORGE YOUR FUTURE."
    };
  }
}

export async function generateGatewayHabit(habit: string) {
  try {
    const response = await fetch(`${API_BASE}/gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habit }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Gateway failed:", error);
    return {
      gateway: `Start ${habit}`,
      steps: ["Initial setup", "5 minutes of effort", "Consistent practice"]
    };
  }
}

export async function parseBulkHighlights(text: string) {
  try {
    const response = await fetch(`${API_BASE}/parse-bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Parse failed:", error);
    return null;
  }
}

export async function searchBooks(query: string) {
  try {
    const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  } catch (error) {
    console.warn("Book search failed:", error);
    return [];
  }
}

export async function generateBookQuotes(books: { title: string, author: string }[]) {
  try {
    const response = await fetch(`${API_BASE}/quotes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ books }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Quotes failed:", error);
    return [];
  }
}

export async function generateBookHighlight(title: string, author: string) {
  try {
    const response = await fetch(`${API_BASE}/book-highlight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, author }),
    });
    return await response.json();
  } catch (error) {
    console.warn("AI Book Highlight failed:", error);
    return { text: "Focus on the core principle of this work.", source: `${title} by ${author}` };
  }
}
