const STORAGE_KEY = 'barangay_complaints_v1';

// Default sample records
const DEFAULT_COMPLAINTS = [
  {
    id: 'BRGY-101',
    complainant: 'Maria Santos',
    category: 'Noise Disturbance',
    location: 'Purok 2, Mabini St.',
    description: 'Loud videoke past 11:00 PM on a weekday affecting nearby households.',
    status: 'In Progress',
    remarks: 'Barangay Tanod dispatched for verbal warning and monitoring.',
    date: '2026-11-15 09:30 AM'
  },
  {
    id: 'BRGY-102',
    complainant: 'Anonymous Resident',
    category: 'Waste Disposal',
    location: 'Purok 4, Corner Narra Ave.',
    description: 'Uncollected garbage bags piled near the basketball court drainage.',
    status: 'Pending',
    remarks: 'Awaiting scheduled barangay utility pickup.',
    date: '2026-11-16 02:15 PM'
  },
  {
    id: 'BRGY-103',
    complainant: 'Roberto Reyes',
    category: 'Infrastructure / Public Works',
    location: 'Purok 1, Rizal Extension',
    description: 'Busted streetlamp near the pedestrian crossing causing poor visibility at night.',
    status: 'Resolved',
    remarks: 'LED bulb replaced by Barangay Maintenance Team.',
    date: '2026-11-12 04:45 PM'
  }
];

let complaints = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [...DEFAULT_COMPLAINTS];
let isAdminLoggedIn = false;

function saveComplaints() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

// Portal Navigation
function switchPortal(portal) {
  const residentView = document.getElementById('resident-view');
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const tabResident = document.getElementById('tab-resident');
  const tabAdmin = document.getElementById('tab-admin');

  if (portal === 'resident') {
    residentView.classList.remove('hidden');
    loginView.classList.add('hidden');
    dashboardView.classList.add('hidden');
    tabResident.classList.add('active');
    tabAdmin.classList.remove('active');
  } else {
    residentView.classList.add('hidden');
    tabResident.classList.remove('active');
    tabAdmin.classList.add('active');

    if (isAdminLoggedIn) {
      loginView.classList.add('hidden');
      dashboardView.classList.remove('hidden');
      renderAdminRecords();
    } else {
      loginView.classList.remove('hidden');
      dashboardView.classList.add('hidden');
    }
  }
}

// Anonymous Toggle
document.getElementById('anonymous-toggle').addEventListener('change', function (e) {
  const nameInput = document.getElementById('complainant');
  if (e.target.checked) {
    nameInput.value = 'Anonymous Resident';
    nameInput.disabled = true;
  } else {
    nameInput.value = '';
    nameInput.disabled = false;
  }
});

// Resident Submit Form
document.getElementById('complaint-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const nextNum = 101 + complaints.length;
  const newId = `BRGY-${nextNum}`;
  const now = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const newReport = {
    id: newId,
    complainant: document.getElementById('complainant').value.trim(),
    category: document.getElementById('category').value,
    location: document.getElementById('location').value.trim(),
    description: document.getElementById('description').value.trim(),
    status: 'Pending',
    remarks: 'Received by system. Awaiting barangay staff review.',
    date: now
  };

  complaints.unshift(newReport);
  saveComplaints();

  document.getElementById('generated-id').textContent = newId;
  document.getElementById('receipt-banner').classList.remove('hidden');
  document.getElementById('track-input').value = newId;

  this.reset();
  document.getElementById('complainant').disabled = false;
});

function copyTrackingId() {
  const idText = document.getElementById('generated-id').textContent;
  navigator.clipboard.writeText(idText);
  alert(`Copied ${idText} to clipboard.`);
}

