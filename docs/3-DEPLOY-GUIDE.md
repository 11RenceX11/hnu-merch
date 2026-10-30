# Guide 3: Put the shop online with GitHub and Vercel

Before this guide: finish **Guide 1** (the shop runs on your computer, `npm run lint` and `npm run build` pass) and **Guide 2, Part A** (a test payment works).

> **About Vercel plans.** Vercel's free **Hobby** plan is for personal, non-commercial projects. A shop that sells real merch is commercial, so use the **Pro** plan when you start selling. Testing and demos on Hobby are fine.

## Why the shop needs extra storage on Vercel
On your computer the shop saves data in files. Vercel cannot keep files between requests, so online the shop uses:
- **Upstash Redis** for products, collections, sales, orders and subscribers
- **Vercel Blob** for photos uploaded by the admin

You connect both in Steps 5 and 6. The shop picks the right storage by itself.

## Step 1: Put the project on GitHub
1. Go to https://github.com and sign up or log in.
2. Click **New repository**. Name it `hnu-merch`, choose **Private**, and do **not** tick README, .gitignore or license. Click **Create repository**.
3. In the terminal, inside the `hnu-merch` folder, run these one at a time (use your own address):
   ```bash
   git init
   git add .
   git commit -m "First version of the shop"
   git branch -M main
   git remote add origin https://github.com/YOURNAME/hnu-merch.git
   git push -u origin main
   ```
   Git may open a browser window to sign in to GitHub.
4. Open the repository on GitHub. You must **not** see `.env.local` or a `.data` folder. You should see `.env.example`. If `.env.local` is there, delete the repository and start again.

## Step 2: Create your Vercel account
1. Go to https://vercel.com and click **Sign Up**.
2. Choose **Continue with GitHub** and allow access.

## Step 3: Import the project
1. Click **Add New...**, then **Project**.
2. Find `hnu-merch` and click **Import**.
3. Vercel detects **Next.js** by itself. Leave Root Directory as `./` and the build settings as they are.

## Step 4: Add the environment variables, then deploy
On the same page open **Environment Variables** and add:

| Name | Value |
|---|---|
| `SESSION_SECRET` | the long text from Guide 1, Step 5 (or make a new one with the same command) |
| `PAYMONGO_SECRET_KEY` | your `sk_test_...` key |
| `PAYMONGO_PAYMENT_METHODS` | `qrph,gcash,paymaya,card` (or only the methods that work for you) |

Do **not** add `SITE_URL`. On Vercel the shop uses your production address automatically.
Click **Deploy** and wait for "Congratulations". Click the picture to open your shop at `https://something.vercel.app`.

You can browse and log in now, but **saving does not work yet**. Steps 5 and 6 fix that.

## Step 5: Connect the database (Upstash Redis)
1. In your Vercel project open the **Storage** tab.
2. Click **Create Database** (or **Marketplace**), choose **Upstash**, then **Redis**.
3. Name it (for example `hnu-merch-data`), pick a region near the Philippines (for example **Singapore**) and the free plan to start.
4. Finish, then **Connect** it to your `hnu-merch` project for **all environments**.
5. Open **Settings**, **Environment Variables**. You should see variables such as `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Vercel added them. Do not edit them.

## Step 6: Connect photo storage (Vercel Blob)
1. In the **Storage** tab click **Create** and choose **Blob**.
2. Name it (for example `hnu-merch-photos`), keep access **Public**, and connect it to the project for all environments.
3. A variable named `BLOB_READ_WRITE_TOKEN` is added for you.

## Step 7: Redeploy so the new variables apply
Variables only apply to new deployments.
1. Open **Deployments**.
2. On the latest one click **...**, then **Redeploy**, then confirm.
3. Wait for **Ready**.

## Step 8: Prove that saving works
1. Open your shop address and log in as the **admin**.
2. **Admin, Products, Add a product.** Upload a photo (up to 3 MB), fill the form and save.
3. Refresh and open the shop. The product is still there. That proves the database and photo storage work.

## Step 9: Connect the PayMongo webhook
Now do **Guide 2, Part B** (about 5 minutes). Use your Vercel address.

## Step 10 (optional): Your own domain
1. In Vercel open **Settings**, then **Domains**, and add your domain. Follow the DNS instructions Vercel shows.
2. Add an environment variable `SITE_URL` with `https://yourdomain.com` and redeploy. PayMongo sends customers back to this address after paying.
3. If you changed the domain, update the webhook URL in PayMongo too.

Vercel's temporary **preview** links can be protected by a login page, so PayMongo's webhook cannot reach them. Always use the **production** address.

## Updating the shop later
1. Change the code on your computer.
2. Run `git add .`, then `git commit -m "What I changed"`, then `git push`.
3. Vercel sees the push and deploys the new version by itself.

Products, collections, sales and photos are changed in the **admin area**, not in the code.

## Troubleshooting
| What you see | What it means and what to do |
|---|---|
| Build fails on Vercel | A code error. Run `npm run build` on your computer, fix it, push again |
| "Storage is not set up" when saving | Redis is not connected. Do Step 5, then redeploy |
| "Photo storage is not set up" | Blob is not connected. Do Step 6, then redeploy |
| Cannot log in online | `SESSION_SECRET` is missing. Add it and redeploy |
| "Payments are not set up yet" | `PAYMONGO_SECRET_KEY` is missing. Add it and redeploy |
| Photos do not show after upload | Make sure you deployed the latest code, which allows `*.public.blob.vercel-storage.com` images |
| Weather bar says unavailable | The weather service could not be reached. Open `/api/weather` and try again in a few minutes |

## Final checklist
- [ ] `npm run lint` and `npm run build` pass on my computer
- [ ] A test payment works locally (Guide 2, Part A)
- [ ] The code is on GitHub and `.env.local` is NOT in it
- [ ] Vercel project created with three environment variables
- [ ] Redis connected, Blob connected, redeployed
- [ ] I added a product as admin and it survived a refresh
- [ ] PayMongo webhook added, `PAYMONGO_WEBHOOK_SECRET` set, redeployed
- [ ] A test purchase online shows "Payment received" and the webhook shows 200
