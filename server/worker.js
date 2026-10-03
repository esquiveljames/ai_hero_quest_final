/* =====================================================================
   server/worker.js  (Cloudflare Worker)
   ---------------------------------------------------------------------
   This small server sits between the booth screen and the AI.
   It keeps the API key SECRET: the key is stored in Cloudflare as an
   encrypted "secret" named ANTHROPIC_API_KEY, never in the website code.

   Routes:
     POST /hero    { choices: ["q1_help", ...] }  -> hero JSON
     POST /oracle  { question, hero }             -> { answer }
     GET  /health                                 -> "ok"

   Protections:
     - Only accepts requests from your website (ALLOWED_ORIGINS).
     - Only accepts KNOWN choice codes (nobody can use it as a free chatbot).
     - Small, fixed output limits (cheap and fast).
     - Simple per-visitor rate limit.
   ===================================================================== */

// ---------- Model settings ----------
const MODEL = "claude-haiku-4-5-20251001";   // fast, low-cost model
const HERO_MAX_TOKENS = 500;                  // the hero JSON is short
const ORACLE_MAX_TOKENS = 220;                // Oracle answers are ~60 words

// ---------- The six heroes and allowed virtues (keep in sync with config/archetypes.js) ----------
const HEROES = ["The Sage", "The Guardian", "The Vanguard", "The Paragon", "The Oathkeeper", "The Hearthbuilder"];
const VIRTUES = ["Scholarship", "Service", "Leadership", "Excellence", "Integrity", "Community", "Character", "Responsibility"];

