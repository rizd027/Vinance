/**
 * Google Apps Script for Vinance (KeluargaBerkah Finance)
 * Versi Lengkap: Mendukung Transaksi, Budget, Goals, dan Notes.
 * 
 * Cara Update di Google Apps Script:
 * 1. Hapus semua kode lama di Editor Apps Script.
 * 2. Tempel kode di bawah ini.
 * 3. Klik 'Deploy' -> 'New Deployment' (atau Edit deployment lama & pilih New Version).
 */

function doGet(e) {
  const action = e.parameter.action;
  const userId = e.parameter.userId;

  if (action === 'getData') {
    return handleGetData(userId);
  }

  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return createResponse({ error: 'Invalid JSON' });
  }

  const action = data.action;

  // Auth
  if (action === 'register') return handleRegister(data);
  if (action === 'login') return handleLogin(data);
  if (action === 'updateUser') return handleUpdateUser(data);
  if (action === 'sendUpdateCode') return handleSendUpdateCode(data);
  if (action === 'sendResetCode') return handleSendResetCode(data);
  if (action === 'resetPasswordWithCode') return handleResetPasswordWithCode(data);
  if (action === 'sendRegisterCode') return handleSendRegisterCode(data);
  if (action === 'verifyRegisterAndCreate') return handleVerifyRegisterAndCreate(data);

  // Transactions
  if (action === 'addTransaction') return handleAddTransaction(data);
  if (action === 'updateTransaction') return handleUpdateTransaction(data);
  if (action === 'deleteTransaction') return handleDeleteTransaction(data);

  // Budgets
  if (action === 'updateBudget') return handleUpdateBudget(data);
  if (action === 'deleteBudget') return handleDeleteBudget(data);

  // Goals (New)
  if (action === 'updateGoal') return handleUpdateGoal(data);
  if (action === 'deleteGoal') return handleDeleteGoal(data);

  // Notes (New)
  if (action === 'updateNote') return handleUpdateNote(data);
  if (action === 'deleteNote') return handleDeleteNote(data);

  // Feedback (New)
  if (action === 'sendFeedback') return handleSendFeedback(data);

  // Batch (New)
  if (action === 'batchAction') return handleBatchAction(data);

  return createResponse({ error: 'Invalid action' });
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === 'Users') {
      sheet.appendRow(['id', 'name', 'email', 'password', 'createdAt', 'photoUrl']);
    } else if (name === 'Transactions') {
      sheet.appendRow(['id', 'userId', 'type', 'category', 'amount', 'date', 'note']);
    } else if (name === 'Budgets') {
      sheet.appendRow(['id', 'userId', 'category', 'limit', 'period']);
    } else if (name === 'Goals') {
      sheet.appendRow(['id', 'userId', 'name', 'targetAmount', 'savedAmount', 'deadline', 'icon', 'color']);
    } else if (name === 'Notes') {
      sheet.appendRow(['id', 'userId', 'content', 'color', 'createdAt', 'updatedAt']);
    } else if (name === 'VerificationCodes') {
      sheet.appendRow(['email', 'code', 'expiresAt']);
    }
  }
  return sheet;
}

// --- AUTH HANDLERS ---
function handleRegister(data) {
  const sheet = getSheet('Users');
  const users = sheet.getDataRange().getValues();
  const existing = users.find(u => String(u[2]) === String(data.email));
  if (existing) return createResponse({ error: 'Email already registered' });

  const id = Utilities.getUuid();
  sheet.appendRow([id, data.name, data.email, data.password, new Date(), data.photoUrl || '']);
  return createResponse({ success: true, user: { id, name: data.name, email: data.email, photoUrl: data.photoUrl || '' } });
}

function handleLogin(data) {
  const sheet = getSheet('Users');
  const users = sheet.getDataRange().getValues();
  const user = users.find(u => String(u[2]) === String(data.email) && String(u[3]) === String(data.password));
  if (!user) return createResponse({ error: 'Invalid email or password' });

  return createResponse({
    success: true,
    user: { id: user[0], name: user[1], email: user[2], photoUrl: user[5] || '' }
  });
}

