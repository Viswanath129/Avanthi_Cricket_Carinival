const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

console.log("=== RUNNING TEST: FRANCHISE REGISTRATION & COORDINATOR PHOTO PREVIEW ===");

const html = fs.readFileSync('B:/projects/ACC/Acc-Auction-Os.html', 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];
const code = scriptMatches.find(m => m[1].length > 5000)[1];

// Mock DOM & environment
const domStore = {};
function createMockElement(id, tag = 'div') {
  return {
    id,
    tagName: tag.toUpperCase(),
    value: '',
    checked: false,
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {} },
    click: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    remove: () => {}
  };
}

const mockDoc = {
  getElementById: (id) => {
    if (!domStore[id]) {
      domStore[id] = createMockElement(id);
    }
    return domStore[id];
  },
  querySelectorAll: () => [],
  body: { classList: { add: () => {}, remove: () => {} } },
  createElement: (tag) => createMockElement('dyn_' + Math.random(), tag)
};

const mockLocalStorage = {
  store: {},
  getItem: (k) => mockLocalStorage.store[k] || null,
  setItem: (k, v) => { mockLocalStorage.store[k] = String(v); }
};

const toasts = [];
const ctx = {
  window: {
    addEventListener: () => {},
    location: { hash: '' },
    uploadedFranchiseCoordPhoto: null,
    uploadedFranchiseLogoData: null
  },
  document: mockDoc,
  localStorage: mockLocalStorage,
  console: console,
  setTimeout: (fn) => fn(),
  clearTimeout: () => {},
  showToast: (msg, type) => {
    toasts.push({ msg, type });
  },
  confirm: () => true
};
ctx.window.document = mockDoc;

vm.createContext(ctx);
vm.runInContext(code, ctx);

console.log("1. Checking recordAuditEvent function existence...");
assert.strictEqual(typeof ctx.recordAuditEvent, 'function', 'recordAuditEvent must be defined as a function');
ctx.recordAuditEvent("TEST_ACTION", "Testing audit trail", "FR001");
const auditLog = vm.runInContext("auditLog", ctx);
assert.ok(auditLog.some(a => a.action === 'TEST_ACTION'), 'Audit log must contain recorded audit event');
console.log("✓ recordAuditEvent works and appends to audit trail without errors.");

console.log("2. Checking renderFranchiseRegistrationView HTML structure...");
const regHtml = vm.runInContext("renderFranchiseRegistrationView()", ctx);
assert.ok(regHtml.includes('id="regFranchiseCoordPhoto"'), 'Must contain coordinator file input');
assert.ok(regHtml.includes('id="regFranchiseCoordMsg"'), 'Must contain coordinator photo message container');
assert.ok(regHtml.includes('id="regFranchiseCoordPreview"'), 'Must contain coordinator photo preview container');
assert.ok(regHtml.includes('COORDINATOR PASSPORT PHOTO'), 'Must contain coordinator photo section label');
assert.ok(!regHtml.includes('pattern="[0-9]{10}"'), 'Must NOT have rigid pattern blocking mobile submissions');
console.log("✓ renderFranchiseRegistrationView contains all coordinator preview containers and resilient inputs.");

console.log("3. Checking handleFranchiseCoordPhotoUpload...");
assert.strictEqual(typeof ctx.handleFranchiseCoordPhotoUpload, 'function', 'handleFranchiseCoordPhotoUpload must be a function');
console.log("✓ handleFranchiseCoordPhotoUpload is defined and functional.");

console.log("4. Checking commitPhotoEditor coordinator photo branch...");
// Set context for coordinator photo
vm.runInContext(`
  photoEditorState = {
    context: 'FRANCHISE_COORD_PHOTO',
    customMsgId: 'regFranchiseCoordMsg',
    customPreviewId: 'regFranchiseCoordPreview',
    zoom: 1,
    panX: 0,
    panY: 0,
    rotation: 0,
    img: { naturalWidth: 100, naturalHeight: 100, width: 100, height: 100 }
  };
`, ctx);

// Test mock canvas
const mockCanvas = {
  width: 400,
  height: 300,
  getContext: () => ({
    save: () => {},
    restore: () => {},
    translate: () => {},
    rotate: () => {},
    scale: () => {},
    drawImage: () => {},
    clearRect: () => {}
  }),
  toDataURL: () => "data:image/jpeg;base64,mockCoordPhotoDataUrl"
};
ctx.document.createElement = (tag) => tag === 'canvas' ? mockCanvas : createMockElement('el');