// ---------- Choice codes -> text ----------
// GENERATED from config/questions.js by: node tools/sync-worker-choices.js
const CHOICES = {
  q1_help: "Your teammate is struggling the night before your group project is due. -> Stay and help them finish",
  q1_teach: "Your teammate is struggling the night before your group project is due. -> Teach them how to solve it",
  q1_lead: "Your teammate is struggling the night before your group project is due. -> Split the work and lead the push",
  q1_rally: "Your teammate is struggling the night before your group project is due. -> Rally the whole team together",
  q2_study: "Someone posts last year's exam answers in your class group chat. -> Leave it unopened and study",
  q2_ask: "Someone posts last year's exam answers in your class group chat. -> Ask the professor if it's allowed",
  q2_warn: "Someone posts last year's exam answers in your class group chat. -> Warn friends it could cost them",
  q2_speak: "Someone posts last year's exam answers in your class group chat. -> Speak up in the chat",
  q3_lead: "Your org needs someone to lead an event that no one wants to run. -> Volunteer to lead it",
  q3_polish: "Your org needs someone to lead an event that no one wants to run. -> Make one part of it excellent",
  q3_colead: "Your org needs someone to lead an event that no one wants to run. -> Co-lead it with a friend",
  q3_study: "Your org needs someone to lead an event that no one wants to run. -> Study how others pulled it off",
  q4_learn: "An open day lies before you. Where does your path lead? -> Deep-dive a topic I love",
  q4_serve: "An open day lies before you. Where does your path lead? -> Join a community outreach",
  q4_master: "An open day lies before you. Where does your path lead? -> Master a new skill",
  q4_build: "An open day lies before you. Where does your path lead? -> Build a project with friends",
  q5_tome: "Choose one relic to carry on your journey. -> The Ancient Tome",
  q5_shield: "Choose one relic to carry on your journey. -> The Warden's Shield",
  q5_banner: "Choose one relic to carry on your journey. -> The Banner of Dawn",
  q5_blade: "Choose one relic to carry on your journey. -> The Star-Forged Blade",
  q5_key: "Choose one relic to carry on your journey. -> The Truthkeeper's Key",
  q5_lantern: "Choose one relic to carry on your journey. -> The Hearth Lantern",
  q6_raise: "Your professor asks a hard question and the whole room goes quiet. -> Raise my hand and try",
  q6_think: "Your professor asks a hard question and the whole room goes quiet. -> Work it out, then answer",
  q6_hint: "Your professor asks a hard question and the whole room goes quiet. -> Help my seatmate figure it out",
  q6_deeper: "Your professor asks a hard question and the whole room goes quiet. -> Answer, then ask a deeper question",
  q7_return: "You find a wallet full of cash on the campus walkway. -> Return it untouched",
  q7_track: "You find a wallet full of cash on the campus walkway. -> Track down the owner myself",
  q7_post: "You find a wallet full of cash on the campus walkway. -> Post it in the campus group",
  q7_guard: "You find a wallet full of cash on the campus walkway. -> Bring it to the security office",
  q8_command: "Your team's code crashes one hour before the demo. -> Take command of the fix",
  q8_trace: "Your team's code crashes one hour before the demo. -> Trace the bug line by line",
  q8_pair: "Your team's code crashes one hour before the demo. -> Pair up and debug together",
  q8_calm: "Your team's code crashes one hour before the demo. -> Calm the team, then fix it",
  q9_walk: "A lost freshman can't find their classroom. -> Walk them there myself",
  q9_map: "A lost freshman can't find their classroom. -> Draw them a quick map",
  q9_friends: "A lost freshman can't find their classroom. -> Introduce them to my friends",
  q9_desk: "A lost freshman can't find their classroom. -> Start a freshman help desk",
  q10_record: "A groupmate presents your idea as their own. -> Calmly set the record straight",
  q10_private: "A groupmate presents your idea as their own. -> Talk to them privately",
  q10_work: "A groupmate presents your idea as their own. -> Let my next work speak",
  q10_lead: "A groupmate presents your idea as their own. -> Raise it with the team lead",
  q11_review: "It's 11 PM, the night before a major exam. -> One more careful review",
  q11_rest: "It's 11 PM, the night before a major exam. -> Rest and trust my preparation",
  q11_group: "It's 11 PM, the night before a major exam. -> Quiz my study group",
  q11_friend: "It's 11 PM, the night before a major exam. -> Help a friend who's panicking",
  q12_lead: "Your class is entering a hackathon. -> Lead the team",
  q12_polish: "Your class is entering a hackathon. -> Polish the final demo",
  q12_recruit: "Your class is entering a hackathon. -> Recruit people from other courses",
  q12_research: "Your class is entering a hackathon. -> Research what judges value",
  q13_speak: "A new class policy seems unfair to some students. -> Speak up for them respectfully",
  q13_why: "A new class policy seems unfair to some students. -> Learn why the rule exists",
  q13_gather: "A new class policy seems unfair to some students. -> Gather everyone's views",
  q13_follow: "A new class policy seems unfair to some students. -> Follow it, but raise concerns",
  q14_plan: "You have three deadlines in the same week. -> Plan every hour carefully",
  q14_honest: "You have three deadlines in the same week. -> Tell my professors honestly",
  q14_pact: "You have three deadlines in the same week. -> Form a study pact with friends",
  q14_hard: "You have three deadlines in the same week. -> Tackle the hardest one first",
  q15_ask: "A classmate never speaks up during group work. -> Ask for their ideas directly",
  q15_check: "A classmate never speaks up during group work. -> Check if they're okay",
  q15_role: "A classmate never speaks up during group work. -> Give them a key role",
  q15_talent: "A classmate never speaks up during group work. -> Find what they're good at",
  q16_tutor: "You ace an exam that most of your classmates failed. -> Offer to tutor them",
  q16_notes: "You ace an exam that most of your classmates failed. -> Share my notes with everyone",
  q16_higher: "You ace an exam that most of your classmates failed. -> Aim even higher next time",
  q16_humble: "You ace an exam that most of your classmates failed. -> Stay humble about it",
  q17_docs: "An error message appears that you've never seen before. -> Read the documentation first",
  q17_test: "An error message appears that you've never seen before. -> Experiment until it works",
  q17_forum: "An error message appears that you've never seen before. -> Ask the class forum",
  q17_guide: "An error message appears that you've never seen before. -> Write a fix guide for others",
  q18_lead: "Your org is holding a coding workshop for high school students. -> Lead the workshop",
  q18_mentor: "Your org is holding a coding workshop for high school students. -> Mentor students one-on-one",
  q18_materials: "Your org is holding a coding workshop for high school students. -> Design great materials",
  q18_organize: "Your org is holding a coding workshop for high school students. -> Organize the volunteers",
  q19_no: "A friend asks to copy your assignment. -> Kindly say no",
  q19_explain: "A friend asks to copy your assignment. -> Explain it to them instead",
  q19_start: "A friend asks to copy your assignment. -> Help them start their own",
  q19_study: "A friend asks to copy your assignment. -> Invite them to study together",
  q20_invite: "Someone eats alone in the cafeteria every day. -> Invite them to my table",
  q20_sit: "Someone eats alone in the cafeteria every day. -> Go sit with them",
  q20_meetup: "Someone eats alone in the cafeteria every day. -> Start a lunch meet-up",
  q20_common: "Someone eats alone in the cafeteria every day. -> Find a shared interest",
  q21_finish: "You discover a free online course on your dream topic. -> Finish every lesson",
  q21_cert: "You discover a free online course on your dream topic. -> Earn the certificate",
  q21_friends: "You discover a free online course on your dream topic. -> Recruit friends to join",
  q21_share: "You discover a free online course on your dream topic. -> Share it with my org",
  q22_point: "You notice a mistake on your professor's slide. -> Point it out politely",
  q22_verify: "You notice a mistake on your professor's slide. -> Double-check, then speak",
  q22_private: "You notice a mistake on your professor's slide. -> Tell them privately after class",
  q22_ask: "You notice a mistake on your professor's slide. -> Ask a question about it",
  q23_joint: "Another org wants the same event slot as yours. -> Propose a joint event",
  q23_proposal: "Another org wants the same event slot as yours. -> Make our proposal outstanding",
  q23_negotiate: "Another org wants the same event slot as yours. -> Negotiate for my team",
  q23_fair: "Another org wants the same event slot as yours. -> Compete fairly, no shortcuts",
  q24_cover: "A teammate misses a meeting because of a family emergency. -> Cover their tasks",
  q24_update: "A teammate misses a meeting because of a family emergency. -> Kindly fill them in later",
  q24_replan: "A teammate misses a meeting because of a family emergency. -> Rearrange the team plan",
  q24_credit: "A teammate misses a meeting because of a family emergency. -> Make sure they still get credit",
  q25_hard: "You can take an easy elective, or a hard one you'd learn more from. -> The hard one",
  q25_learn: "You can take an easy elective, or a hard one you'd learn more from. -> Whichever teaches me most",
  q25_friends: "You can take an easy elective, or a hard one you'd learn more from. -> The one my friends are taking",
  q25_serve: "You can take an easy elective, or a hard one you'd learn more from. -> One that helps me serve others",
  q26_tell: "You spot a classmate's password taped to a lab computer. -> Tell them to change it",
  q26_remove: "You spot a classmate's password taped to a lab computer. -> Remove it and warn them",
  q26_remind: "You spot a classmate's password taped to a lab computer. -> Remind the class about security",
  q26_teach: "You spot a classmate's password taped to a lab computer. -> Teach them a password manager",
  q27_run: "Your college needs volunteers for an exhibit booth. -> Volunteer to run it",
  q27_demo: "Your college needs volunteers for an exhibit booth. -> Build the coolest demo",
  q27_team: "Your college needs volunteers for an exhibit booth. -> Recruit a fun team",
  q27_visitor: "Your college needs volunteers for an exhibit booth. -> Welcome and guide visitors",
  q28_review: "You fail a quiz you studied hard for. -> Review every mistake",
  q28_plan: "You fail a quiz you studied hard for. -> Make a stronger study plan",
  q28_ask: "You fail a quiz you studied hard for. -> Ask how a classmate prepared",
  q28_own: "You fail a quiz you studied hard for. -> Own it, no excuses",
  q29_lead: "Your group's leader disappears days before a deadline. -> Step up and lead",
  q29_split: "Your group's leader disappears days before a deadline. -> Split the roles fairly",
  q29_extra: "Your group's leader disappears days before a deadline. -> Take on extra work",
  q29_inform: "Your group's leader disappears days before a deadline. -> Inform the professor honestly",
  q30_share: "You built a tool that would help your whole class. -> Share it free with everyone",
  q30_improve: "You built a tool that would help your whole class. -> Keep improving it",
  q30_docs: "You built a tool that would help your whole class. -> Write clear documentation",
  q30_pitch: "You built a tool that would help your whole class. -> Pitch it to the department",
  q31_perform: "Your section needs someone to represent you at a college event. -> Volunteer to go on stage",
  q31_group: "Your section needs someone to represent you at a college event. -> Organize a group act",
  q31_coach: "Your section needs someone to represent you at a college event. -> Coach whoever performs",
  q31_crew: "Your section needs someone to represent you at a college event. -> Handle backstage support",
  q32_apply: "A professor offers to mentor one student in research. -> Apply right away",
  q32_proposal: "A professor offers to mentor one student in research. -> Prepare a strong proposal",
  q32_recommend: "A professor offers to mentor one student in research. -> Recommend a friend who needs it",
  q32_commit: "A professor offers to mentor one student in research. -> Apply only if I can commit",
  q33_unite: "Your group chat is full of arguments. -> Bring everyone back together",
  q33_steps: "Your group chat is full of arguments. -> Set clear next steps",
  q33_admit: "Your group chat is full of arguments. -> Admit my part in it",
  q33_check: "Your group chat is full of arguments. -> Check on whoever got hurt",
  q34_teach: "You find a faster way to solve a common class problem. -> Teach it to my classmates",
  q34_why: "You find a faster way to solve a common class problem. -> Understand why it works",
  q34_tool: "You find a faster way to solve a common class problem. -> Turn it into a polished tool",
  q34_build: "You find a faster way to solve a common class problem. -> Build on it with a team",
  q35_learn: "A new semester begins. What is your first vow? -> To learn something deeply",
  q35_help: "A new semester begins. What is your first vow? -> To help someone every week",
  q35_lead: "A new semester begins. What is your first vow? -> To lead something new",
  q35_master: "A new semester begins. What is your first vow? -> To master one great skill"
};

