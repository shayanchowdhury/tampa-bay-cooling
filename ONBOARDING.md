# New client onboarding (about 10 minutes)

1. Get the client's answers: business name, website and site builder, services, area, hours, pricing guidance, lead email, emergency phone, things the AI must never promise.
2. In lib/businesses.ts, copy the template at the bottom of BUSINESSES, uncomment it, fill it in. Set demo: false.
3. Run npm run dev and test at http://localhost:3000/embed/<id>. Chat as a customer, finish a lead, check the email arrives.
4. Push: git add . / git commit -m "Add <client>" / git push. Vercel deploys in about a minute.
5. Send the client this snippet (replace <id>):
   <script src="https://tampa-bay-cooling.vercel.app/widget.js" data-business="<id>"></script>
   Tell them to paste it just before </body>. On Wix or Squarespace it goes in the custom code area (needs a plan that allows it).
6. Leads: until a Resend domain is verified, keep notifyEmail empty so leads come to my inbox, and forward each one to the client within the hour. Once verified, set notifyEmail to the owner's email.
7. Test once on the client's live site, then ask for the review.

Before the first paid client: confirm Vercel Hobby terms for commercial use (or move to Pro), and decide on a domain for Resend.
