# Personal AI Pro 2

A responsive AI chat website starter with a polished dark interface.

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

Without an API key, the app runs in demo mode. For real AI replies, set `OPENAI_API_KEY` in your environment. Never put your API key in browser JavaScript or commit it to GitHub.

## Deploy on Render
1. Upload these files to your GitHub repository.
2. In Render, choose **New + → Web Service** and connect the repository.
3. Build command: `npm install`
4. Start command: `npm start`
5. In Render → Environment, add `OPENAI_API_KEY` with your own API key.
6. Deploy.

## Included
- Responsive chat interface
- New chat and local chat history
- Hindi/English-friendly chat input
- Demo mode when no API key is configured
- Server-side API call (key stays on the server)
- Video Studio preview screen (UI only; video generation provider is not connected)

## Important
This is a starter project, not a finished commercial service. Add authentication, rate limits, privacy policy, abuse protection, monitoring, and billing controls before opening it to the public. API usage may cost money. Ad placement is only a placeholder and does not generate revenue by itself.