function handleUpdateUser(data) {
  const isSensitive = data.email || data.password;
  
  if (isSensitive) {
    if (!data.code) return createResponse({ error: 'Kode verifikasi diperlukan untuk merubah email/password.' });
    
    // Check code against current email
    const usersSheet = getSheet('Users');
    const usersRows = usersSheet.getDataRange().getValues();
    const currentUser = usersRows.find(u => u[0] === data.id);
    
    if (!currentUser) return createResponse({ error: 'User tidak ditemukan.' });
    
    const currentEmail = currentUser[2];
    if (!verifyCode(currentEmail, data.code)) {
      return createResponse({ error: 'Kode verifikasi salah atau kedaluwarsa.' });
    }
  }

  const sheet = getSheet('Users');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id) {
      if (data.name) sheet.getRange(i + 1, 2).setValue(data.name);
      if (data.email) sheet.getRange(i + 1, 3).setValue(data.email);
      if (data.password) sheet.getRange(i + 1, 4).setValue(data.password);
      if (data.photoUrl !== undefined) sheet.getRange(i + 1, 6).setValue(data.photoUrl);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'User not found' });
}

// Helper to verify code (generic)
function verifyCode(email, code) {
  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  const now = new Date().getTime();
  
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(email).toLowerCase() && String(rows[i][1]) === String(code)) {
      if (new Date(rows[i][2]).getTime() > now) {
        codeSheet.deleteRow(i + 1);
        return true;
      }
    }
  }
  return false;
}

function handleSendUpdateCode(data) {
  const usersSheet = getSheet('Users');
  const users = usersSheet.getDataRange().getValues();
  const user = users.find(u => String(u[2]).toLowerCase() === String(data.email).toLowerCase());

  if (!user) return createResponse({ error: 'Email tidak terdaftar.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  let foundIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(data.email).toLowerCase()) {
      foundIndex = i + 1;
      break;
    }
  }

  if (foundIndex > 0) {
    codeSheet.getRange(foundIndex, 2, 1, 2).setValues([[code, expiresAt]]);
  } else {
    codeSheet.appendRow([data.email.toLowerCase(), code, expiresAt]);
  }

  try {
    const subject = `[VINANCE] Kode Verifikasi Perubahan Profil: ${code}`;
    const body = `Halo ${user[1]},\n\nKami menerima permintaan untuk merubah email atau kata sandi akun Vinance Anda.\n\nKode verifikasi Anda adalah: ${code}\n\nMasukkan kode ini di aplikasi untuk mengonfirmasi perubahan. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.\n\nSalam,\nTim Vinance`;

    GmailApp.sendEmail(data.email, subject, body, {
      name: "Vinance Security"
    });

    return createResponse({ success: true });
  } catch (err) {
    return createResponse({ error: 'Gagal mengirim email: ' + err.message });
  }
}

function handleSendResetCode(data) {
  const usersSheet = getSheet('Users');
  const users = usersSheet.getDataRange().getValues();
  const user = users.find(u => String(u[2]).toLowerCase() === String(data.email).toLowerCase());

  if (!user) return createResponse({ error: 'Email tidak terdaftar.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  let foundIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(data.email).toLowerCase()) {
      foundIndex = i + 1;
      break;
    }
  }

  if (foundIndex > 0) {
    codeSheet.getRange(foundIndex, 2, 1, 2).setValues([[code, expiresAt]]);
  } else {
    codeSheet.appendRow([data.email.toLowerCase(), code, expiresAt]);
  }

  try {
    const subject = `[VINANCE] Kode Verifikasi Reset Kata Sandi: ${code}`;
    const body = `Halo ${user[1]},\n\nAnda telah meminta pengaturan ulang kata sandi untuk akun Vinance Anda.\n\nKode verifikasi Anda adalah: ${code}\n\nKode ini akan kedaluwarsa dalam 10 menit.\n\nSalam,\nTim Vinance`;

    // Gunakan GmailApp dengan nama pengirim kustom
    GmailApp.sendEmail(data.email, subject, body, {
      name: "Vinance Security"
    });

    return createResponse({ success: true });
  } catch (err) {
    return createResponse({ error: 'Gagal mengirim email: ' + err.message });
  }
}

