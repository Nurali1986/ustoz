/**
 * Portfolio sayt formasidan kelgan murojaatlarni "Murojaatlar" varag'iga yozadi.
 * O'rnatish: Google Sheets > Kengaytmalar > Apps Script > shu kodni joylashtiring >
 * Joylashtirish (Deploy) > Yangi joylashtirish > Veb-ilova:
 *   - "Kim nomidan ishlaydi": Men
 *   - "Kimda kirish huquqi bor": Hamma (Anyone)
 * Berilgan /exec havolasini saytdagi assets/js/main.js faylidagi CONFIG.sheetUrl ga qo'ying.
 */
const SHEET_NAME = 'Murojaatlar';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    // Bot himoyasi: yashirin "website" maydoni to'ldirilgan bo'lsa, yozilmaydi
    if (p.website) return json({ ok: true });

    const name = clean(p.name, 100);
    // Telefon ustuni "Oddiy matn" formatida, shuning uchun raqam o'zgarmasdan saqlanadi
    const phone = String(p.phone || '').replace(/[^\d+ ()-]/g, '').trim().slice(0, 30);
    if (!name || phone.replace(/\D/g, '').length < 9) {
      return json({ ok: false, error: 'invalid' });
    }

    const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
    sheet.appendRow([
      new Date(),
      clean(p.topic, 60),
      name,
      phone,
      clean(p.biz, 120),
      clean(p.rev, 60),
      clean(p.msg, 2000),
      'Yangi',
      '',
      ''
    ]);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Formula sifatida o'qilmasligi uchun "=", "+", "-", "@" bilan boshlangan matnga apostrof qo'shiladi
function clean(v, max) {
  let s = String(v || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
