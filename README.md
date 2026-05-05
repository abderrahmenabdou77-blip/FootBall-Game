# ⚽ Football Arena

**Multiplayer browser football game — control your player from your phone and watch the match live on a shared screen, supporting 1v1, 2v2, and 3v3 modes.**

---

## 🚀 Deployment on Render

1. Upload the project folder to a GitHub repository
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your repository and set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Deploy — Render handles the port and WebSocket automatically ✅

Once deployed, share your Render URL with players.

---

## 🎮 How to Play

1. Open the game URL on a **TV or PC** (the stadium screen)
2. Choose a game mode: **1v1 · 2v2 · 3v3**
3. A QR code appears for each team — players scan it on their **phones**
4. Each player selects their position
5. Press **"Start Match!"** when all players have joined
6. Play! The match runs for 90 in-game minutes (≈ 15 real minutes)

---

## 📱 Controller Buttons

| Button | Action |
|--------|--------|
| Left joystick | Move player |
| Right joystick | Aim ball direction |
| ⚽ SHOOT | Kick toward goal |
| ■ PASS | Short pass |
| 🌙 LOB | Lob pass |
| ✕ TACKLE | Steal the ball |

---

## 📁 Files

| File | Description |
|------|-------------|
| `server.js` | Node.js server with WebSocket |
| `index.html` | Stadium screen (TV / PC) |
| `controller.html` | Phone controller |
| `package.json` | Dependencies (`ws`) |

---

## ⚙️ Run Locally

**Requirements:** Node.js 18+

```bash
npm install
npm start
```

Then open `http://localhost:3000` on your PC and share the local IP with phone players on the same WiFi network.

---

## 🔌 Tech Stack

- **Backend:** Node.js — no frameworks
- **Realtime:** WebSocket (`ws` library) — full-duplex, low latency
- **Frontend:** Vanilla HTML · CSS · Canvas API
- **Hosting:** Render (WebSocket supported out of the box)
