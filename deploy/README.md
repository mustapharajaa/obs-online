# Deployment Guide

This project is designed for flexible deployment. The Node.js server can be run on any environment (local, private server, cloud provider), and the frontend can be served statically.

## Backend Configuration

All backend endpoint management is now handled dynamically through the **Backend Configuration Admin** page.

1.  Start the server (`npm start`).
2.  Open `public/backend-admin.html` in your browser.
3.  From this page, you can add, edit, and switch between different backend environments (e.g., Local, RDP, Staging, Production).

There is no longer a need to configure backend URLs in `.env` files or other code.
