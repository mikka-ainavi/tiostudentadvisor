# "Book a call with Jan" landing page

A single-file landing page (`index.html`) for paid ads. Its one job is to get a student, parent or counsellor to book a free 20-minute call with Jan van Breen, a Tio lecturer and International Student Advisor.

## Page structure and why

| # | Section | Job |
|---|---------|-----|
| 1 | **Hero** with Jan's card | One promise ("talk to someone who teaches there"), one person, one CTA. Three USP ticks and the "lecturer, not a recruiter" quote. |
| 2 | **Proof bar** | Approved claims only: #1 Keuzegids 15 years, 98% alumni employed, 55+ countries, 99%+ visa acceptance. |
| 3 | **Why a call, not a brochure** | Six concrete things you leave the call with, taken from the "Why call Jan" column of the pillars. |
| 4 | **USPs** | The content pillars: 3 years, about 60% practical, 20-week internship, about 10 per class, housing in 4 cities, Orientation Year. |
| 5 | **Audience tabs** | Student, parent and counsellor personas, each with their question, a hook and their reasons to call. |
| 6 | **Meet Jan / what this call is not** | Builds trust and handles the "is this a sales call?" objection. |
| 7 | **Why the Netherlands** | Country facts from Approved Claims. |
| 8 | **Booking + screening form** | Five quick steps that auto-advance on tap: role, programme, intake, school stage, English test, budget, then contact details. It shows a summary, then sends the person to the scheduler. |
| 9 | **FAQ** | Objection handling, based on the FAQ form and updated to the approved figures. |
| 10 | **Final CTA + Malta fair strip** | A repeat CTA and an in-person option for 23 Nov 2026. Remove the strip after the fair. |

A sticky header CTA (desktop) and a bottom CTA bar (mobile) keep the action one tap away.

## Before going live

1. **Brand.** tio.nl could not be reached from the build environment. The colours and fonts are tokens at the top of `<style>` (`--navy`, `--accent`, `--font-display`, `--font-body`), currently set from the Tio FAQ prototype palette. Swap in the exact tio.nl values and the logo.
2. **Jan's photo.** Replace the `JvB` placeholder in `.jan-photo` with `<img src="jan.jpg" alt="Jan van Breen">`.
3. **Jan's bio.** LinkedIn could not be reached. The bio uses only facts from the Quick Summary. Add specifics such as years of experience, sectors and countries.
4. **Scheduler.** Set `BOOKING_URL` in the script to Jan's Calendly, Google Calendar or HubSpot link. Name and email are passed through as query parameters.
5. **Lead capture.** In `finish()`, POST the form data to your CRM, Google Sheet or webhook. The page currently stores nothing.
6. **Tracking.** Fire your Meta and Google conversion events in `finish()`, and on the booking-link click.
7. **Fee check.** The FAQ form lists €24,950 tuition and a €250 application fee. Approved Claims list €24,500 plus €95 enrolment. The page uses the approved figures. Confirm which is current.
8. **Privacy.** Link the consent line to Tio's privacy policy.
