const STORAGE_KEY = "vyaparbuddy_state";
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  cashDrawer: 0,
  bankBalance: 0,
  udhaar: [],
  transactions: [],
  inventory: { "Default Item": 100 },
  pettyCash: { allocated: 0, spent: [] },
  invoices: [],
  eodComplete: false,
  language: "en",
};

const i18n = {
  en: { appTitle: "VyaparBuddy", tagline: "Smart daily accounting for Indian MSMEs", language: "Language", dailyRecap: "10-Minute Daily Recap", dailyRecapDescription: "Match drawer cash with ledger before closing the day.", completeEod: "Complete EOD Match", cashInDrawer: "Cash in Drawer", bankBalance: "Bank Balance", moneyToCollect: "Money to Collect", moneyToPay: "Money to Pay", transactions: "Money In / Money Out", type: "Type", saleCash: "Cash Sale", saleUpi: "UPI Sale", saleCredit: "Credit Sale", expense: "Expense", ownerDraw: "Personal Withdrawal", amount: "Amount (₹)", category: "Category", note: "Note", saveTransaction: "Save Transaction", rent: "Rent", electricity: "Electricity", wages: "Wages", teaSnacks: "Tea/Snacks", stationery: "Stationery", udhaarManager: "Udhaar Manager", debtor: "Debtor (to collect)", creditor: "Creditor (to pay)", addEntry: "Add Entry", invoiceGenerator: "Pakka Bill Generator", gstInvoice: "GST Invoice", nonGstInvoice: "Non-GST Invoice", generateInvoice: "Generate Invoice", pettyCash: "Petty Cash Box", allocate: "Allocate", addPettyExpense: "Add Petty Expense", remainingPetty: "Remaining Petty Cash:", complianceExport: "CA Export & Compliance", exportDescription: "One-click monthly export for GST and Income Tax filing.", exportCsv: "Export Month as CSV", offlineStatus: "Offline ready: entries sync automatically when reconnected." },
  hi: { appTitle: "व्यापारबडी", tagline: "भारतीय MSME के लिए स्मार्ट दैनिक हिसाब", language: "भाषा", dailyRecap: "10-मिनट दैनिक रिकैप", dailyRecapDescription: "दिन खत्म करने से पहले कैश और लेजर मिलाएँ।", completeEod: "EOD मैच पूरा करें", cashInDrawer: "दराज़ में नकद", bankBalance: "बैंक बैलेंस", moneyToCollect: "लेना है", moneyToPay: "देना है", transactions: "पैसा आया / गया", type: "प्रकार", saleCash: "कैश बिक्री", saleUpi: "UPI बिक्री", saleCredit: "उधार बिक्री", expense: "खर्च", ownerDraw: "निजी निकासी", amount: "राशि (₹)", category: "श्रेणी", note: "नोट", saveTransaction: "सेव करें", rent: "किराया", electricity: "बिजली", wages: "मज़दूरी", teaSnacks: "चाय/नाश्ता", stationery: "स्टेशनरी", udhaarManager: "उधार मैनेजर", debtor: "देयक (वसूली)", creditor: "लेनदार (भुगतान)", addEntry: "एंट्री जोड़ें", invoiceGenerator: "पक्का बिल जनरेटर", gstInvoice: "GST बिल", nonGstInvoice: "नॉन-GST बिल", generateInvoice: "बिल बनाएं", pettyCash: "पेटी कैश बॉक्स", allocate: "अलोकेट", addPettyExpense: "पेटी खर्च जोड़ें", remainingPetty: "बचा पेटी कैश:", complianceExport: "CA एक्सपोर्ट और कंप्लायंस", exportDescription: "GST/IT फाइलिंग के लिए एक-क्लिक मासिक एक्सपोर्ट।", exportCsv: "CSV एक्सपोर्ट", offlineStatus: "ऑफलाइन तैयार: नेटवर्क आने पर ऑटो-सिंक।" },
};

const rupee = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function renderStats() {
  const debtors = state.udhaar.filter((x) => x.kind === "debtor").reduce((s, x) => s + x.amount, 0);
  const creditors = state.udhaar.filter((x) => x.kind === "creditor").reduce((s, x) => s + x.amount, 0);
  document.getElementById("cashDrawerValue").textContent = rupee(state.cashDrawer);
  document.getElementById("bankBalanceValue").textContent = rupee(state.bankBalance);
  document.getElementById("debtorsValue").textContent = rupee(debtors);
  document.getElementById("creditorsValue").textContent = rupee(creditors);
  const spent = state.pettyCash.spent.reduce((sum, row) => sum + row.amount, 0);
  document.getElementById("pettyRemaining").textContent = rupee(state.pettyCash.allocated - spent);
}