// Resident Track Lookup
function trackComplaint() {
  const query = document.getElementById('track-input').value.trim().toUpperCase();
  const resultBox = document.getElementById('track-result');
  const found = complaints.find(item => item.id.toUpperCase() === query);

  resultBox.classList.remove('hidden');

  if (!found) {
    resultBox.innerHTML = `<p class="error-text">No complaint record found for ID "<strong>${query}</strong>".</p>`;
    return;
  }

  resultBox.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
      <strong>${found.id} • ${found.category}</strong>
      ${getStatusBadge(found.status)}
    </div>
    <p class="record-meta">Location: ${found.location} • Submitted: ${found.date}</p>
    <p class="record-desc">${found.description}</p>
    <div style="background:#F8FAFC; padding:12px; border-radius:10px; border:1px solid #E2E8F0; font-size:0.85rem;">
      <strong>Barangay Remarks:</strong> ${found.remarks || 'No remarks yet.'}
    </div>
  `;
}

// Admin Authentication
function autofillAdmin() {
  document.getElementById('admin-user').value = 'admin';
  document.getElementById('admin-pass').value = 'barangay2026';
}

document.getElementById('login-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const user = document.getElementById('admin-user').value.trim();
  const pass = document.getElementById('admin-pass').value.trim();
  const errorMsg = document.getElementById('login-error');

  if (user === 'admin' && pass === 'barangay2026') {
    isAdminLoggedIn = true;
    errorMsg.classList.add('hidden');
    switchPortal('admin');
  } else {
    errorMsg.classList.remove('hidden');
  }
});

function logoutAdmin() {
  isAdminLoggedIn = false;
  document.getElementById('login-form').reset();
  switchPortal('admin');
}

// Admin Dashboard Rendering & Updates
function getStatusBadge(status) {
  if (status === 'Resolved') return `<span class="badge badge-resolved">Resolved</span>`;
  if (status === 'In Progress') return `<span class="badge badge-progress">In Progress</span>`;
  return `<span class="badge badge-pending">Pending</span>`;
}

function renderAdminRecords() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const catFilter = document.getElementById('filter-category').value;
  const statusFilter = document.getElementById('filter-status').value;

  // Update summary counters
  document.getElementById('stat-total').textContent = complaints.length;
  document.getElementById('stat-pending').textContent = complaints.filter(c => c.status === 'Pending').length;
  document.getElementById('stat-progress').textContent = complaints.filter(c => c.status === 'In Progress').length;
  document.getElementById('stat-resolved').textContent = complaints.filter(c => c.status === 'Resolved').length;

  const filtered = complaints.filter(c => {
    const matchesSearch =
      c.id.toLowerCase().includes(search) ||
      c.complainant.toLowerCase().includes(search) ||
      c.location.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search);
    const matchesCat = catFilter === 'All' || c.category === catFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const container = document.getElementById('records-list');

  if (filtered.length === 0) {
    container.innerHTML = `<div class="card"><p class="subtitle">No matching complaint records found.</p></div>`;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="record-item">
      <div class="record-header">
        <div>
          <strong>${item.id}</strong> • <span>${item.category}</span>
        </div>
        ${getStatusBadge(item.status)}
      </div>
      <div class="record-meta">
        Reported by <strong>${item.complainant}</strong> at ${item.location} • ${item.date}
      </div>
      <p class="record-desc">${item.description}</p>
      <div class="admin-controls">
        <select id="status-${item.id}">
          <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="In Progress" ${item.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${item.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <input type="text" id="remarks-${item.id}" value="${item.remarks || ''}" placeholder="Add official barangay remarks..." />
        <button type="button" class="btn btn-primary btn-sm" onclick="updateRecord('${item.id}')">Save Update</button>
      </div>
    </div>
  `).join('');
}

function updateRecord(id) {
  const record = complaints.find(c => c.id === id);
  if (!record) return;

  record.status = document.getElementById(`status-${id}`).value;
  record.remarks = document.getElementById(`remarks-${id}`).value.trim();

  saveComplaints();
  renderAdminRecords();
  alert(`Updated record ${id}.`);
}

function resetDemoData() {
  if (confirm('Restore default sample records?')) {
    complaints = [...DEFAULT_COMPLAINTS];
    saveComplaints();
    renderAdminRecords();
  }
}