function handleSendRegisterCode(data) {
  const usersSheet = getSheet('Users');
  const users = usersSheet.getDataRange().getValues();
  const existing = users.find(u => String(u[2]).toLowerCase() === String(data.email).toLowerCase());

  if (existing) return createResponse({ error: 'Email sudah terdaftar. Silakan masuk.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(new Date().getTime() + 10 * 60000); // 10 minutes

  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  let foundIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(data.email).toLowerCase()) {
      foundIndex = i + 1;
      break;
    }
  }

  if (foundIndex > 0) {
    codeSheet.getRange(foundIndex, 2, 1, 2).setValues([[code, expiresAt]]);
  } else {
    codeSheet.appendRow([data.email.toLowerCase(), code, expiresAt]);
  }

  try {
    const subject = `[VINANCE] Kode Verifikasi Pendaftaran Akun: ${code}`;
    const body = `Halo!\n\nTerima kasih telah memilih Vinance.\n\nKode verifikasi pendaftaran Anda adalah: ${code}\n\nMasukkan kode ini di aplikasi untuk menyelesaikan pendaftaran akun Anda.\n\nSalam,\nTim Vinance`;

    GmailApp.sendEmail(data.email, subject, body, {
      name: "Vinance Team"
    });

    return createResponse({ success: true });
  } catch (err) {
    return createResponse({ error: 'Gagal mengirim email verifikasi: ' + err.message });
  }
}

function handleVerifyRegisterAndCreate(data) {
  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  let codeRow = null;
  let codeIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(data.email).toLowerCase()) {
      codeRow = rows[i];
      codeIndex = i + 1;
      break;
    }
  }

  if (!codeRow || String(codeRow[1]) !== String(data.code)) {
    return createResponse({ error: 'Kode verifikasi salah.' });
  }

  if (new Date() > new Date(codeRow[2])) {
    return createResponse({ error: 'Kode verifikasi telah kedaluwarsa.' });
  }

  // Code valid, create user
  const sheet = getSheet('Users');
  const users = sheet.getDataRange().getValues();
  const existing = users.find(u => String(u[2]).toLowerCase() === String(data.email).toLowerCase());
  if (existing) return createResponse({ error: 'Email sudah terdaftar.' });

  const id = Utilities.getUuid();
  sheet.appendRow([id, data.name, data.email.toLowerCase(), data.password, new Date(), '']);

  codeSheet.deleteRow(codeIndex); // Clean up

  return createResponse({
    success: true,
    user: { id, name: data.name, email: data.email, photoUrl: '' }
  });
}

function handleResetPasswordWithCode(data) {
  const codeSheet = getSheet('VerificationCodes');
  const rows = codeSheet.getDataRange().getValues();
  let codeRow = null;
  let codeIndex = -1;

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).toLowerCase() === String(data.email).toLowerCase()) {
      codeRow = rows[i];
      codeIndex = i + 1;
      break;
    }
  }

  if (!codeRow || String(codeRow[1]) !== String(data.code)) {
    return createResponse({ error: 'Kode verifikasi salah.' });
  }

  if (new Date() > new Date(codeRow[2])) {
    return createResponse({ error: 'Kode verifikasi telah kedaluwarsa.' });
  }

  // Code is valid, update user password
  const usersSheet = getSheet('Users');
  const users = usersSheet.getDataRange().getValues();
  let userIndex = -1;
  for (let i = 1; i < users.length; i++) {
    if (String(users[i][2]).toLowerCase() === String(data.email).toLowerCase()) {
      userIndex = i + 1;
      break;
    }
  }

  if (userIndex > 0) {
    usersSheet.getRange(userIndex, 4).setValue(data.newPassword);
    codeSheet.deleteRow(codeIndex); // Clean up
    return createResponse({ success: true });
  }

  return createResponse({ error: 'User tidak ditemukan.' });
}

