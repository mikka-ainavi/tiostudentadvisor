// Cloudflare Worker: serves the landing page and handles POST /api/lead.
// A lead is saved as a Brevo contact (list BREVO_LIST_ID, with attributes) and
// the team gets a "new lead" email through Brevo transactional email.
//
// Config (wrangler.jsonc "vars" or Cloudflare dashboard):
//   BREVO_API_KEY   secret, set in the Cloudflare dashboard (never in code)
//   BREVO_LIST_ID   e.g. "6"
//   SENDER_EMAIL    verified Brevo sender, e.g. tiostudentadvisor@outlook.com
//   SENDER_NAME     e.g. "Tio Student Advisor"
//   NOTIFY_TO       main recipient of new-lead emails
//   NOTIFY_CC       optional, comma-separated extra recipients (set in the dashboard)

const BREVO_API = 'https://api.brevo.com/v3';

// Allowed answers. These must match the options on the form exactly.
const QUESTIONS = {
  who:       { label: 'I am a',              attr: 'ROLE',          options: ['Student', 'Parent / guardian', 'School counsellor'] },
  programme: { label: 'Programme',           attr: 'PROGRAMME',     options: ['International Business Management', 'Business Management', 'Commerce, Economics & Entrepreneurship', 'Hotel & Event Management', 'International Tourism Management', 'Not sure yet'] },
  intake:    { label: 'Start',               attr: 'INTAKE',        options: ['January 2027', 'September 2027', 'Not sure yet'] },
  stage:     { label: 'Studies now',         attr: 'STUDY_STAGE',   options: ['Final year of secondary school', 'Earlier in secondary school', 'Gap year', 'Already at university'] },
  english:   { label: 'English test',        attr: 'ENGLISH_TEST',  options: ['Yes, I have a result', 'Booked / planning a test', 'Not yet'] },
  budget:    { label: 'Budget',              attr: 'BUDGET',        options: ['Within our plans', 'Interested in scholarships', 'Want to talk it through'] },
  meet:      { label: 'How to meet Jan',     attr: 'MEETING_PREF',  options: ['Malta fair, Mon 23 Nov', 'Evening of 23 Nov (Malta)', 'Tue 24 Nov (Malta)', 'Video call'] },
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/lead') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
      return handleLead(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};

async function handleLead(request, env) {
  // Only accept submissions from this site.
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  // Honeypot: real people never fill the hidden "company" field. Pretend success.
  if (body.company) return json({ ok: true });

  const lead = validate(body);
  if (lead.error) return json({ ok: false, error: lead.error }, 400);

  if (!env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set');
    return json({ ok: false, error: 'Server not configured' }, 500);
  }

  const [contact, notify] = await Promise.allSettled([saveContact(lead, env), notifyTeam(lead, env)]);
  if (contact.status === 'rejected') console.error('Brevo contact failed:', contact.reason?.message);
  if (notify.status === 'rejected') console.error('Brevo notification failed:', notify.reason?.message);

  // The lead is safe if either the contact or the team email went through.
  if (contact.status === 'fulfilled' || notify.status === 'fulfilled') return json({ ok: true });
  return json({ ok: false, error: 'Could not save your request' }, 502);
}

function clean(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function validate(body) {
  const lead = { answers: {} };
  for (const [key, q] of Object.entries(QUESTIONS)) {
    const v = clean(body[key]);
    if (!q.options.includes(v)) return { error: `Please answer: ${q.label}` };
    lead.answers[key] = v;
  }
  lead.name = clean(body.name, 120);
  lead.email = clean(body.email, 200).toLowerCase();
  lead.phone = clean(body.phone, 40);
  lead.country = clean(body.country, 160);
  lead.consent = body.consent === true || body.consent === 'on';
  lead.utm = {
    source: clean(body.utm_source, 100),
    medium: clean(body.utm_medium, 100),
    campaign: clean(body.utm_campaign, 150),
    content: clean(body.utm_content, 150),
    gclid: clean(body.gclid, 200),
    fbclid: clean(body.fbclid, 300),
  };
  lead.page = clean(body.page, 300);
  if (!lead.name) return { error: 'Please add your name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return { error: 'Please enter a valid email.' };
  if (!lead.consent) return { error: 'Please tick the consent box.' };
  return lead;
}

async function brevo(env, path, payload) {
  const res = await fetch(`${env.BREVO_API_BASE || BREVO_API}${path}`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res;
}

function saveContact(lead, env) {
  const [first, ...rest] = lead.name.split(/\s+/);
  const attributes = {
    FIRSTNAME: first,
    LASTNAME: rest.join(' '),
    WHATSAPP: lead.phone,
    COUNTRY_SCHOOL: lead.country,
    LEAD_SOURCE: 'Landing page: Book a call with Jan',
    UTM_SOURCE: lead.utm.source,
    UTM_CAMPAIGN: lead.utm.campaign,
  };
  for (const [key, q] of Object.entries(QUESTIONS)) attributes[q.attr] = lead.answers[key];
  // Don't overwrite existing values with blanks on a repeat submission.
  for (const k of Object.keys(attributes)) if (!attributes[k]) delete attributes[k];

  return brevo(env, '/contacts', {
    email: lead.email,
    attributes,
    listIds: [Number(env.BREVO_LIST_ID)],
    updateEnabled: true,
  });
}

function notifyTeam(lead, env) {
  const cc = (env.NOTIFY_CC || '').split(',').map(s => s.trim()).filter(Boolean).map(email => ({ email }));
  const rows = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['WhatsApp / phone', lead.phone || '–'],
    ['Country & school', lead.country || '–'],
    ...Object.entries(QUESTIONS).map(([key, q]) => [q.label, lead.answers[key]]),
    ['Consent to be contacted', lead.consent ? `Yes (${new Date().toISOString()})` : 'No'],
    ['UTM source / medium / campaign', [lead.utm.source, lead.utm.medium, lead.utm.campaign].filter(Boolean).join(' / ') || '–'],
    ['UTM content', lead.utm.content || '–'],
    ['Ad click ID', lead.utm.gclid ? `gclid ${lead.utm.gclid}` : lead.utm.fbclid ? `fbclid ${lead.utm.fbclid}` : '–'],
  ];
  const table = rows.map(([k, v]) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#4b5563;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`).join('');

  const payload = {
    sender: { email: env.SENDER_EMAIL, name: env.SENDER_NAME || 'Tio Student Advisor' },
    to: [{ email: env.NOTIFY_TO }],
    replyTo: { email: lead.email, name: lead.name },
    subject: `New call request: ${lead.name} (${lead.answers.who}, ${lead.answers.meet})`,
    htmlContent: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111827">
      <h2 style="color:#0636a2;margin:0 0 12px">New call request from the landing page</h2>
      <table style="border-collapse:collapse">${table}</table>
      <p style="margin-top:16px;color:#4b5563">Reply to this email to answer ${esc(lead.name)} directly.</p></div>`,
  };
  if (cc.length) payload.cc = cc;
  return brevo(env, '/smtp/email', payload);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
}