// ---------- Official facts for "Ask the Oracle" (keep in sync with config/society.js) ----------
const SOCIETY_FACTS = `
Name: Angeles University Foundation (AUF) College of Computer Studies (CCS) Honor Society.
Purpose: to recognize the excellence of scholars; to serve as academic role models; to aid every student in achieving exceptional academic proficiency to meet academic standards.
Membership: enrolled AUF CCS students who meet the requirements for an academic scholarship in the university (e.g., Barbara Yap-Angeles, Agustin P. Angeles, College Scholar, University Scholar). All CCS scholars are automatically members; participation is voluntary. No monetary payment. Membership is valid for the academic year in which the scholarship was granted.
Officers: President (A.Y. 2026-2027: Abigail D. Arnold), Vice President, Secretary, Treasurer, Public Relations Officer, and four Peer Ambassadors who bridge officers and members, facilitate peer-led activities and academic support sessions, and represent fellow scholars.
Adviser: Dr. James A. Esquivel. Officers are chosen by democratic vote of members.
Meetings: held at members' convenience so as not to disrupt classes, guided by the society's Plan of Action.
Contact: talk to any officer at the exhibit booth.
`.trim();

// ---------- System prompt: hero reading ----------
const HERO_SYSTEM = `You are THE ORACLE of the Realm of Honor, a warm, wise, slightly mystical guide at a college Honor Society exhibit booth (AUF College of Computer Studies Honor Society). A visitor made 5 one-tap choices in short fantasy-flavored college scenarios. Interpret the PATTERN across all five choices, including any tension between them, and reveal their hero with the reveal_hero tool.

Rules for each field:
- hero: exactly one of ${HEROES.join(", ")}. Choose from the overall pattern, never from a single answer.
  The Sage = scholarship/curiosity. The Guardian = service/compassion. The Vanguard = leadership/courage.
  The Paragon = excellence/discipline. The Oathkeeper = integrity/honesty. The Hearthbuilder = community/collaboration.
- primaryVirtue and secondaryVirtue: from the allowed list; they must differ.
- traits: exactly 3 short positive traits, 1-2 words each.
- description: 2 sentences, second person ("You..."), referring to at least two of their specific choices in fantasy-tinged language. Max 45 words.
- prophecy: 1 poetic fantasy-style sentence. Max 25 words.
- quest: 1 concrete, doable action a college student could take this week that reflects their virtue. Max 25 words.

Boundaries:
- This is an entertaining educational experience, NOT a psychological assessment. Never diagnose or assess personality, intelligence, mental health, or any sensitive characteristic.
- Never guess age, gender, religion, ethnicity, or any personal attribute.
- Always positive and encouraging. Never shame any choice; every path is honorable.
- Do not state facts about the Honor Society.
- No offensive, discriminatory, sexual, violent, or otherwise inappropriate content.
- Do not mention or reference any existing video game, franchise, or character.`;

