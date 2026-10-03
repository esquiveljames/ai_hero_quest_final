/* =====================================================================
   config/questions.js
   ---------------------------------------------------------------------
   The QUESTION POOL: 35 quest scenes.
   Each visitor gets 5 scenes picked at random from this pool
   (no repeats within a session). Change how many in
   config/settings.js -> quest.questionsPerSession.

   Each option has:
     id       a unique code. The AI server receives ONLY these codes.
              (server/worker.js translates them back into text, so
              keep the ids and text in both files in sync.)
     icon     an emoji shown on the rune button
     label    the button text (keep it short!)
     echo     a phrase the OFFLINE fallback uses in its reading,
              written to follow "You ...", e.g. "You stayed beside..."
     weights  points toward each virtue, used ONLY by the offline
              fallback. The online AI interprets the choices itself.

   Virtues used in weights:
     Scholarship, Service, Leadership, Excellence, Integrity, Community
   ===================================================================== */

window.HQ_QUESTIONS = [
  {
    id: "q1",
    title: "The eve of the deadline",
    text: "Your teammate is struggling the night before your group project is due.",
    options: [
      { id: "q1_help",  icon: "🛡️", label: "Stay and help them finish",
        echo: "stayed beside a struggling teammate",
        weights: { Service: 3, Community: 1 } },
      { id: "q1_teach", icon: "🧠", label: "Teach them how to solve it",
        echo: "chose to teach rather than simply rescue",
        weights: { Scholarship: 2, Service: 2 } },
      { id: "q1_lead",  icon: "⚔️", label: "Split the work and lead the push",
        echo: "took command as the deadline loomed",
        weights: { Leadership: 3, Excellence: 1 } },
      { id: "q1_rally", icon: "🤝", label: "Rally the whole team together",
        echo: "rallied your whole team as one",
        weights: { Community: 3, Leadership: 1 } }
    ]
  },
  {
    id: "q2",
    title: "The whispered scroll",
    text: "Someone posts last year's exam answers in your class group chat.",
    options: [
      { id: "q2_study", icon: "🗝️", label: "Leave it unopened and study",
        echo: "left the forbidden scroll unopened",
        weights: { Integrity: 4, Scholarship: 1 } },
      { id: "q2_ask",   icon: "📜", label: "Ask the professor if it's allowed",
        echo: "sought the truth from your professor",
        weights: { Integrity: 3, Scholarship: 1 } },
      { id: "q2_warn",  icon: "🛡️", label: "Warn friends it could cost them",
        echo: "protected your friends from a costly shortcut",
        weights: { Integrity: 2, Service: 2 } },
      { id: "q2_speak", icon: "📣", label: "Speak up in the chat",
        echo: "spoke up when others stayed silent",
        weights: { Integrity: 2, Leadership: 2 } }
    ]
  },
  {
    id: "q3",
    title: "The unclaimed banner",
    text: "Your org needs someone to lead an event that no one wants to run.",
    options: [
      { id: "q3_lead",   icon: "⚔️", label: "Volunteer to lead it",
        echo: "raised the unclaimed banner yourself",
        weights: { Leadership: 3 } },
      { id: "q3_polish", icon: "✨", label: "Make one part of it excellent",
        echo: "vowed to make your part shine",
        weights: { Excellence: 3 } },
      { id: "q3_colead", icon: "🌿", label: "Co-lead it with a friend",
        echo: "shared the burden of leadership",
        weights: { Community: 2, Leadership: 1 } },
      { id: "q3_study",  icon: "📖", label: "Study how others pulled it off",
        echo: "studied the paths of those before you",
        weights: { Scholarship: 3 } }
    ]
  },
  {
    id: "q4",
    title: "The free Saturday",
    text: "An open day lies before you. Where does your path lead?",
    options: [
      { id: "q4_learn",  icon: "📖", label: "Deep-dive a topic I love",
        echo: "spent a free day chasing knowledge",
        weights: { Scholarship: 3 } },
      { id: "q4_serve",  icon: "🛡️", label: "Join a community outreach",
        echo: "gave a free day to your community",
        weights: { Service: 3 } },
      { id: "q4_master", icon: "✨", label: "Master a new skill",
        echo: "spent a free day sharpening your craft",
        weights: { Excellence: 3 } },
      { id: "q4_build",  icon: "🌿", label: "Build a project with friends",
        echo: "spent a free day building with friends",
        weights: { Community: 3 } }
    ]
  },
  {
    id: "q5",
    title: "The relic chamber",
    text: "Choose one relic to carry on your journey.",
    options: [
      { id: "q5_tome",    icon: "📖", label: "The Ancient Tome",
        echo: "chose the Ancient Tome",        weights: { Scholarship: 2 } },
      { id: "q5_shield",  icon: "🛡️", label: "The Warden's Shield",
        echo: "chose the Warden's Shield",     weights: { Service: 2 } },
      { id: "q5_banner",  icon: "🚩", label: "The Banner of Dawn",
        echo: "chose the Banner of Dawn",      weights: { Leadership: 2 } },
      { id: "q5_blade",   icon: "🗡️", label: "The Star-Forged Blade",
        echo: "chose the Star-Forged Blade",   weights: { Excellence: 2 } },
      { id: "q5_key",     icon: "🗝️", label: "The Truthkeeper's Key",
        echo: "chose the Truthkeeper's Key",   weights: { Integrity: 2 } },
      { id: "q5_lantern", icon: "🏮", label: "The Hearth Lantern",
        echo: "chose the Hearth Lantern",      weights: { Community: 2 } }
    ]
  },
  /* ============ 30 additional scenes (q6 - q35) ============ */
  { id: "q6", title: "The silent lecture hall", text: "Your professor asks a hard question and the whole room goes quiet.",
    options: [
      { id: "q6_raise",  icon: "🙋", label: "Raise my hand and try", echo: "dared to answer when the hall fell silent", weights: { Leadership: 2, Scholarship: 1 } },
      { id: "q6_think",  icon: "🧠", label: "Work it out, then answer", echo: "worked out the answer before you spoke", weights: { Scholarship: 3 } },
      { id: "q6_hint",   icon: "🤝", label: "Help my seatmate figure it out", echo: "helped a seatmate find the answer", weights: { Service: 2, Community: 1 } },
      { id: "q6_deeper", icon: "✨", label: "Answer, then ask a deeper question", echo: "pushed past the answer to a deeper question", weights: { Excellence: 3 } } ] },
  { id: "q7", title: "The lost coin purse", text: "You find a wallet full of cash on the campus walkway.",
    options: [
      { id: "q7_return", icon: "🗝️", label: "Return it untouched", echo: "returned a lost purse untouched", weights: { Integrity: 3 } },
      { id: "q7_track",  icon: "🛡️", label: "Track down the owner myself", echo: "searched out the owner of a lost purse", weights: { Service: 2, Integrity: 1 } },
      { id: "q7_post",   icon: "📣", label: "Post it in the campus group", echo: "rallied the campus to find a purse's owner", weights: { Community: 2, Integrity: 1 } },
      { id: "q7_guard",  icon: "⚔️", label: "Bring it to the security office", echo: "carried a lost purse to the guard post", weights: { Integrity: 2, Leadership: 1 } } ] },
  { id: "q8", title: "The broken build", text: "Your team's code crashes one hour before the demo.",
    options: [
      { id: "q8_command", icon: "⚔️", label: "Take command of the fix", echo: "took command when the code crashed", weights: { Leadership: 3 } },
      { id: "q8_trace",   icon: "🧠", label: "Trace the bug line by line", echo: "traced a bug line by line", weights: { Scholarship: 2, Excellence: 1 } },
      { id: "q8_pair",    icon: "🤝", label: "Pair up and debug together", echo: "debugged side by side with your team", weights: { Community: 3 } },
      { id: "q8_calm",    icon: "🛡️", label: "Calm the team, then fix it", echo: "steadied your team before the fix", weights: { Service: 2, Leadership: 1 } } ] },
  { id: "q9", title: "The freshman's map", text: "A lost freshman can't find their classroom.",
    options: [
      { id: "q9_walk",   icon: "🛡️", label: "Walk them there myself", echo: "walked a lost freshman to class", weights: { Service: 3 } },
      { id: "q9_map",    icon: "🗺️", label: "Draw them a quick map", echo: "drew a map for a lost freshman", weights: { Service: 2, Scholarship: 1 } },
      { id: "q9_friends",icon: "🌿", label: "Introduce them to my friends", echo: "welcomed a lost freshman into your circle", weights: { Community: 3 } },
      { id: "q9_desk",   icon: "📣", label: "Start a freshman help desk", echo: "dreamed up a help desk for newcomers", weights: { Leadership: 2, Service: 1 } } ] },
  { id: "q10", title: "The credit thief", text: "A groupmate presents your idea as their own.",
    options: [
      { id: "q10_record",  icon: "🗝️", label: "Calmly set the record straight", echo: "set the record straight with calm courage", weights: { Integrity: 3 } },
      { id: "q10_private", icon: "🤝", label: "Talk to them privately", echo: "settled a stolen idea face to face", weights: { Community: 2, Integrity: 1 } },
      { id: "q10_work",    icon: "✨", label: "Let my next work speak", echo: "let your next work speak for you", weights: { Excellence: 3 } },
      { id: "q10_lead",    icon: "⚔️", label: "Raise it with the team lead", echo: "brought a stolen idea before the leader", weights: { Leadership: 2, Integrity: 1 } } ] },
  { id: "q11", title: "The midnight library", text: "It's 11 PM, the night before a major exam.",
    options: [
      { id: "q11_review", icon: "📖", label: "One more careful review", echo: "made one more careful review at midnight", weights: { Scholarship: 3 } },
      { id: "q11_rest",   icon: "🌙", label: "Rest and trust my preparation", echo: "trusted your preparation and rested", weights: { Excellence: 2, Scholarship: 1 } },
      { id: "q11_group",  icon: "🤝", label: "Quiz my study group", echo: "rallied your study group at midnight", weights: { Community: 2, Scholarship: 1 } },
      { id: "q11_friend", icon: "🛡️", label: "Help a friend who's panicking", echo: "calmed a panicking friend before the trial", weights: { Service: 3 } } ] },
  { id: "q12", title: "The tournament of ideas", text: "Your class is entering a hackathon.",
    options: [
      { id: "q12_lead",     icon: "⚔️", label: "Lead the team", echo: "led your company into the tournament", weights: { Leadership: 3 } },
      { id: "q12_polish",   icon: "✨", label: "Polish the final demo", echo: "polished the demo until it shone", weights: { Excellence: 3 } },
      { id: "q12_recruit",  icon: "🌿", label: "Recruit people from other courses", echo: "gathered allies from other courses", weights: { Community: 3 } },
      { id: "q12_research", icon: "📖", label: "Research what judges value", echo: "studied what wins before the contest", weights: { Scholarship: 3 } } ] },
  { id: "q13", title: "The unfair decree", text: "A new class policy seems unfair to some students.",
    options: [
      { id: "q13_speak",  icon: "📣", label: "Speak up for them respectfully", echo: "spoke for others with respect", weights: { Leadership: 2, Integrity: 1 } },
      { id: "q13_why",    icon: "📖", label: "Learn why the rule exists", echo: "sought the reason behind the rule", weights: { Scholarship: 2, Integrity: 1 } },
      { id: "q13_gather", icon: "🤝", label: "Gather everyone's views", echo: "gathered every voice before deciding", weights: { Community: 3 } },
      { id: "q13_follow", icon: "🗝️", label: "Follow it, but raise concerns", echo: "kept the rule while raising your concern", weights: { Integrity: 3 } } ] },
  { id: "q14", title: "The overflowing quest log", text: "You have three deadlines in the same week.",
    options: [
      { id: "q14_plan",   icon: "✨", label: "Plan every hour carefully", echo: "charted every hour of a crowded week", weights: { Excellence: 3 } },
      { id: "q14_honest", icon: "🗝️", label: "Tell my professors honestly", echo: "spoke honestly about a heavy load", weights: { Integrity: 3 } },
      { id: "q14_pact",   icon: "🤝", label: "Form a study pact with friends", echo: "forged a study pact with friends", weights: { Community: 3 } },
      { id: "q14_hard",   icon: "⚔️", label: "Tackle the hardest one first", echo: "faced the hardest task first", weights: { Leadership: 2, Excellence: 1 } } ] },
  { id: "q15", title: "The quiet companion", text: "A classmate never speaks up during group work.",
    options: [
      { id: "q15_ask",    icon: "🌿", label: "Ask for their ideas directly", echo: "invited a quiet voice into the circle", weights: { Community: 3 } },
      { id: "q15_check",  icon: "🛡️", label: "Check if they're okay", echo: "checked on a quiet classmate", weights: { Service: 3 } },
      { id: "q15_role",   icon: "⚔️", label: "Give them a key role", echo: "trusted a quiet classmate with a key role", weights: { Leadership: 3 } },
      { id: "q15_talent", icon: "🧠", label: "Find what they're good at", echo: "discovered a quiet classmate's hidden talent", weights: { Scholarship: 2, Community: 1 } } ] },
  { id: "q16", title: "The perfect score", text: "You ace an exam that most of your classmates failed.",
    options: [
      { id: "q16_tutor",  icon: "🛡️", label: "Offer to tutor them", echo: "offered your victory to those who stumbled", weights: { Service: 3 } },
      { id: "q16_notes",  icon: "📖", label: "Share my notes with everyone", echo: "shared your notes with all", weights: { Community: 2, Scholarship: 1 } },
      { id: "q16_higher", icon: "✨", label: "Aim even higher next time", echo: "aimed even higher after triumph", weights: { Excellence: 3 } },
      { id: "q16_humble", icon: "🗝️", label: "Stay humble about it", echo: "stayed humble in victory", weights: { Integrity: 2, Service: 1 } } ] },
  { id: "q17", title: "The mysterious error", text: "An error message appears that you've never seen before.",
    options: [
      { id: "q17_docs",  icon: "📖", label: "Read the documentation first", echo: "consulted the ancient documentation", weights: { Scholarship: 3 } },
      { id: "q17_test",  icon: "✨", label: "Experiment until it works", echo: "experimented until the error yielded", weights: { Excellence: 2, Scholarship: 1 } },
      { id: "q17_forum", icon: "🤝", label: "Ask the class forum", echo: "called upon the class forum", weights: { Community: 3 } },
      { id: "q17_guide", icon: "🛡️", label: "Write a fix guide for others", echo: "wrote a guide so others won't be lost", weights: { Service: 3 } } ] },
  { id: "q18", title: "The village outreach", text: "Your org is holding a coding workshop for high school students.",
    options: [
      { id: "q18_lead",      icon: "⚔️", label: "Lead the workshop", echo: "led a workshop for young learners", weights: { Leadership: 3 } },
      { id: "q18_mentor",    icon: "🛡️", label: "Mentor students one-on-one", echo: "mentored young learners one by one", weights: { Service: 3 } },
      { id: "q18_materials", icon: "✨", label: "Design great materials", echo: "crafted materials worthy of the realm", weights: { Excellence: 3 } },
      { id: "q18_organize",  icon: "🌿", label: "Organize the volunteers", echo: "organized a band of volunteers", weights: { Community: 3 } } ] },
  { id: "q19", title: "The borrowed answers", text: "A friend asks to copy your assignment.",
    options: [
      { id: "q19_no",      icon: "🗝️", label: "Kindly say no", echo: "kindly refused to share your answers", weights: { Integrity: 3 } },
      { id: "q19_explain", icon: "🧠", label: "Explain it to them instead", echo: "offered understanding instead of answers", weights: { Scholarship: 2, Service: 1 } },
      { id: "q19_start",   icon: "🛡️", label: "Help them start their own", echo: "helped a friend begin their own work", weights: { Service: 2, Integrity: 1 } },
      { id: "q19_study",   icon: "🤝", label: "Invite them to study together", echo: "turned a request to copy into a study session", weights: { Community: 2, Integrity: 1 } } ] },
  { id: "q20", title: "The empty seat at the feast", text: "Someone eats alone in the cafeteria every day.",
    options: [
      { id: "q20_invite", icon: "🌿", label: "Invite them to my table", echo: "invited a lonely traveler to your table", weights: { Community: 3 } },
      { id: "q20_sit",    icon: "🛡️", label: "Go sit with them", echo: "sat beside someone dining alone", weights: { Service: 3 } },
      { id: "q20_meetup", icon: "⚔️", label: "Start a lunch meet-up", echo: "started a gathering so no one eats alone", weights: { Leadership: 3 } },
      { id: "q20_common", icon: "🧠", label: "Find a shared interest", echo: "sought common ground with a stranger", weights: { Community: 2, Scholarship: 1 } } ] },
  { id: "q21", title: "The ancient archive", text: "You discover a free online course on your dream topic.",
    options: [
      { id: "q21_finish",  icon: "📖", label: "Finish every lesson", echo: "finished every lesson of the archive", weights: { Scholarship: 3 } },
      { id: "q21_cert",    icon: "✨", label: "Earn the certificate", echo: "earned the archive's seal", weights: { Excellence: 3 } },
      { id: "q21_friends", icon: "🌿", label: "Recruit friends to join", echo: "brought friends into the archive", weights: { Community: 3 } },
      { id: "q21_share",   icon: "🛡️", label: "Share it with my org", echo: "shared the archive's treasure with your org", weights: { Service: 2, Community: 1 } } ] },
  { id: "q22", title: "The cracked inscription", text: "You notice a mistake on your professor's slide.",
    options: [
      { id: "q22_point",   icon: "🗝️", label: "Point it out politely", echo: "pointed out an error with grace", weights: { Integrity: 3 } },
      { id: "q22_verify",  icon: "📖", label: "Double-check, then speak", echo: "verified the truth before speaking", weights: { Scholarship: 3 } },
      { id: "q22_private", icon: "🤫", label: "Tell them privately after class", echo: "offered a private word after class", weights: { Integrity: 2, Service: 1 } },
      { id: "q22_ask",     icon: "🙋", label: "Ask a question about it", echo: "raised a careful question before all", weights: { Leadership: 2, Scholarship: 1 } } ] },
  { id: "q23", title: "The rival guild", text: "Another org wants the same event slot as yours.",
    options: [
      { id: "q23_joint",     icon: "🤝", label: "Propose a joint event", echo: "turned a rival guild into allies", weights: { Community: 3 } },
      { id: "q23_proposal",  icon: "✨", label: "Make our proposal outstanding", echo: "made your proposal outshine the rest", weights: { Excellence: 3 } },
      { id: "q23_negotiate", icon: "⚔️", label: "Negotiate for my team", echo: "negotiated boldly for your guild", weights: { Leadership: 3 } },
      { id: "q23_fair",      icon: "🗝️", label: "Compete fairly, no shortcuts", echo: "competed without a single shortcut", weights: { Integrity: 3 } } ] },
  { id: "q24", title: "The absent companion", text: "A teammate misses a meeting because of a family emergency.",
    options: [
      { id: "q24_cover",   icon: "🛡️", label: "Cover their tasks", echo: "shouldered a teammate's burden", weights: { Service: 3 } },
      { id: "q24_update",  icon: "🤝", label: "Kindly fill them in later", echo: "kept an absent teammate in the loop", weights: { Community: 2, Service: 1 } },
      { id: "q24_replan",  icon: "⚔️", label: "Rearrange the team plan", echo: "redrew the battle plan for your team", weights: { Leadership: 3 } },
      { id: "q24_credit",  icon: "🗝️", label: "Make sure they still get credit", echo: "guarded an absent teammate's credit", weights: { Integrity: 3 } } ] },
  { id: "q25", title: "The scholar's crossroads", text: "You can take an easy elective, or a hard one you'd learn more from.",
    options: [
      { id: "q25_hard",    icon: "✨", label: "The hard one", echo: "chose the harder road to grow", weights: { Excellence: 3 } },
      { id: "q25_learn",   icon: "📖", label: "Whichever teaches me most", echo: "chose the path of deepest learning", weights: { Scholarship: 3 } },
      { id: "q25_friends", icon: "🌿", label: "The one my friends are taking", echo: "chose to walk the road with friends", weights: { Community: 3 } },
      { id: "q25_serve",   icon: "🛡️", label: "One that helps me serve others", echo: "chose learning that serves others", weights: { Service: 3 } } ] },
  { id: "q26", title: "The exposed rune", text: "You spot a classmate's password taped to a lab computer.",
    options: [
      { id: "q26_tell",   icon: "🗝️", label: "Tell them to change it", echo: "warned a classmate of an exposed secret", weights: { Integrity: 2, Service: 1 } },
      { id: "q26_remove", icon: "🛡️", label: "Remove it and warn them", echo: "guarded a classmate's secret", weights: { Service: 3 } },
      { id: "q26_remind", icon: "📣", label: "Remind the class about security", echo: "reminded the whole class to guard their secrets", weights: { Leadership: 2, Community: 1 } },
      { id: "q26_teach",  icon: "📖", label: "Teach them a password manager", echo: "taught the craft of guarding secrets", weights: { Scholarship: 3 } } ] },
  { id: "q27", title: "The festival of honor", text: "Your college needs volunteers for an exhibit booth.",
    options: [
      { id: "q27_run",     icon: "⚔️", label: "Volunteer to run it", echo: "took charge of the festival booth", weights: { Leadership: 3 } },
      { id: "q27_demo",    icon: "✨", label: "Build the coolest demo", echo: "built the most dazzling demo at the festival", weights: { Excellence: 3 } },
      { id: "q27_team",    icon: "🌿", label: "Recruit a fun team", echo: "assembled a joyful festival crew", weights: { Community: 3 } },
      { id: "q27_visitor", icon: "🛡️", label: "Welcome and guide visitors", echo: "welcomed every traveler at the festival", weights: { Service: 3 } } ] },
  { id: "q28", title: "The lost battle", text: "You fail a quiz you studied hard for.",
    options: [
      { id: "q28_review", icon: "📖", label: "Review every mistake", echo: "studied every mistake after a defeat", weights: { Scholarship: 3 } },
      { id: "q28_plan",   icon: "✨", label: "Make a stronger study plan", echo: "forged a stronger plan after a defeat", weights: { Excellence: 3 } },
      { id: "q28_ask",    icon: "🤝", label: "Ask how a classmate prepared", echo: "learned from a fellow scholar after a defeat", weights: { Community: 2, Scholarship: 1 } },
      { id: "q28_own",    icon: "🗝️", label: "Own it, no excuses", echo: "owned a defeat without excuses", weights: { Integrity: 3 } } ] },
  { id: "q29", title: "The vanished captain", text: "Your group's leader disappears days before a deadline.",
    options: [
      { id: "q29_lead",   icon: "⚔️", label: "Step up and lead", echo: "stepped up when the captain vanished", weights: { Leadership: 3 } },
      { id: "q29_split",  icon: "🤝", label: "Split the roles fairly", echo: "divided the work fairly among the company", weights: { Community: 3 } },
      { id: "q29_extra",  icon: "🛡️", label: "Take on extra work", echo: "carried extra weight for your company", weights: { Service: 3 } },
      { id: "q29_inform", icon: "🗝️", label: "Inform the professor honestly", echo: "told the truth when the captain vanished", weights: { Integrity: 3 } } ] },
  { id: "q30", title: "The open scroll", text: "You built a tool that would help your whole class.",
    options: [
      { id: "q30_share",   icon: "🌿", label: "Share it free with everyone", echo: "gave your creation freely to all", weights: { Community: 2, Service: 1 } },
      { id: "q30_improve", icon: "✨", label: "Keep improving it", echo: "kept refining your creation", weights: { Excellence: 3 } },
      { id: "q30_docs",    icon: "📖", label: "Write clear documentation", echo: "wrote a clear scroll for your creation", weights: { Scholarship: 2, Service: 1 } },
      { id: "q30_pitch",   icon: "⚔️", label: "Pitch it to the department", echo: "carried your creation before the council", weights: { Leadership: 3 } } ] },
  { id: "q31", title: "The great stage", text: "Your section needs someone to represent you at a college event.",
    options: [
      { id: "q31_perform", icon: "⚔️", label: "Volunteer to go on stage", echo: "stepped onto the great stage", weights: { Leadership: 3 } },
      { id: "q31_group",   icon: "🤝", label: "Organize a group act", echo: "brought your section onto the stage together", weights: { Community: 3 } },
      { id: "q31_coach",   icon: "✨", label: "Coach whoever performs", echo: "coached a performer to shine", weights: { Excellence: 2, Service: 1 } },
      { id: "q31_crew",    icon: "🛡️", label: "Handle backstage support", echo: "worked faithfully behind the curtain", weights: { Service: 3 } } ] },
  { id: "q32", title: "The mentor's offer", text: "A professor offers to mentor one student in research.",
    options: [
      { id: "q32_apply",     icon: "📖", label: "Apply right away", echo: "answered a mentor's call to research", weights: { Scholarship: 3 } },
      { id: "q32_proposal",  icon: "✨", label: "Prepare a strong proposal", echo: "prepared a proposal worthy of a mentor", weights: { Excellence: 3 } },
      { id: "q32_recommend", icon: "🛡️", label: "Recommend a friend who needs it", echo: "gave a mentor's chance to a friend", weights: { Service: 3 } },
      { id: "q32_commit",    icon: "🗝️", label: "Apply only if I can commit", echo: "made a promise only you could keep", weights: { Integrity: 3 } } ] },
  { id: "q33", title: "The tangled thread", text: "Your group chat is full of arguments.",
    options: [
      { id: "q33_unite", icon: "🌿", label: "Bring everyone back together", echo: "mended a tangled fellowship", weights: { Community: 3 } },
      { id: "q33_steps", icon: "⚔️", label: "Set clear next steps", echo: "cut through the quarrel with a clear plan", weights: { Leadership: 3 } },
      { id: "q33_admit", icon: "🗝️", label: "Admit my part in it", echo: "owned your part in a quarrel", weights: { Integrity: 3 } },
      { id: "q33_check", icon: "🛡️", label: "Check on whoever got hurt", echo: "tended to those wounded by harsh words", weights: { Service: 3 } } ] },
  { id: "q34", title: "The hidden shortcut", text: "You find a faster way to solve a common class problem.",
    options: [
      { id: "q34_teach",  icon: "🛡️", label: "Teach it to my classmates", echo: "taught your discovery to others", weights: { Service: 2, Scholarship: 1 } },
      { id: "q34_why",    icon: "📖", label: "Understand why it works", echo: "sought the secret behind your discovery", weights: { Scholarship: 3 } },
      { id: "q34_tool",   icon: "✨", label: "Turn it into a polished tool", echo: "forged your discovery into a polished tool", weights: { Excellence: 3 } },
      { id: "q34_build",  icon: "🌿", label: "Build on it with a team", echo: "built on your discovery with a team", weights: { Community: 3 } } ] },
  { id: "q35", title: "The oath of the new term", text: "A new semester begins. What is your first vow?",
    options: [
      { id: "q35_learn",  icon: "📖", label: "To learn something deeply", echo: "vowed to learn something deeply", weights: { Scholarship: 3 } },
      { id: "q35_help",   icon: "🛡️", label: "To help someone every week", echo: "vowed to help someone every week", weights: { Service: 3 } },
      { id: "q35_lead",   icon: "⚔️", label: "To lead something new", echo: "vowed to lead something new", weights: { Leadership: 3 } },
      { id: "q35_master", icon: "✨", label: "To master one great skill", echo: "vowed to master one great skill", weights: { Excellence: 3 } } ] }
];
