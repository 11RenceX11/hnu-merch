# Guide 2: Connect PayMongo

PayMongo takes the payments. **Test mode** means no real money moves, so you can try everything safely.
Do **Part A** right after Guide 1. Do **Part B** after you finish Guide 3 (Deploy). Do **Part C** only when you are ready for real money.

---

## Part A: Test keys and your first test payment (on your computer)

### A1. Create your PayMongo account
1. Go to https://dashboard.paymongo.com and sign up.
2. Confirm your email (PayMongo sends you a message), then log in.

### A2. Turn on test mode
Find the **Test mode** switch in the dashboard and turn it **on**. Keep it on for Parts A and B.

### A3. Copy the test secret key
1. In the left menu open **Developers** (it may be called **Developer Tools**), then **API Keys**.
2. Copy the **secret key**. In test mode it starts with `sk_test_`.
3. Open `.env.local` and set: `PAYMONGO_SECRET_KEY=sk_test_xxxxxxxx`
4. Do not use the public key (`pk_test_...`). This shop only needs the secret key, and it only uses it on the server.

### A4. Check the payment methods
The shop offers `qrph,gcash,paymaya,card` (the `PAYMONGO_PAYMENT_METHODS` line). Every method must be enabled in your PayMongo account.
If PayMongo says a method is not available, change that line to only the methods that work, for example `PAYMONGO_PAYMENT_METHODS=card`.

### A5. Make a test purchase
1. Stop the shop (`Ctrl + C`) and start it again with `npm run dev` (it reads `.env.local` only at start).
2. Log in as the collector, add an item, open the cart, press **Checkout**, then **Pay**.
3. PayMongo's page opens. Pay with the test card:
   - Card number: `4343 4343 4343 4345`
   - Expiry: any future date, for example `12/30`
   - CVC: any 3 digits, for example `123`
   - For GCash or Maya, PayMongo shows a test page. Choose **Authorize**.
4. You return to the shop and, after a few seconds, see **Payment received** with confetti.
5. Log in as the admin and open **Orders**. The order says **paid**.

### How the shop knows you paid
The shop never trusts the browser. After you return, the server asks PayMongo directly (with your secret key) whether the checkout was paid.
The webhook in Part B is a second, official way to learn the same thing.

---

## Part B: The webhook (after you deploy in Guide 3)

A webhook is PayMongo calling your shop to say "this order was paid". It needs a public address, so do it once the shop is on Vercel.

### B1. Add the endpoint
1. In the PayMongo dashboard keep **Test mode** on.
2. Open **Developers**, then **Webhooks**, and click **Add endpoint** (or **Create webhook**).
3. URL: your Vercel address plus the path
   `https://YOUR-VERCEL-ADDRESS.vercel.app/api/webhooks/paymongo`
4. Events: choose **`checkout_session.payment.paid`**. It is the only event the shop needs.
5. Save.

### B2. Copy the webhook secret
PayMongo shows a secret for the endpoint. It starts with **`whsk_`**. If you cannot see it, open the endpoint you just made and reveal or copy its secret. Treat it like a password.

### B3. Give it to Vercel
1. Vercel, your project, **Settings**, **Environment Variables**.
2. Add `PAYMONGO_WEBHOOK_SECRET` with the `whsk_...` value.
3. **Redeploy** (Deployments, the **...** menu, Redeploy).

### B4. Test it
1. On the live shop, log in as the collector and buy something with the test card.
2. You land on **Payment received**.
3. In PayMongo, open the webhook and look at its recent deliveries. They should show **200**.
4. In the shop admin, **Orders** shows the order as **paid**.

### What the shop checks
PayMongo sends a header called `Paymongo-Signature`. The shop recomputes the signature from the exact raw body with your `whsk_` secret (HMAC-SHA256) and only accepts the message if it matches. A wrong signature gets status 400.
Each event is processed once, even if PayMongo sends it twice, and the paid amount is compared with the order total.

*(Optional, on your computer: a tunnel such as ngrok can give `localhost` a public address so you can test the webhook before deploying. It is not required, because Part A already confirms payments.)*

---

## Part C: Going live with real money (only when ready)
1. **Activate your PayMongo account.** Complete the business verification PayMongo asks for. You cannot take real payments until they approve it. Read PayMongo's go-live checklist in their developer docs.
2. **Get the live key.** Turn test mode **off**, open Developers, API Keys, copy the `sk_live_...` secret key.
3. **Allow live payments.** The shop blocks live keys unless you set `ALLOW_LIVE_PAYMENTS=true` in Vercel.
4. **Create a new webhook with test mode off** (same URL as Part B). It has a **different** `whsk_` secret.
5. In Vercel set the live `PAYMONGO_SECRET_KEY` and `PAYMONGO_WEBHOOK_SECRET`, then redeploy.
6. **Remove the demo accounts.** The login page fills in demo passwords for everyone. Change the hashes in `src/data/seed-users.ts`, delete `src/data/demo-accounts.ts` and the buttons that use it, and push. To make a new hash:
   ```bash
   node -e "const {randomBytes,scrypt}=require('crypto');const salt=randomBytes(16);scrypt(process.argv[1],salt,64,(e,k)=>console.log(salt.toString('hex')+':'+k.toString('hex')))" "YourNewStrongPassword"
   ```
7. Replace the sample products, prices, photos and the refund text on `/help`.
8. Place one small real order yourself and check it in PayMongo and in the admin Orders page.

## Troubleshooting
| What you see | Meaning and fix |
|---|---|
| "Payments are not set up yet" | `PAYMONGO_SECRET_KEY` is missing. Add it and restart or redeploy |
| "We could not start the payment" | PayMongo refused. Check the key is `sk_test_...` and every method in `PAYMONGO_PAYMENT_METHODS` is enabled |
| Webhook delivery shows 400 | Wrong `PAYMONGO_WEBHOOK_SECRET`, or test and live mixed up. Copy the secret of that exact endpoint |
| Webhook cannot connect | Wrong URL or a protected preview link. Use the production address and the exact path |
| Order stays "pending" | Payment not finished, or not confirmed yet. Stay on the page a minute, then check the payment in PayMongo |