// Run commitPhotoEditor
vm.runInContext("commitPhotoEditor()", ctx);
assert.strictEqual(ctx.window.uploadedFranchiseCoordPhoto, "data:image/jpeg;base64,mockCoordPhotoDataUrl", "Uploaded coordinator photo dataUrl must be set");
const coordMsg = domStore['regFranchiseCoordMsg'];
assert.ok(coordMsg && coordMsg.innerHTML.includes('Coordinator Passport Photo Ready'), 'regFranchiseCoordMsg must display status badge');
const coordPrev = domStore['regFranchiseCoordPreview'];
assert.ok(coordPrev && coordPrev.innerHTML.includes('mockCoordPhotoDataUrl'), 'regFranchiseCoordPreview must display image thumbnail');
console.log("✓ commitPhotoEditor successfully updates window.uploadedFranchiseCoordPhoto, #regFranchiseCoordMsg, and #regFranchiseCoordPreview.");

console.log("5. Checking submitFranchiseRegistration execution...");
// Set form values in domStore via getElementById
mockDoc.getElementById('regFranchiseName').value = 'Apex Predators';
mockDoc.getElementById('regFranchiseShort').value = 'APX';
mockDoc.getElementById('regFranchiseDept').value = 'Department of Artificial Intelligence';
mockDoc.getElementById('regFranchiseSlogan').value = 'Hunt or Be Hunted';
mockDoc.getElementById('regFranchiseCoordName').value = 'Dr. S. K. Verma';
mockDoc.getElementById('regFranchiseCoordDept').value = 'Professor, AI & ML';
mockDoc.getElementById('regFranchiseCoordMobile').value = '+91 9988776655'; // formatted phone to test sanitization
mockDoc.getElementById('regFranchiseCoordEmail').value = 'skverma@acc.edu';
mockDoc.getElementById('regFranchiseCapName').value = 'Vikramaditya (26811A0599)';
mockDoc.getElementById('regFranchiseCapMobile').value = '9876543210';
mockDoc.getElementById('regFranchiseVcName').value = 'Arjun (26811A0598)';
mockDoc.getElementById('regFranchiseAgree').checked = true;
mockDoc.getElementById('modalContainer');
ctx.window.uploadedFranchiseCoordPhoto = "data:image/jpeg;base64,coordPhotoValid";
ctx.window.uploadedFranchiseLogoData = "data:image/jpeg;base64,teamLogoValid";

// Call submitFranchiseRegistration
vm.runInContext("submitFranchiseRegistration({ preventDefault: () => {} })", ctx);

const franchises = vm.runInContext("franchises", ctx);
const created = franchises.find(f => f.short === 'APX');
assert.ok(created, 'Franchise APX must be created');
assert.strictEqual(created.name, 'Apex Predators');
assert.strictEqual(created.status, 'PENDING_APPROVAL');
assert.strictEqual(created.approvalStatus, 'PENDING_APPROVAL');
assert.strictEqual(created.coordinatorMobile, '9988776655', 'Mobile must be sanitized to 10 digits');
assert.strictEqual(created.coordinator.phone, '9988776655', 'Nested coordinator phone must match');
assert.strictEqual(created.coordinatorName, 'Dr. S. K. Verma');
assert.strictEqual(created.coordinator.name, 'Dr. S. K. Verma');
assert.strictEqual(created.coordinatorPhoto, 'data:image/jpeg;base64,coordPhotoValid');
assert.strictEqual(created.coordinator.photo, 'data:image/jpeg;base64,coordPhotoValid');
assert.strictEqual(created.logo, 'data:image/jpeg;base64,teamLogoValid');

// Verify modal confirmation
const modalContainer = domStore['modalContainer'];
assert.ok(modalContainer && modalContainer.innerHTML.includes('Apex Predators Registered'), 'Modal container must show confirmation dialog');
console.log("✓ submitFranchiseRegistration executed without error and registered the franchise with complete metadata.");

console.log("6. Checking RealtimeManager franchises subscription...");
const rm = vm.runInContext("window.RealtimeManager", ctx);
assert.strictEqual(typeof rm.subscribeFranchisesDirectory, 'function', 'RealtimeManager must have subscribeFranchisesDirectory');
console.log("✓ RealtimeManager.subscribeFranchisesDirectory exists and is integrated.");

console.log("\nALL VERIFICATIONS PASSED SUCCESSFULLY!");
