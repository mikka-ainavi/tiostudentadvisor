# "Book a call with Jan" landing page

A single-file landing page (`index.html`) for paid ads. Its one job is to get a student, parent or counsellor to book a free 20-minute call with Jan van Breen, a Tio lecturer and International Student Advisor.

## Page structure

The content and structure follow the "Book a call with Jan" design mockup. The styling follows tio.nl, in a light edition: white and ice (`#F4F5FC`) backgrounds, Tio blue (`#0636A2`) for the header, headings and selected answers, and Tio green (`#7DE665`) only for the main action.

1. Blue header, plus an ice quick-nav row in tio.nl's style (What you get · Why Jan · Book a call · Malta fair)
2. Hero: headline, Jan's card, two CTAs (book, or Malta on 23 Nov)
3. Proof strip: #1 Keuzegids · ~10 students · 98% employment · 55+ countries
4. What 20 minutes with Jan gets you (3 cards)
5. Why talk to Jan: checks plus a testimonial slot
6. Pillars: Business, learned by doing (6 cards plus NL facts)
7. Who books a call: students, parents, counsellors
8. Screening form: 7 one-tap questions, contact details, then a thank-you state
9. Malta Uni Fair panel (remove after 23 Nov)
10. FAQ
11. Final CTA

## Before going live

1. **Brand.** Colours were sampled from a tio.nl homepage screenshot: blue `#0636A2`, green `#7DE665`, pale green `#EBF7E9` and ring blue `#1948BC`. They are tokens at the top of `<style>`. The layout copies tio.nl's patterns: pale-green panel with white cards and blue circle badges, rounded blue CTA bands with a ring motif, green and outline pill buttons, and pill fields with a blue floating label. Tio's own heading font isn't on Google Fonts, so Plus Jakarta Sans ExtraBold stands in, with Inter for body text. Swap in the licensed font files and the real logo SVG if you have them.
2. **Jan's photo.** Replace the `JvB` placeholder in `.jan-photo` with `<img src="jan.jpg" alt="Jan van Breen">`.
3. **Jan's bio.** LinkedIn could not be reached. The bio uses only facts from the Quick Summary. Add specifics such as years of experience, sectors and countries.
4. **Placeholders.** Fill in the testimonial, Jan's credentials and the "[X] working days" reply time. They are highlighted in yellow.
5. **Lead capture.** In the form's submit handler, POST the form data to your CRM, Google Sheet or webhook. The page currently stores nothing.
6. **Tracking.** Fire your Meta and Google conversion events in the same submit handler.
7. **Fee check.** The FAQ form lists €24,950 tuition and a €250 application fee. Approved Claims list €24,500 plus €95 enrolment. The page uses the approved figures. Confirm which is current.
8. **Privacy.** Link the consent line to Tio's privacy policy.
