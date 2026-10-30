# Guide 1: Set up the shop on your own computer

Read the guides in this order: **1 Setup, 2 PayMongo (Part A), 3 Deploy, then 2 PayMongo (Parts B and C)**.
This guide gets the shop running on your computer. You do not need any accounts for it.

## What you need
- A computer (Windows, Mac or Linux) and an internet connection
- Node.js (LTS version) and Git, both free (steps below)

## Step 1: Install Node.js
1. Go to https://nodejs.org and download the **LTS** version.
2. Run the installer and click Next until it finishes.
3. Open a terminal. Windows: search for **PowerShell**. Mac: open **Terminal**.
4. Type `node -v` and press Enter. You should see a number like `v22.x.x`.

## Step 2: Install Git
1. Go to https://git-scm.com/downloads and install it.
2. In the terminal type `git --version`. You should see a version number.

## Step 3: Open the project
1. Unzip `hnu-merch.zip`. You get a folder called `hnu-merch`.
2. In the terminal go into it. Example on Windows: `cd C:\Users\YourName\Downloads\hnu-merch`.
   (You can also open the folder in VS Code and use its built-in terminal.)

## Step 4: Install the packages
```bash
npm install
```
Wait until it finishes. A `node_modules` folder appears. Warnings are normal. Red "ERR" lines are not.

## Step 5: Create your settings file
1. Copy `.env.example` and name the copy exactly `.env.local`
   - Mac or Linux: `cp .env.example .env.local`
   - Windows PowerShell: `Copy-Item .env.example .env.local`
2. Create a secret for login cookies. Run this and copy the long text it prints:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
3. Open `.env.local` in a text editor. After `SESSION_SECRET=` paste that text.
4. Leave the other lines for now. You add the PayMongo key in Guide 2.

`.env.local` holds secrets. It is already excluded from GitHub. Never share it.

## Step 6: Start the shop
```bash
npm run dev
```
Open http://localhost:3000 in your browser. To stop the shop, press `Ctrl + C` in the terminal.

## Step 7: Log in
Open the **Log in** page. The form is already filled in. Click **Collector** or **Admin** to switch.

| Account | Email | Password |
|---|---|---|
| Collector | collector@hnu-merch.test | Collector#2026 |
| Admin | admin@hnu-merch.test | HnuAdmin#2026 |

## Step 8: Take a tour (so you know everything works)
**As a visitor or collector**
- The bar at the very top shows the real campus weather. Click "see the data" to view `/api/weather`.
- Hover a product card. A Quick add panel slides up.
- Open **Shop**. Try the search box, the sort menu and the category chips.
- Open a **Collection**. Hover the green circles on the photo, then click one to see that item.
- Add things to the cart. Checkout needs PayMongo (Guide 2).
- Open **Account** to see what you own, your collections and your orders. You can always buy again.

**As the admin** (click the gold Admin button)
- **Products, Add a product:** fill the form, pick categories, upload a photo (JPG, PNG or WebP, up to 3 MB).
  Click "+ Add a pin", click the photo where an item is, type a label (for example "Black cap") and choose which product it opens.
  Add as many pins as you like.
- **Collections:** same photo-and-pins editor for a bundle photo.
- **Sales calendar:** click a day, name the event, set the percent and the end date. The discount starts and ends by itself.
  Use Pause to stop a sale by hand.
- **Orders:** every order and its status.

## Step 9: Check the code
Stop the shop (`Ctrl + C`) and run:
```bash
npm run lint
npm run build
```
Both must finish without errors before you deploy.

## Where your data is saved
On your computer, in the `.data` folder (products, collections, sales, orders, uploaded photos).
Delete the `.data` folder to reset the shop to its starter data.

## Troubleshooting
| Problem | Fix |
|---|---|
| `node` is not recognised | Close and reopen the terminal after installing Node.js |
| Port 3000 is busy | Run `npm run dev -- -p 3001` and open http://localhost:3001 |
| Error mentioning `SESSION_SECRET` | `.env.local` is missing or the value is empty. Do Step 5, then restart |
| Fonts or weather do not load | The shop needs internet access for fonts and the forecast |
| Changes to `.env.local` do nothing | Stop the shop and run `npm run dev` again |
| Old product names after an update | Delete the `.data` folder once |
