<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reset Password - Pets World</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Arial, sans-serif; }
  body { background: #fff0f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; }
  .box { background: white; width: 100%; max-width: 380px; padding: 28px 22px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
  .box h2 { text-align: center; margin-bottom: 6px; }
  .box p { text-align: center; font-size: 13px; color: #666; margin-bottom: 16px; }
  #rpMsg { min-height: 18px; font-size: 13px; }
  label { display: block; font-size: 13px; font-weight: bold; margin: 12px 0 6px; }
  input { width: 100%; padding: 14px 16px; border: 1px solid #ddd; border-radius: 10px; font-size: 15px; }
  button { width: 100%; padding: 14px; margin-top: 18px; background: #ff5c8a; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; }
  button:disabled { opacity: 0.6; }
  .back { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: #ff5c8a; text-decoration: none; }
</style>
</head>
<body>
<div class="box">
  <h2>Set New Password</h2>
  <p>Enter your new password below</p>
  <p id="rpMsg"></p>
  <label>New password *</label>
  <input id="newPass" type="password" placeholder="New password">
  <label>Confirm password *</label>
  <input id="confirmPass" type="password" placeholder="Confirm password">
  <button id="proceedBtn">Proceed</button>
  <a class="back" href="/login.html">Back to Login</a>
</div>
<script>
const params = new URLSearchParams(location.search);
const email = params.get('email');
const token = params.get('token');
const msg = document.getElementById('rpMsg');
if (!email || !token) { msg.style.color = 'red'; msg.innerText = 'Invalid reset link. Please request a new one from Login.'; }

document.getElementById('proceedBtn').onclick = async () => {
  const newPassword = document.getElementById('newPass').value;
  const confirmPassword = document.getElementById('confirmPass').value;
  const btn = document.getElementById('proceedBtn');
  if (newPassword !== confirmPassword) { msg.style.color='red'; msg.innerText='Passwords do not match'; return; }
  btn.disabled = true; btn.innerText = 'Updating...';
  try {
    const r = await fetch('/api/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, token, newPassword, confirmPassword}) });
    const d = await r.json();
    msg.style.color = d.success ? 'green' : 'red';
    msg.innerText = d.message || d.error;
    if (d.success) setTimeout(()=> location.href='/login.html', 1500);
    else { btn.disabled = false; btn.innerText = 'Proceed'; }
  } catch(e) { msg.style.color='red'; msg.innerText='Network error. Try again.'; btn.disabled=false; btn.innerText='Proceed'; }
};
</script>
</body>
</html>