// ---------- System prompt: Ask the Oracle ----------
const ORACLE_SYSTEM = `You are THE ORACLE of the Realm of Honor at the AUF College of Computer Studies Honor Society exhibit booth. Answer the visitor in 2-3 short sentences (max 60 words), warm, encouraging, lightly mystical, easy for a college student to understand.

OFFICIAL FACTS (the ONLY source for anything about the Honor Society):
${SOCIETY_FACTS}

Rules:
- For any question about the Honor Society, use ONLY the official facts. If the answer is not there, say: "The ancient scrolls do not record this. Ask the guardians of this booth!" Never invent events, dates, requirements, or people.
- For general questions (studying, leadership, their hero type), give brief, practical, positive advice.
- Never diagnose or assess personality, intelligence, or mental health. No sensitive personal inferences.
- If a question is inappropriate, unsafe, or unrelated to school, heroism, or the Honor Society, gently decline in character and suggest asking about their quest instead.
- Do not reference any existing video game, franchise, or character.
- Plain text only. No lists, no markdown.`;

// ---------- The JSON shape we require (structured output via a forced tool) ----------
const HERO_TOOL = {
  name: "reveal_hero",
  description: "Reveal the visitor's hero profile.",
  input_schema: {
    type: "object",
    properties: {
      hero: { type: "string", enum: HEROES },
      primaryVirtue: { type: "string", enum: VIRTUES },
      secondaryVirtue: { type: "string", enum: VIRTUES },
      traits: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
      description: { type: "string" },
      prophecy: { type: "string" },
      quest: { type: "string" }
    },
    required: ["hero", "primaryVirtue", "secondaryVirtue", "traits", "description", "prophecy", "quest"]
  }
};

