'use strict';

/**
 * Six Kingdoms — Instagram New Follower DM Bot
 *
 * Receives Meta Webhook events when someone follows @six_kingdoms,
 * then sends them an automated welcome DM via the Instagram Graph API.
 *
 * Prerequisites:
 *  - @six_kingdoms must be a Professional (Business or Creator) account
 *  - A Meta App with instagram_manage_messages permission (approved)
 *  - This server must be publicly accessible (e.g. Railway, Render, fly.io)
 *  - Copy .env.example to .env and fill in values before running
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GRAPH_API_VERSION = 'v21.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Parse raw body for signature verification, then also parse JSON
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf; }
}));

// ── Webhook verification (GET) ──────────────────────────────────────────────
// Meta calls this once when you first configure the webhook subscription.
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified by Meta.');
    return res.status(200).send(challenge);
  }

  console.warn('Webhook verification failed — token mismatch.');
  res.sendStatus(403);
});

// ── Webhook event handler (POST) ────────────────────────────────────────────
app.post('/webhook', (req, res) => {
  // Verify the request came from Meta using HMAC-SHA256 signature
  const signature = req.headers['x-hub-signature-256'];
  if (!verifySignature(req.rawBody, signature)) {
    console.warn('Invalid webhook signature — request ignored.');
    return res.sendStatus(403);
  }

  const body = req.body;

  // Meta sends batched events; process each entry
  if (body.object === 'instagram') {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'follows' && change.value) {
          const followerId = change.value.id; // IGSID of the new follower
          if (followerId) {
            sendWelcomeDM(followerId).catch(err => {
              console.error(`Failed to DM follower ${followerId}:`, err.message);
            });
          }
        }
      }
    }
  }

  // Always return 200 quickly so Meta doesn't retry
  res.sendStatus(200);
});

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verify the X-Hub-Signature-256 header using the app secret.
 * PAGE_ACCESS_TOKEN is not the app secret — for production you should store
 * APP_SECRET separately and use it here. For simplicity we fall back to
 * PAGE_ACCESS_TOKEN if APP_SECRET is not set, but set APP_SECRET in .env.
 */
function verifySignature(rawBody, signatureHeader) {
  if (!signatureHeader) return false;
  const appSecret = process.env.APP_SECRET || PAGE_ACCESS_TOKEN;
  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
  } catch {
    return false;
  }
}

/**
 * Send a welcome DM to a new follower.
 * Uses the Instagram Messaging API: POST /me/messages
 *
 * @param {string} recipientIgsid - The Instagram-Scoped ID of the new follower
 */
async function sendWelcomeDM(recipientIgsid) {
  const messageText =
    'Hi there! 👋 Thanks so much for following Six Kingdoms. ' +
    'We share EcoPools, ecological design, and land stewardship from the Garden Route. ' +
    'If you ever have questions about natural swimming pools or restoring your land, ' +
    "just reply here — we'd love to hear from you. 🌿";

  const response = await axios.post(
    `${GRAPH_API_BASE}/me/messages`,
    {
      recipient: { id: recipientIgsid },
      message: { text: messageText },
      messaging_type: 'RESPONSE',
    },
    {
      params: { access_token: PAGE_ACCESS_TOKEN },
      headers: { 'Content-Type': 'application/json' },
    }
  );

  console.log(`Welcome DM sent to ${recipientIgsid}:`, response.data);
  return response.data;
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Six Kingdoms Instagram bot listening on port ${PORT}`);
});