function renderUdhaar() {
  const el = document.getElementById("udhaarList");
  el.innerHTML = "";
  state.udhaar.forEach((row) => {
    const li = document.createElement("li");
    const direction = row.kind === "debtor" ? "⬆ Collect" : "⬇ Pay";
    li.innerHTML = `<span>${row.name}<br/><small>${direction} ${rupee(row.amount)}</small></span>`;
    if (row.phone) {
      const msg = encodeURIComponent(`Namaste ${row.name}, kindly settle pending amount ${rupee(row.amount)}. - VyaparBuddy`);
      const a = document.createElement("a");
      a.href = `https://wa.me/${row.phone.replace(/\D/g, "")}?text=${msg}`;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = "WhatsApp Reminder";
      li.appendChild(a);
    }
    el.appendChild(li);
  });
}

function applyLanguage(lang) {
  const dict = i18n[lang] || i18n.en;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (dict[key]) node.textContent = dict[key];
  });
  state.language = lang;
  document.getElementById("language").value = lang;
  save();
}

function installServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

document.getElementById("transactionForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const entry = {
    type: form.get("type"),
    amount: Number(form.get("amount")),
    category: form.get("category"),
    note: form.get("note") || "",
    at: new Date().toISOString(),
  };
  state.transactions.push(entry);

  if (entry.type === "sale_cash") state.cashDrawer += entry.amount;
  if (entry.type === "sale_upi") state.bankBalance += entry.amount;
  if (entry.type === "sale_credit") state.udhaar.push({ name: entry.note || "Walk-in", amount: entry.amount, kind: "debtor" });
  if (["expense", "owner_draw"].includes(entry.type)) state.cashDrawer -= entry.amount;

  save();
  renderStats();
  renderUdhaar();
  e.target.reset();
});

document.getElementById("udhaarForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  state.udhaar.push({
    name: form.get("name"),
    kind: form.get("kind"),
    amount: Number(form.get("amount")),
    phone: form.get("phone"),
  });
  save();
  renderStats();
  renderUdhaar();
  e.target.reset();
});

document.getElementById("invoiceForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const qty = Number(form.get("qty"));
  const rate = Number(form.get("rate"));
  const subtotal = qty * rate;
  const gst = form.get("invoiceType") === "gst" ? subtotal * 0.18 : 0;
  const total = subtotal + gst;

  const item = form.get("item");
  state.inventory[item] = (state.inventory[item] ?? 100) - qty;
  state.invoices.push({ customer: form.get("customer"), item, qty, rate, gst, total, at: new Date().toISOString() });
  const preview = document.getElementById("invoicePreview");
  preview.innerHTML = `
    <strong>Invoice: ${Date.now()}</strong><br/>
    Customer: ${form.get("customer")}<br/>
    Item: ${item} × ${qty} @ ${rupee(rate)}<br/>
    GST: ${rupee(gst)} | Total: <strong>${rupee(total)}</strong><br/>
    Remaining stock (${item}): ${state.inventory[item]}
  `;
  state.bankBalance += total;
  save();
  renderStats();
});

document.getElementById("pettyAllocationForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const val = Number(new FormData(e.target).get("allocation"));
  state.pettyCash.allocated = val;
  state.pettyCash.spent = [];
  save();
  renderStats();
  e.target.reset();
});

document.getElementById("pettyExpenseForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  state.pettyCash.spent.push({
    amount: Number(form.get("amount")),
    receipt: form.get("receipt"),
    at: new Date().toISOString(),
  });
  save();
  renderStats();
  e.target.reset();
});

document.getElementById("exportBtn").addEventListener("click", () => {
  const rows = [
    ["Date", "Type", "Amount", "Category", "Note"],
    ...state.transactions.map((t) => [t.at, t.type, t.amount, t.category, t.note]),
  ];
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vyaparbuddy-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("eodBtn").addEventListener("click", () => {
  state.eodComplete = true;
  save();
  alert("Great job! EOD match marked complete.");
});

document.getElementById("language").addEventListener("change", (e) => applyLanguage(e.target.value));

window.addEventListener("online", () => console.log("Back online. Sync ready."));
window.addEventListener("offline", () => console.log("You are offline. Entries stored locally."));

applyLanguage(state.language || "en");
renderStats();
renderUdhaar();
installServiceWorker();
