# My-pet-shop

## Authentication setup

The login, signup verification, and password-reset flows use the Express server and PostgreSQL. Configure these values in the local `.env` file before starting the server:

```env
DATABASE_URL=postgresql://...
EMAIL_USER=your-gmail-address
EMAIL_PASS=your-gmail-app-password
JWT_SECRET=use-a-long-random-secret
PORT=3000
APP_URL=http://localhost:3000
```

`APP_URL` is optional for local testing; on deployment, set it to the public site URL so emailed reset links use the correct origin. For Gmail, use an app password. Do not commit `.env`.

Start the app with `npm start`, then test the flow in a browser:

1. Open `http://localhost:3000/login.html`, create an account, and verify it with the emailed 6-digit code.
2. Log in with that account and confirm the pet shop opens.
3. Open `http://localhost:3000/login.html` again, choose **Forgot Password?**, and request a reset link.
4. Open the link in the email, set and confirm a new password, then use **Back to Login**.
5. Log in using the new password.