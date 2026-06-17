// site.js - The Hi Vis Bookkeeper

const SB_URL = "https://jflnfffopeadpslkwgxr.supabase.co";
const SB_KEY = "sb_publishable_YG0FITJXJ5BLUltqX4nAMw_xGFGvCuZ";

// Toggle mobile navigation
function toggleNav() {
  document.getElementById('navlinks').classList.toggle('open');
}

// Open login modal
function openLogin(e) {
  if (e) e.preventDefault();
  document.getElementById('loginModal').classList.add('open');
}

// Close login modal
function closeLogin() {
  document.getElementById('loginModal').classList.remove('open');
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLogin();
});

// Close mobile nav when link clicked
document.querySelectorAll('#navlinks a').forEach(function(a) {
  a.addEventListener('click', function() {
    document.getElementById('navlinks').classList.remove('open');
  });
});

// Submit enquiry form to Supabase
async function submitEnquiry(e) {
  e.preventDefault();
  var form = e.target;
  var status = form.querySelector('.form-status');
  var btn = form.querySelector('button[type=submit]');
  var fd = new FormData(form);

  // Honeypot check
  if (fd.get('company_website')) {
    return;
  }

  var name = (fd.get('fullname') || '').trim();
  var email = (fd.get('email') || '').trim();

  if (!name || !email) {
    status.className = 'form-status err';
    status.textContent = 'Please add your name and email so we can reply.';
    return;
  }

  var payload = {
    name: name,
    email: email,
    phone: (fd.get('phone') || '').trim() || null,
    business_name: (fd.get('business') || '').trim() || null,
    service_interest: (fd.get('service') || '').trim() || null,
    message: (fd.get('message') || '').trim() || null,
    page_source: form.dataset.source || 'unknown'
  };

  btn.disabled = true;
  btn.style.opacity = 0.7;
  status.className = 'form-status';
  status.textContent = '';

  try {
    var res = await fetch(SB_URL + '/rest/v1/website_enquiries', {
      method: 'POST',
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      form.reset();
      status.className = 'form-status ok';
      status.textContent = "Thanks! Your enquiry is in. We'll be in touch very soon.";
    } else {
      throw new Error('Request failed: ' + res.status);
    }
  } catch (err) {
    status.className = 'form-status err';
    status.innerHTML = 'Sorry, something went wrong. Please email <a href="mailto:hello@hivisbooks.co.uk">hello@hivisbooks.co.uk</a>.';
  } finally {
    btn.disabled = false;
    btn.style.opacity = 1;
  }
}