// --- DATA FETCHING ---
function handleGetData(userId) {
  if (!userId) return createResponse({ error: 'User ID required' });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Helper to get values safely
  const getValues = (name) => {
    const s = ss.getSheetByName(name);
    return s ? s.getDataRange().getValues().slice(1) : [];
  };

  const transactions = getValues('Transactions')
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], type: row[2], category: row[3], amount: row[4], date: row[5], note: row[6] }));

  const budgets = getValues('Budgets')
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], category: row[2], limit: row[3], period: row[4] }));

  const goals = getValues('Goals')
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], name: row[2], targetAmount: row[3], savedAmount: row[4], deadline: row[5], icon: row[6], color: row[7] }));

  const notes = getValues('Notes')
    .filter(row => row[1] === userId)
    .map(row => ({ id: row[0], userId: row[1], content: row[2], color: row[3], createdAt: row[4], updatedAt: row[5] }));

  return createResponse({ success: true, transactions, budgets, goals, notes });
}

// --- TRANSACTION HANDLERS ---
function handleAddTransaction(data) {
  const sheet = getSheet('Transactions');
  const id = Utilities.getUuid();
  sheet.appendRow([id, data.userId, data.type, data.category, data.amount, data.date || new Date(), data.note || '']);
  return createResponse({ success: true, id });
}

function handleUpdateTransaction(data) {
  const sheet = getSheet('Transactions');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.getRange(i + 1, 3, 1, 5).setValues([[data.type, data.category, data.amount, data.date, data.note]]);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleDeleteTransaction(data) {
  const sheet = getSheet('Transactions');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

// --- BUDGET HANDLERS ---
function handleUpdateBudget(data) {
  const sheet = getSheet('Budgets');
  const rows = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.userId && rows[i][2] === data.category) {
      sheet.getRange(i + 1, 4).setValue(data.limit);
      found = true; break;
    }
  }
  if (!found) sheet.appendRow([Utilities.getUuid(), data.userId, data.category, data.limit, 'Month']);
  return createResponse({ success: true });
}

function handleDeleteBudget(data) {
  const sheet = getSheet('Budgets');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][1] === data.userId && rows[i][2] === data.category) {
      sheet.deleteRow(i + 1);
      return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

// --- GOAL HANDLERS ---
function handleUpdateGoal(data) {
  const sheet = getSheet('Goals');
  const rows = sheet.getDataRange().getValues();
  let foundIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      foundIndex = i + 1; break;
    }
  }
  const vals = [data.id, data.userId, data.name, data.targetAmount, data.savedAmount, data.deadline || '', data.icon, data.color];
  if (foundIndex > 0) sheet.getRange(foundIndex, 1, 1, 8).setValues([vals]);
  else sheet.appendRow(vals);
  return createResponse({ success: true });
}

function handleDeleteGoal(data) {
  const sheet = getSheet('Goals');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1); return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

// --- NOTE HANDLERS ---
function handleUpdateNote(data) {
  const sheet = getSheet('Notes');
  const rows = sheet.getDataRange().getValues();
  let foundIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      foundIndex = i + 1; break;
    }
  }
  const vals = [data.id, data.userId, data.content, data.color, data.createdAt, data.updatedAt];
  if (foundIndex > 0) sheet.getRange(foundIndex, 1, 1, 6).setValues([vals]);
  else sheet.appendRow(vals);
  return createResponse({ success: true });
}

function handleDeleteNote(data) {
  const sheet = getSheet('Notes');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.id && rows[i][1] === data.userId) {
      sheet.deleteRow(i + 1); return createResponse({ success: true });
    }
  }
  return createResponse({ error: 'Not found' });
}