// ---------- Simple rate limit (per worker instance; good enough for a booth) ----------
const hits = new Map();   // ip -> list of request times
function rateLimited(ip, perMinute) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > perMinute;
}

// ---------- Helpers ----------
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}
function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) }
  });
}
const clip = (s, n) => String(s || "").replace(/\s+/g, " ").trim().slice(0, n);

// Call the Claude Messages API.
async function callClaude(env, body) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,          // secret, set in Cloudflare
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({ model: env.MODEL || MODEL, ...body })
  });
  if (!res.ok) throw new Error("AI error " + res.status + ": " + (await res.text()).slice(0, 200));
  return res.json();
}

// ---------- Main entry point ----------
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const okOrigin = allowed.includes(origin) ? origin : (allowed[0] || "null");

    // Browser "preflight" check
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders(okOrigin) });

    if (url.pathname === "/health") return json({ ok: true }, 200, okOrigin);

    // Only our own website may call the AI routes
    if (!allowed.includes(origin)) return json({ error: "Origin not allowed" }, 403, okOrigin);
    if (request.method !== "POST") return json({ error: "POST only" }, 405, origin);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (rateLimited(ip, Number(env.RATE_PER_MINUTE || 20))) return json({ error: "Too many requests" }, 429, origin);

    // Read a small JSON body only
    const raw = await request.text();
    if (raw.length > 2000) return json({ error: "Request too large" }, 413, origin);
    let body;
    try { body = JSON.parse(raw); } catch (e) { return json({ error: "Bad JSON" }, 400, origin); }

    try {
      /* ----- /hero : the main reading ----- */
      if (url.pathname === "/hero") {
        const choices = Array.isArray(body.choices) ? body.choices : [];
        if (choices.length < 3 || choices.length > 8 || !choices.every((c) => CHOICES[c])) {
          return json({ error: "Unknown choices" }, 400, origin);
        }
        // Each choice must come from a different scene (q7_return and q7_track can't both appear)
        const scenes = choices.map((c) => c.split("_")[0]);
        if (new Set(scenes).size !== scenes.length) return json({ error: "Repeated scene" }, 400, origin);
        const list = choices.map((c, i) => `${i + 1}. ${CHOICES[c]}`).join("\n");
        const data = await callClaude(env, {
          max_tokens: HERO_MAX_TOKENS,
          system: HERO_SYSTEM,
          tools: [HERO_TOOL],
          tool_choice: { type: "tool", name: "reveal_hero" },   // forces valid structured JSON
          messages: [{ role: "user", content: `The visitor's choices:\n${list}\n\nReveal their hero.` }]
        });
        const tool = (data.content || []).find((b) => b.type === "tool_use");
        if (!tool) throw new Error("No hero returned");
        const h = tool.input;
        return json({
          hero: HEROES.includes(h.hero) ? h.hero : "The Guardian",
          primaryVirtue: clip(h.primaryVirtue, 24),
          secondaryVirtue: clip(h.secondaryVirtue, 24),
          traits: (h.traits || []).slice(0, 3).map((t) => clip(t, 24)),
          description: clip(h.description, 420),
          prophecy: clip(h.prophecy, 220),
          quest: clip(h.quest, 220)
        }, 200, origin);
      }

      /* ----- /oracle : optional follow-up question ----- */
      if (url.pathname === "/oracle") {
        const question = clip(body.question, 160);
        if (!question) return json({ error: "Empty question" }, 400, origin);
        const hero = HEROES.includes(body.hero) ? body.hero : null;
        const data = await callClaude(env, {
          max_tokens: ORACLE_MAX_TOKENS,
          system: ORACLE_SYSTEM,
          messages: [{ role: "user", content: (hero ? `(The visitor's hero is ${hero}.)\n` : "") + `Question: ${question}` }]
        });
        const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join(" ");
        return json({ answer: clip(text, 600) }, 200, origin);
      }

      return json({ error: "Not found" }, 404, origin);
    } catch (e) {
      // The booth app will switch to its offline Oracle automatically.
      return json({ error: String(e.message || e) }, 502, origin);
    }
  }
};
