# "Book a call with Jan" landing page

A single-file landing page (`index.html`) for paid ads. Its one job is to get a student, parent or counsellor to book a free 20-minute call with Jan van Breen, a Tio lecturer and International Student Advisor.

## Page structure

The content and structure follow the "Book a call with Jan" design mockup. The styling follows tio.nl, in a light edition: white and ice (`#F4F5FC`) backgrounds, Tio blue (`#0636A2`) for the header, headings and selected answers, and Tio green (`#7DE665`) only for the main action.

1. Blue header with the locations (Amsterdam · Utrecht · Rotterdam · Eindhoven), plus an ice row of guide downloads (Housing Guide · International Study Guide · Associate Degree Guide)
2. Hero: "Your future deserves more than a university search on Google", Jan's workshop photo, two CTAs (book, or meet Jan in Malta on 23 Nov)
3. Why students choose Tio: the study guide image beside the #1 · 15 years card, then 9 selling-point cards (proof strip and pillars merged)
4. What 30 minutes with Jan gets you (3 cards)
5. Screening form: 7 one-tap questions, contact details, then a thank-you state
6. Malta Uni Fair panel (remove after 23 Nov)
7. Frequently asked questions
8. Final CTA, then a footer with social icons (Instagram, Facebook, YouTube, TikTok, email)

Images are in `img/`.

## Before going live

1. **Brand.** Colours were sampled from a tio.nl homepage screenshot: blue `#0636A2`, green `#7DE665`, pale green `#EBF7E9` and ring blue `#1948BC`. They are tokens at the top of `<style>`. The layout copies tio.nl's patterns: pale-green panel with white cards and blue circle badges, rounded blue CTA bands with a ring motif, green and outline pill buttons, and pill fields with a blue floating label. Tio's own heading font isn't on Google Fonts, so Plus Jakarta Sans ExtraBold stands in, with Inter for body text. Swap in the licensed font files and the real logo SVG if you have them.
2. **Links.** All set: booking buttons go to https://meet.brevo.com/jan-van-breen, the three guide buttons open their Brevo forms, and the footer icons link to Tio Student Advisor's YouTube, TikTok, Facebook, Instagram and email.
3. **Jan's bio.** LinkedIn could not be reached. The bio uses only facts from the Quick Summary. Add specifics such as years of experience, sectors and countries.
4. **Reply time.** The form says Jan typically responds within 24 hours.
5. **Lead capture.** Done: the form posts to `/api/lead` (see "Form → Brevo" below).
6. **Tracking.** Fire your Meta and Google conversion events in the same submit handler.
7. **Fee check.** The FAQ form lists €24,950 tuition and a €250 application fee. Approved Claims list €24,500 plus €95 enrolment. The page uses the approved figures. Confirm which is current.
8. **Privacy.** Link the consent line to Tio's privacy policy.

## Deploy to Cloudflare

The repo is set up as a Cloudflare Workers static site. `wrangler.jsonc` serves the `landing/` folder, and `landing/.assetsignore` keeps this README off the live site. There is no build step.

**Option A: deploy from GitHub (recommended, redeploys on every push)**
1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Import a repository** and pick `mikka-ainavi/tiostudentadvisor`.
2. Leave the build command empty and set the deploy command to `npx wrangler deploy`.
3. Pick the branch to deploy from, then **Save and Deploy**. The site goes live at `tio-book-a-call-jan.<your-subdomain>.workers.dev`.

**Option B: deploy from your computer**
```bash
npm install
npx wrangler login
npm run deploy
```
Run `npm run dev` to preview locally at http://localhost:8787.

**Custom domain:** in the Worker, go to **Settings → Domains & Routes → Add → Custom domain** (for example `jan.tio-advisor.com`). The domain's DNS must be on Cloudflare.

## Form → Brevo

`src/worker.js` handles `POST /api/lead`. For each lead it:
1. checks the 7 answers, name, email and consent (and drops bots that fill the hidden `company` field);
2. creates or updates a Brevo contact in list **6** with these attributes: FIRSTNAME, LASTNAME, WHATSAPP, COUNTRY_SCHOOL, ROLE, PROGRAMME, INTAKE, STUDY_STAGE, ENGLISH_TEST, BUDGET, MEETING_PREF, LEAD_SOURCE, UTM_SOURCE and UTM_CAMPAIGN. Adding the contact to the list triggers the Brevo confirmation automation;
3. emails the full lead to `NOTIFY_TO`, copying `NOTIFY_CC`. Replying to that email goes straight to the lead.

The lead is counted as saved if either step 2 or step 3 succeeds. If both fail, the visitor sees an error with Jan's WhatsApp number.

**Settings** (Worker → Settings → Variables and Secrets):
- `BREVO_API_KEY` (secret): set in the dashboard.
- `NOTIFY_CC`: add it in the dashboard as comma-separated emails. `keep_vars` stops deploys from wiping it.
- `BREVO_LIST_ID`, `SENDER_EMAIL`, `SENDER_NAME` and `NOTIFY_TO` live in `wrangler.jsonc`.

**Local test:** create `.dev.vars` containing `BREVO_API_KEY=...`, then run `npm run dev`. Setting `BREVO_API_BASE` in `.dev.vars` points the Worker at a mock server instead of Brevo. Errors show in the Worker's **Logs** tab on Cloudflare.

## Analytics (Google Analytics 4)

The Google tag for property `G-K2PS7Q8KYR` is in the page `<head>`. GA4 records visits and reads the traffic source from the referrer and the `utm_` parameters on the ad URL. The page also sends these events:

| Event | When |
|---|---|
| `book_call_click` | any button that opens the Brevo meeting page |
| `form_cta_click` | the hero button that jumps to the question form |
| `form_start` | first answer chosen in the form |
| `generate_lead` | form submitted and saved (sends the role and meeting preference, no personal data) |
| `guide_download` | housing, international or associate guide button (`guide` parameter) |
| `social_click`, `email_click`, `fair_register_click` | footer icons and the fair registration button |

In GA4, mark `generate_lead` and `book_call_click` as **key events** (Admin → Events). Tag ad links with UTM parameters, for example `?utm_source=meta&utm_medium=paid_social&utm_campaign=malta_fair`. The form also saves the UTM values into Brevo with each lead.
