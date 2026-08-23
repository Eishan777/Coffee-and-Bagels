document.addEventListener('DOMContentLoaded', () => {
  const CAFE_WHATSAPP_NUMBER = "918708123306";

  // Minimum date = today
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Party size selector
  let party = 2;
  const partyChips = document.querySelectorAll('.party-chip');
  partyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      partyChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      party = parseInt(chip.dataset.val, 10);
    });
  });

  // Step state management
  const panels = {
    details: document.getElementById('panelDetails'),
    otp: document.getElementById('panelOtp'),
    confirm: document.getElementById('panelConfirm'),
    success: document.getElementById('panelSuccess'),
  };

  function showPanel(name) {
    Object.values(panels).forEach(p => { if (p) p.classList.remove('active'); });
    if (panels[name]) panels[name].classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setStep(stepNum) {
    for (let i = 1; i <= 3; i++) {
      const dot = document.getElementById('dot' + i);
      if (!dot) continue;
      dot.classList.remove('active', 'done');
      if (i < stepNum) dot.classList.add('done');
      else if (i === stepNum) dot.classList.add('active');
    }
    const line1 = document.getElementById('line1');
    const line2 = document.getElementById('line2');
    if (line1) line1.classList.toggle('done', stepNum > 1);
    if (line2) line2.classList.toggle('done', stepNum > 2);
  }

  // Reservation data store
  let reservation = {};

  function clearError(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.remove('error');
  }
  function setError(fieldId) {
    const el = document.getElementById(fieldId);
    if (el) el.classList.add('error');
  }

  const detailsForm = document.getElementById('panelDetails');
  if (detailsForm) {
    detailsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;

      ['f-name', 'f-phone', 'f-date', 'f-time'].forEach(clearError);

      if (!name) { setError('f-name'); valid = false; }
      if (!/^[6-9]\d{9}$/.test(phone)) { setError('f-phone'); valid = false; }
      if (!date) { setError('f-date'); valid = false; }
      if (!time) { setError('f-time'); valid = false; }

      if (!valid) return;

      reservation = {
        name, phone, date, time, party,
        notes: document.getElementById('notes').value.trim()
      };

      const phoneDisp = document.getElementById('otpPhoneDisplay');
      if (phoneDisp) phoneDisp.textContent = '+91 ' + phone;

      // Dispatch Server-side OTP
      const sent = await requestServerOtp(phone);
      if (sent) {
        setStep(2);
        showPanel('otp');
      }
    });
  }

  // OTP Logic: Server API Communication
  const otpBoxes = document.querySelectorAll('.otp-box');
  const demoOtpCode = document.getElementById('demoOtpCode');
  const otpError = document.getElementById('otpError');
  const resendBtn = document.getElementById('resendBtn');
  const resendTimer = document.getElementById('resendTimer');

  async function requestServerOtp(phone) {
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to send OTP.');
        return false;
      }

      if (demoOtpCode && data.demoOtp) {
        demoOtpCode.textContent = data.demoOtp;
      }
      otpBoxes.forEach(b => b.value = '');
      if (otpBoxes[0]) otpBoxes[0].focus();
      startResendCountdown();
      return true;
    } catch (err) {
      alert('Error connecting to backend OTP server.');
      return false;
    }
  }

  function startResendCountdown() {
    let secs = 30;
    if (resendBtn) resendBtn.disabled = true;
    if (resendTimer) resendTimer.textContent = ' (' + secs + 's)';
    const timer = setInterval(() => {
      secs--;
      if (secs > 0) {
        if (resendTimer) resendTimer.textContent = ' (' + secs + 's)';
      } else {
        clearInterval(timer);
        if (resendBtn) resendBtn.disabled = false;
        if (resendTimer) resendTimer.textContent = '';
      }
    }, 1000);
  }

  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      if (reservation.phone) {
        requestServerOtp(reservation.phone);
        if (otpError) otpError.classList.remove('show');
      }
    });
  }

  // OTP Box Auto-focus Navigation
  otpBoxes.forEach((box, idx) => {
    box.addEventListener('input', (e) => {
      const v = e.target.value.replace(/\D/g, '');
      box.value = v.slice(0, 1);
      if (box.value && idx < otpBoxes.length - 1) {
        otpBoxes[idx + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && idx > 0) {
        otpBoxes[idx - 1].focus();
      }
    });
  });

  // Verify OTP Button via Server API
  const verifyBtn = document.getElementById('verifyBtn');
  if (verifyBtn) {
    verifyBtn.addEventListener('click', async () => {
      const entered = [...otpBoxes].map(b => b.value).join('');
      if (entered.length < 4) {
        if (otpError) {
          otpError.textContent = 'Enter all 4 digits.';
          otpError.classList.add('show');
        }
        return;
      }

      try {
        const res = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: reservation.phone, otp: entered })
        });
        const data = await res.json();
        if (!res.ok) {
          if (otpError) {
            otpError.textContent = data.error || 'Incorrect OTP code.';
            otpError.classList.add('show');
          }
          return;
        }

        if (otpError) otpError.classList.remove('show');
        buildSummary();
        setStep(3);
        showPanel('confirm');
      } catch (err) {
        alert('Server verification error.');
      }
    });
  }

  const backToDetails = document.getElementById('backToDetails');
  if (backToDetails) backToDetails.addEventListener('click', () => { setStep(1); showPanel('details'); });

  const backToOtp = document.getElementById('backToOtp');
  if (backToOtp) backToOtp.addEventListener('click', () => { setStep(2); showPanel('otp'); });

  function buildSummary() {
    const list = document.getElementById('summaryList');
    if (!list) return;
    const prettyDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const rows = [
      ['Name', reservation.name],
      ['Phone', '+91 ' + reservation.phone],
      ['Date', prettyDate],
      ['Time', reservation.time],
      ['Party size', reservation.party + (reservation.party === 1 ? ' guest' : ' guests')],
      ['Notes', reservation.notes || '—'],
    ];
    list.innerHTML = rows.map(([label, value]) =>
      `<div class="summary-row"><span class="label">${label}</span><span class="value">${value}</span></div>`
    ).join('');
  }

  // Send WhatsApp to 8708123306 & Save to SQLite REST API
  const sendWhatsapp = document.getElementById('sendWhatsapp');
  if (sendWhatsapp) {
    sendWhatsapp.addEventListener('click', async () => {
      // 1. Save to SQLite database via REST API
      try {
        await fetch('/api/reservations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: reservation.name,
            phone: reservation.phone,
            date: reservation.date,
            time: reservation.time,
            party_size: reservation.party,
            notes: reservation.notes
          })
        });
      } catch (err) {
        console.error('Error saving reservation to database:', err);
      }

      // 2. Launch WhatsApp to 8708123306 & show success panel
      const prettyDate = new Date(reservation.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      const message =
        "Hi Coffee&Bagels! I'd like to reserve a table.\n\n" +
        "Name: " + reservation.name + "\n" +
        "Phone: +91 " + reservation.phone + "\n" +
        "Date: " + prettyDate + "\n" +
        "Time: " + reservation.time + "\n" +
        "Party size: " + reservation.party + "\n" +
        "Notes: " + (reservation.notes || "—") + "\n\n" +
        "(Verified via server OTP)";
      const url = "https://wa.me/" + CAFE_WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
      window.open(url, '_blank');
      showPanel('success');
    });
  }
});