function handleSendFeedback(data) {
  try {
    MailApp.sendEmail({
      to: 'alfarizd027@gmail.com',
      subject: '[FEEDBACK] KeluargaBerkah Finance',
      htmlBody: '<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">' +
                '<h2>Saran & Masukan Baru</h2>' +
                '<p><strong>Dari:</strong> ' + data.userName + ' (' + data.userId + ')</p>' +
                '<p><strong>Pesan:</strong></p>' +
                '<div style="background:#f9fafb;padding:15px;border-radius:8px;border-left:4px solid #059669;">' +
                data.feedback.replace(/\n/g, '<br>') +
                '</div>' +
                '</div>'
    });
    return createResponse({ success: true });
  } catch (err) {
    return createResponse({ error: 'Gagal mengirim feedback: ' + err.message });
  }
}
function handleBatchAction(data) {
  const operations = data.operations;
  const results = [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  operations.forEach(op => {
    const action = op.action;
    try {
      let res = { success: false };
      
      if (action === 'addTransaction') {
        const id = op.id || Utilities.getUuid();
        ss.getSheetByName('Transactions').appendRow([id, op.userId, op.type, op.category, op.amount, op.date || new Date(), op.note || '']);
        res = { success: true, id };
      } 
      else if (action === 'updateTransaction') {
        const sheet = ss.getSheetByName('Transactions');
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === op.id && rows[i][1] === op.userId) {
            sheet.getRange(i + 1, 3, 1, 5).setValues([[op.type, op.category, op.amount, op.date, op.note]]);
            res = { success: true }; break;
          }
        }
      }
      else if (action === 'deleteTransaction') {
        const sheet = ss.getSheetByName('Transactions');
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === op.id && rows[i][1] === op.userId) {
            sheet.deleteRow(i + 1); res = { success: true }; break;
          }
        }
      }
      else if (action === 'updateBudget') {
        const sheet = ss.getSheetByName('Budgets');
        const rows = sheet.getDataRange().getValues();
        let found = false;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][1] === op.userId && rows[i][2] === op.category) {
            sheet.getRange(i + 1, 4).setValue(op.limit);
            found = true; res = { success: true }; break;
          }
        }
        if (!found) {
          sheet.appendRow([Utilities.getUuid(), op.userId, op.category, op.limit, 'Month']);
          res = { success: true };
        }
      }
      else if (action === 'updateGoal') {
        const sheet = ss.getSheetByName('Goals');
        const rows = sheet.getDataRange().getValues();
        let foundIdx = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === op.id && rows[i][1] === op.userId) {
            foundIdx = i + 1; break;
          }
        }
        const vals = [op.id, op.userId, op.name, op.targetAmount, op.savedAmount, op.deadline || '', op.icon, op.color];
        if (foundIdx > 0) sheet.getRange(foundIdx, 1, 1, 8).setValues([vals]);
        else sheet.appendRow(vals);
        res = { success: true };
      }
      else if (action === 'deleteGoal') {
        const sheet = ss.getSheetByName('Goals');
        const rows = sheet.getDataRange().getValues();
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === op.id && rows[i][1] === op.userId) {
            sheet.deleteRow(i + 1); res = { success: true }; break;
          }
        }
      }
      else if (action === 'updateNote') {
        const sheet = ss.getSheetByName('Notes');
        const rows = sheet.getDataRange().getValues();
        let foundIdx = -1;
        for (let i = 1; i < rows.length; i++) {
          if (rows[i][0] === op.id && rows[i][1] === op.userId) {
            foundIdx = i + 1; break;
          }
        }
        const vals = [op.id, op.userId, op.content, op.color, op.createdAt, op.updatedAt];
        if (foundIdx > 0) sheet.getRange(foundIdx, 1, 1, 6).setValues([vals]);
        else sheet.appendRow(vals);
        res = { success: true };
      }

      results.push(res);
    } catch (err) {
      results.push({ success: false, error: err.message });
    }
  });

  return createResponse({ success: true, results });
}
