import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Ensure process is running with standard port
const PORT = 3000;

// Lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ apiKey });
      } catch (error) {
        console.error("Error initializing GoogleGenAI clients:", error);
      }
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  
  // 1. Generate Intelligent AI Sales Insights on Lead
  app.post("/api/lead-insight", async (req, res) => {
    const { name, company, email, phone, status, value, source, notes } = req.body;
    
    const client = getGeminiClient();
    if (!client) {
      // High-quality mock failover so preview remains operational
      const closeProb = status === 'Won' ? 100 : status === 'Negotiation' ? 85 : status === 'Proposal' ? 65 : status === 'Qualification' ? 40 : 20;
      const responsePrompt = {
        pitch: `Hey ${name}! We noticed you came through our ${source} channel on behalf of ${company || "your group"}. Based on your dynamic CRM file, we recommend introducing our Enterprise suite. Let's schedule a deep-dive call next Tuesday to finalize this high-value ₹ ${Number(value).toLocaleString('en-IN')} deal.`,
        closeProbability: Math.min(95, Math.max(10, closeProb + Math.floor(Math.random() * 15) - 7)),
        recommendedAction: `Schedule pricing/feature demonstration walkthrough. Focus heavily on security features and automation benefits.`,
        sentiment: `High client engagement reported via ${source}. Positive signals from custom notes.`,
        isMock: true
      };
      return res.json(responsePrompt);
    }

    try {
      const prompt = `
        You are an expert CRM sales advisor. Formulate sales insights for the following lead in JSON format:
        Name: ${name}
        Company: ${company}
        Email: ${email}
        Phone: ${phone}
        Current Stage: ${status}
        Estimated Deal Value: INR ${value}
        Lead Source: ${source}
        Additional Information: ${notes || "No extra logs."}

        You must respond with ONLY a valid, parseable JSON object. Do not include markdown code block characters (\`\`\`json or \`\`\`), no extra text, no notes.
        The JSON structure MUST be:
        {
          "pitch": "A 2-3 sentence highly tailored, personalized pitch structure highlighting high-value benefits.",
          "closeProbability": number (an integer between 5 and 99 representing close probability %),
          "recommendedAction": "A specific, step-by-step next actionable step for the account manager.",
          "sentiment": "A brief analysis of the registration/source sentiment (e.g. Warm interest, discovery stage, reference search)."
        }
      `;

      const aiResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const responseText = aiResponse.text || "{}";
      // Clean possible response markdown decoration
      const cleanedJson = responseText
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();

      const parsedInsight = JSON.parse(cleanedJson);
      res.json(parsedInsight);
    } catch (error: any) {
      console.error("Gemini Insight Generation Fail:", error);
      res.status(500).json({ error: "Failed to generate AI insights.", details: error.message });
    }
  });

  // 2. Compose Targeted Client Email/SMS/WhatsApp messages with selected Tone
  app.post("/api/compose-communication", async (req, res) => {
    const { clientName, company, medium, tone, topic } = req.body;

    const client = getGeminiClient();
    if (!client) {
      // Mock fallback
      const mockCampaignDraft = `Subject: Tailored Partnership opportunities with our team

Dear ${clientName},

I hope this message finds you well. 

Referring to our discussions regarding ${topic || "enterprise CRM scaling"}, we would love to connect and share our latest specifications designed specially for ${company || "your enterprise"}. Under a ${tone} approach, our core target is saving 40% of operational overhead.

Please let us know your availability for a 10-minute briefing session tomorrow.

Best regards,
The Expert CRM Advisor Suite`;

      return res.json({ draft: mockCampaignDraft, isMock: true });
    }

    try {
      const prompt = `
        You are a persuasive corporate communicator of our CRM software company.
        Draft a personalized communication message for the following recipient:
        Recipient Name: ${clientName}
        Organization: ${company || "Self-employed"}
        Communication Channel: ${medium || "Email"} (If email, include a "Subject:" header at the very top. If SMS/WhatsApp, draft a concise, conversational text message).
        Aesthetic/Tone style: ${tone || "Professional"}
        Context/Topic: ${topic || "Discussing initial pricing proposal and software demo setup"}

        Keep the response crisp, highly relevant, and avoid generic buzzwords. Produce immediately usable body text.
      `;

      const aiResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ draft: aiResponse.text || "" });
    } catch (error: any) {
      console.error("Gemini Compose Communication Fail:", error);
      res.status(500).json({ error: "Failed to draft AI communication.", details: error.message });
    }
  });

  // 3. Solve Ticket Support Request Draft
  app.post("/api/support-assistant", async (req, res) => {
    const { clientName, category, subject, description, priority } = req.body;

    const client = getGeminiClient();
    if (!client) {
      const mockSupportRep = `Hi ${clientName},

Thank you for reaching out to Expert CRM Support regarding "${subject}" (${category}). We understand this has ${priority} priority.

Based on the ticket description ("${description}"), our engineering desk has initiated a diagnostic check on your account workspace parameters. We recommend clearing your browser cookies and logging back in if you encounter live synchronization delay.

We will keep you updated in real-time.

Warm regards,
Expert Support Desk`;
      return res.json({ response: mockSupportRep, isMock: true });
    }

    try {
      const prompt = `
        You are a Level-2 customer support champion at Expert CRM.
        Formulate a polite, helpful, and highly clear resolved/progress message based on this ticket:
        Client: ${clientName}
        Category: ${category}
        Subject: ${subject}
        Description: ${description}
        Priority Level: ${priority}

        Keep it human-like, helpful, professional, and specify 2 logical troubleshooting steps matching the category.
      `;

      const aiResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ response: aiResponse.text || "" });
    } catch (error: any) {
      console.error("Gemini Support Generation Fail:", error);
      res.status(500).json({ error: "Failed to draft support desk response.", details: error.message });
    }
  });

  // 4. Generate custom role and permissions using AI or rules
  app.post("/api/generate-role", async (req, res) => {
    const { prompt, customName } = req.body;

    const client = getGeminiClient();
    if (!client) {
      // Robust client/server rule-based engine if Gemini key is not present
      const pLower = (prompt || "").toLowerCase();
      const resolvedName = customName?.trim() || "Custom Specialist";
      const permissions = {
        viewDashboard: true, // always default to true
        manageLeads: pLower.includes("lead") || pLower.includes("sale") || pLower.includes("pipeline") || pLower.includes("market"),
        manageCalls: pLower.includes("call") || pLower.includes("dial") || pLower.includes("phone") || pLower.includes("voice") || pLower.includes("talk"),
        manageSupport: pLower.includes("support") || pLower.includes("ticket") || pLower.includes("client") || pLower.includes("customer"),
        manageStaff: pLower.includes("staff") || pLower.includes("field") || pLower.includes("dispatch") || pLower.includes("coordinate"),
        manageTasks: pLower.includes("task") || pLower.includes("project") || pLower.includes("todo") || !pLower.includes("guest"),
        manageHR: pLower.includes("hr") || pLower.includes("payroll") || pLower.includes("salary") || pLower.includes("employee") || pLower.includes("money"),
        manageComms: pLower.includes("comm") || pLower.includes("email") || pLower.includes("newsletter") || pLower.includes("message") || pLower.includes("write"),
        manageSecurity: pLower.includes("security") || pLower.includes("admin") || pLower.includes("credentials") || pLower.includes("lock") || pLower.includes("shield")
      };

      return res.json({
        roleName: resolvedName,
        permissions,
        justification: `Generated role '${resolvedName}' using keyword analysis. Matched permissions based on keyword terms in your description prompt.`,
        isMock: true
      });
    }

    try {
      const geminiPrompt = `
        You are an expert cybersecurity officer and systems administrator. 
        Your task is to generate a custom system Access Role and define its exact 9 boolean permission flags based on a user's description.
        
        The 9 permissions are:
        - viewDashboard (Access Central Dashboard view)
        - manageLeads (Modify Sales Leads & Pipeline stages)
        - manageCalls (Log Voice calls & trigger outbound dials)
        - manageSupport (Resolve client support tickets)
        - manageStaff (Dispatch Field and staff coordinators)
        - manageTasks (Add or complete tasks)
        - manageHR (Access HR metrics & disburse salaries)
        - manageComms (Compose automated newsletters with AI)
        - manageSecurity (Manage access roles & adjust credentials)

        User prompt/description of the role: "${prompt}"
        User suggested role name: "${customName || ""}"

        Respond with ONLY a valid, parseable JSON object. Do not include markdown code block characters (\`\`\`json or \`\`\`), no extra text, no notes.
        The JSON structure MUST be:
        {
          "roleName": "A concise, capitalized role title (e.g. 'Social Media Intern' or 'Billing Auditor'). If a user suggested a name, polish and use it.",
          "permissions": {
            "viewDashboard": boolean,
            "manageLeads": boolean,
            "manageCalls": boolean,
            "manageSupport": boolean,
            "manageStaff": boolean,
            "manageTasks": boolean,
            "manageHR": boolean,
            "manageComms": boolean,
            "manageSecurity": boolean
          },
          "justification": "A brief 1-2 sentence explanation of why this permission set was assigned based on cybersecurity best-practices and the user request."
        }
      `;

      const aiResponse = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: geminiPrompt,
      });

      const responseText = aiResponse.text || "{}";
      const cleanedJson = responseText
        .replace(/```json/i, "")
        .replace(/```/g, "")
        .trim();

      const parsedRole = JSON.parse(cleanedJson);
      res.json(parsedRole);
    } catch (error: any) {
      console.error("Gemini Role Generation Fail:", error);
      res.status(500).json({ error: "Failed to generate dynamic role.", details: error.message });
    }
  });

  // Vite Integration & Resource distribution
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Expert CRM Server Active at http://localhost:${PORT}`);
  });
}

startServer();
