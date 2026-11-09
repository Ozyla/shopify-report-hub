/* =====================================================
   SHOPIFY REPORT HUB
   Frontend prototype — demo data only
   ===================================================== */

const reportNames = [
  "Sales summary",
  "Orders report",
  "Sales by product",
  "Sales by variant",
  "Discount code performance",
  "Inventory on hand",
  "Low stock products",
  "Inventory by location",
  "Best selling products",
  "Never sold products",
  "Customer lifetime value",
  "Repeat customers",
  "New customers",
  "Customer orders",
  "Customers by location",
  "Profit summary",
  "Refund report",
  "Payment methods",
  "Taxes report",
  "Expenses report"
];

const storeData = {
  branded: {
    name: "Branded Cut Pieces",
    currency: "PKR",
    symbol: "Rs ",
    sales: 8425600,
    netSales: 7986200,
    orders: 1284,
    aov: 6559,
    products: [
      ["Embroidered Lawn Suit", 186, 1116000],
      ["Printed 3-Piece Suit", 142, 852000],
      ["Winter Khaddar Collection", 98, 784000]
    ]
  },
  branzzy: {
    name: "Branzzy",
    currency: "USD",
    symbol: "$",
    sales: 12480,
    netSales: 11750,
    orders: 186,
    aov: 67.10,
    products: [
      ["Baby Photo Frame", 42, 1260],
      ["Personalized Gift Box", 31, 930],
      ["Baby Milestone Frame", 24, 720]
    ]
  }
};

let currentStore = "all";
let selectedColumns = [
  "Customer name",
  "Customer ID",
  "Order count (Lifetime)",
  "Total spent (Lifetime)"
];

let activeFilters = [];
let currentPreviewRows = [];
let toastTimer = null;

/* =====================================================
   NAVIGATION
   ===================================================== */

function showPage(pageName) {
  const pages = document.querySelectorAll(".content");
  const navLinks = document.querySelectorAll("[data-page]");
  const pageTitle = document.getElementById("page-title");

  pages.forEach(page => {
    page.classList.toggle("hidden", page.id !== pageName);
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });

  const activeLink = document.querySelector(
    `[data-page="${pageName}"]`
  );

  if (pageTitle && activeLink) {
    pageTitle.textContent =
      activeLink.querySelector("span")?.textContent.trim() || pageName;
  }

  if (pageName === "builder") {
    renderSelectedColumns();
  }

  window.location.hash = pageName;
}

document.querySelectorAll("[data-page]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

window.addEventListener("hashchange", () => {
  const page = window.location.hash.replace("#", "");
  if (document.getElementById(page)) {
    showPage(page);
  }
});

const initialPage = window.location.hash.replace("#", "");
if (initialPage && document.getElementById(initialPage)) {
  showPage(initialPage);
}

/* =====================================================
   TOAST MESSAGE
   ===================================================== */

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* =====================================================
   STORE SWITCHING
   ===================================================== */

function changeStore(store) {
  if (!["all", "branded", "branzzy"].includes(store)) {
    return;
  }

  currentStore = store;

  const globalSelect = document.getElementById("global-store-select");
  const builderSelect = document.getElementById("builder-store-select");

  if (globalSelect) globalSelect.value = store;
  if (builderSelect) builderSelect.value = store;

  updateDashboard();
}

function updateDashboard() {
  const allStoresSummary = document.getElementById(
    "all-stores-currency-summary"
  );

  const currencyNote = document.getElementById(
    "currency-context-note"
  );

  const mainSales = document.getElementById("kpi-total-sales-main");
  const netSales = document.getElementById("kpi-net-sales");
  const orders = document.getElementById("kpi-orders");
  const aov = document.getElementById("kpi-aov");

  const topProducts = document.getElementById("top-products-body");

  document.body.classList.toggle(
    "all-stores-view",
    currentStore === "all"
  );

  document.body.classList.toggle(
    "single-store-view",
    currentStore !== "all"
  );

  if (allStoresSummary) {
    allStoresSummary.style.display =
      currentStore === "all" ? "" : "none";
  }

  if (currentStore === "all") {
    if (mainSales) mainSales.textContent = "See separate currencies";
    if (netSales) netSales.textContent = "PKR + USD separately";
    if (orders) orders.textContent = "1,470";
    if (aov) aov.textContent = "Separate store AOV";

    if (currencyNote) {
      currencyNote.textContent =
        "All stores are shown separately in their own currency. Amounts are never combined.";
    }

    if (topProducts) {
      topProducts.innerHTML = `
        <tr>
          <td><b>Branded Cut Pieces</b></td>
          <td>1,284 orders</td>
          <td>Rs 8,425,600</td>
        </tr>
        <tr>
          <td><b>Branzzy</b></td>
          <td>186 orders</td>
          <td>$12,480.00</td>
        </tr>
      `;
    }

    return;
  }

  const data = storeData[currentStore];
  if (!data) return;

  const money = value => {
    return data.symbol + Number(value).toLocaleString(
      "en-US",
      data.currency === "USD"
        ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        : { maximumFractionDigits: 0 }
    );
  };

  if (mainSales) mainSales.textContent = money(data.sales);
  if (netSales) netSales.textContent = money(data.netSales);
  if (orders) orders.textContent = data.orders.toLocaleString("en-US");
  if (aov) aov.textContent = money(data.aov);

  if (currencyNote) {
    currencyNote.textContent =
      `${data.name} · ${data.currency} · Illustrative sample data only.`;
  }

  if (topProducts) {
    topProducts.innerHTML = data.products.map((product, index) => `
      <tr>
        <td>
          <span class="product-thumb">${String.fromCharCode(65 + index)}</span>
          <b>${escapeHTML(product[0])}</b>
        </td>
        <td>${product[1]}</td>
        <td>${money(product[2])}</td>
      </tr>
    `).join("");
  }
}

const globalStoreSelect = document.getElementById("global-store-select");
const builderStoreSelect = document.getElementById("builder-store-select");

if (globalStoreSelect) {
  globalStoreSelect.addEventListener("change", event => {
    changeStore(event.target.value);
  });
}

if (builderStoreSelect) {
  builderStoreSelect.addEventListener("change", event => {
    changeStore(event.target.value);
  });
}

updateDashboard();

/* =====================================================
   HTML SAFETY HELPER
   ===================================================== */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[character];
  });
}

/* =====================================================
   AVAILABLE FIELD SELECTION
   ===================================================== */

const fieldSearch = document.getElementById("field-search");

function filterFields() {
  const search = (fieldSearch?.value || "").toLowerCase();

  document.querySelectorAll(".field-group").forEach(group => {
    let visibleFields = 0;

    group.querySelectorAll("label").forEach(label => {
      const matches = label.textContent.toLowerCase().includes(search);

      label.style.display = matches ? "" : "none";

      if (matches) visibleFields++;
    });

    group.style.display = visibleFields ? "" : "none";
  });
}

document.querySelectorAll(
  ".field-group label input[type='checkbox']"
).forEach(checkbox => {
  checkbox.addEventListener("change", () => {
    const label = checkbox.parentElement;
    const fieldName = label.textContent.trim();

    if (checkbox.checked) {
      if (!selectedColumns.includes(fieldName)) {
        selectedColumns.push(fieldName);
      }
    } else {
      selectedColumns = selectedColumns.filter(
        column => column !== fieldName
      );
    }

    renderSelectedColumns();
  });
});

/* =====================================================
   SELECTED COLUMNS
   ===================================================== */

function renderSelectedColumns() {
  const container = document.getElementById("selected-columns");
  if (!container) return;

  container.innerHTML = "";

  selectedColumns.forEach((column, index) => {
    const chip = document.createElement("div");

    chip.className = "column-chip";
    chip.draggable = true;
    chip.dataset.index = index;

    chip.innerHTML = `
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <span>${escapeHTML(column)}</span>
      <button type="button" aria-label="Remove column">×</button>
    `;

    chip.querySelector("button").addEventListener("click", () => {
      removeColumn(column);
    });

    chip.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", String(index));
      event.dataTransfer.effectAllowed = "move";
    });

    chip.addEventListener("dragover", event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });

    chip.addEventListener("drop", event => {
      event.preventDefault();

      const fromIndex = Number(
        event.dataTransfer.getData("text/plain")
      );

      const toIndex = Number(chip.dataset.index);

      if (
        Number.isInteger(fromIndex) &&
        Number.isInteger(toIndex) &&
        fromIndex !== toIndex
      ) {
        const moved = selectedColumns.splice(fromIndex, 1)[0];
        selectedColumns.splice(toIndex, 0, moved);

        renderSelectedColumns();
      }
    });

    container.appendChild(chip);
  });

  syncFieldCheckboxes();
}

function syncFieldCheckboxes() {
  document.querySelectorAll(
    ".field-group label input[type='checkbox']"
  ).forEach(checkbox => {
    const fieldName = checkbox.parentElement.textContent.trim();

    checkbox.checked = selectedColumns.includes(fieldName);
  });
}

function removeColumn(column) {
  selectedColumns = selectedColumns.filter(
    item => item !== column
  );

  renderSelectedColumns();
}

function addColumn() {
  const column = prompt(
    "Enter the name of your custom column:"
  );

  if (!column || !column.trim()) return;

  const cleanName = column.trim();

  if (selectedColumns.includes(cleanName)) {
    showToast("This column is already selected.");
    return;
  }

  selectedColumns.push(cleanName);
  renderSelectedColumns();

  showToast("Custom column added.");
}

/* =====================================================
   REPORT LIBRARY PRESETS
   ===================================================== */

const presetFields = {
  "Sales summary": [
    "Order date",
    "Order name",
    "Total sales",
    "Net sales",
    "Refunds"
  ],

  "Orders report": [
    "Order name",
    "Order date",
    "Customer name",
    "Financial status",
    "Fulfillment status",
    "Total sales"
  ],

  "Sales by product": [
    "Product title",
    "SKU",
    "Quantity",
    "Total sales"
  ],

  "Sales by variant": [
    "Product title",
    "SKU",
    "Variant",
    "Quantity",
    "Total sales"
  ],

  "Discount code performance": [
    "Discount code",
    "Order count",
    "Total sales"
  ],

  "Inventory on hand": [
    "Product title",
    "SKU",
    "Vendor",
    "Quantity"
  ],

  "Low stock products": [
    "Product title",
    "SKU",
    "Vendor",
    "Quantity"
  ],

  "Inventory by location": [
    "Product title",
    "SKU",
    "Location",
    "Quantity"
  ],

  "Best selling products": [
    "Product title",
    "SKU",
    "Quantity",
    "Total sales"
  ],

  "Never sold products": [
    "Product title",
    "SKU",
    "Vendor",
    "Quantity"
  ],

  "Customer lifetime value": [
    "Customer name",
    "Customer email",
    "Order count (Lifetime)",
    "Total spent (Lifetime)"
  ],

  "Repeat customers": [
    "Customer name",
    "Customer email",
    "Order count (Lifetime)",
    "Total spent (Lifetime)"
  ],

  "New customers": [
    "Customer name",
    "Customer email",
    "Customer city",
    "Order date"
  ],

  "Customer orders": [
    "Customer name",
    "Order name",
    "Order date",
    "Total sales"
  ],

  "Customers by location": [
    "Customer name",
    "Customer city",
    "Customer email",
    "Order count (Lifetime)"
  ],

  "Profit summary": [
    "Order date",
    "Total sales",
    "Refunds",
    "Cost of goods",
    "Gross profit"
  ],

  "Refund report": [
    "Order name",
    "Order date",
    "Customer name",
    "Refunds"
  ],

  "Payment methods": [
    "Order name",
    "Payment method",
    "Financial status",
    "Total sales"
  ],

  "Taxes report": [
    "Order name",
    "Order date",
    "Tax amount",
    "Total sales"
  ],

  "Expenses report": [
    "Expense date",
    "Expense category",
    "Description",
    "Expense amount"
  ]
};

function openPresetReport(reportName) {
  const heading = document.getElementById("designer-heading");
  const description = document.getElementById("designer-description");
  const reportInput = document.getElementById("report-name");

  if (heading) heading.textContent = reportName;
  if (description) {
    description.textContent =
      `Configure fields and filters for ${reportName}.`;
  }

  if (reportInput) reportInput.value = reportName;

  selectedColumns = [
    ...(presetFields[reportName] || ["Order name", "Order date"])
  ];

  activeFilters = [];

  renderSelectedColumns();
  renderFilters();
  showPage("builder");

  showToast(`${reportName} opened in Report Designer.`);
}

document.querySelectorAll(".report-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    openPresetReport(link.dataset.report);
  });
});

/* =====================================================
   FILTER BUILDER
   ===================================================== */

function getFilterPanel() {
  const panels = document.querySelectorAll("#builder .builder-work > .panel");

  return Array.from(panels).find(panel =>
    panel.querySelector(".text-btn")
  );
}

function renderFilters() {
  const panel = getFilterPanel();
  if (!panel) return;

  const oldRows = panel.querySelector(".filter-rows");
  if (oldRows) oldRows.remove();

  const addButton = panel.querySelector(".text-btn");
  if (!addButton) return;

  const rowsContainer = document.createElement("div");
  rowsContainer.className = "filter-rows";

  activeFilters.forEach((filter, index) => {
    const row = document.createElement("div");
    row.className = "form-row filter-row";

    row.innerHTML = `
      <label>Match
        <select data-key="logic">
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </label>
      <label>Filter field
        <select data-key="field">
          ${[
            "Customer name",
            "Customer email",
            "Order name",
            "Order date",
            "Financial status",
            "Fulfillment status",
            "Total sales",
            "Refunds",
            "Product title",
            "SKU",
            "Vendor",
            "Quantity"
          ].map(value =>
            `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
          ).join("")}
        </select>
      </label>
      <label>Condition
        <select data-key="condition">
          <option value="Is">Is</option>
          <option value="Is not">Is not</option>
          <option value="Contains">Contains</option>
          <option value="Greater than">Greater than</option>
          <option value="Less than">Less than</option>
          <option value="Is empty">Is empty</option>
          <option value="Is not empty">Is not empty</option>
        </select>
      </label>
      <label>Value
        <input data-key="value" placeholder="Enter value">
      </label>
      <button type="button" class="btn btn-light remove-filter">×</button>
    `;

    row.querySelectorAll("[data-key]").forEach(input => {
      input.value = filter[input.dataset.key] || "";
      input.addEventListener("change", () => {
        filter[input.dataset.key] = input.value;
      });
      input.addEventListener("input", () => {
        filter[input.dataset.key] = input.value;
      });
    });

    row.querySelector(".remove-filter").addEventListener("click", () => {
      activeFilters.splice(index, 1);
      renderFilters();
    });

    rowsContainer.appendChild(row);
  });

  panel.insertBefore(rowsContainer, addButton);
}

function addFilter() {
  activeFilters.push({
    logic: activeFilters.length ? "AND" : "AND",
    field: "Order date",
    condition: "Is",
    value: ""
  });

  renderFilters();
}

const filterPanel = getFilterPanel();

if (filterPanel) {
  const addFilterButton = filterPanel.querySelector(".text-btn");

  if (addFilterButton) {
    addFilterButton.addEventListener("click", addFilter);
  }
}

renderFilters();

/* =====================================================
   DEMO REPORT DATA
   ===================================================== */

function getDemoRows() {
  if (currentStore === "branzzy") {
    return [
      {
        "Customer name": "Sarah Ahmed",
        "Customer ID": "B-1001",
        "Customer email": "sarah@example.com",
        "Customer city": "New York",
        "Customer tags": "Returning",
        "Order name": "#BZ1001",
        "Order date": "2026-11-01",
        "Financial status": "Paid",
        "Fulfillment status": "Fulfilled",
        "Total sales": 125,
        "Refunds": 0,
        "Product title": "Baby Photo Frame",
        "SKU": "BPF-001",
        "Vendor": "Branzzy",
        "Quantity": 2
      },
      {
        "Customer name": "Ali Khan",
        "Customer ID": "B-1002",
        "Customer email": "ali@example.com",
        "Customer city": "Houston",
        "Customer tags": "New",
        "Order name": "#BZ1002",
        "Order date": "2026-11-03",
        "Financial status": "Paid",
        "Fulfillment status": "Unfulfilled",
        "Total sales": 75,
        "Refunds": 0,
        "Product title": "Personalized Gift Box",
        "SKU": "PGB-002",
        "Vendor": "Branzzy",
        "Quantity": 1
      },
      {
        "Customer name": "Emma Wilson",
        "Customer ID": "B-1003",
        "Customer email": "emma@example.com",
        "Customer city": "Chicago",
        "Customer tags": "Returning",
        "Order name": "#BZ1003",
        "Order date": "2026-11-05",
        "Financial status": "Refunded",
        "Fulfillment status": "Fulfilled",
        "Total sales": 95,
        "Refunds": 25,
        "Product title": "Baby Milestone Frame",
        "SKU": "BMF-003",
        "Vendor": "Branzzy",
        "Quantity": 1
      }
    ];
  }

  return [
    {
      "Customer name": "Ahmed Ali",
      "Customer ID": "C-1001",
      "Customer email": "ahmed@example.com",
      "Customer city": "Lahore",
      "Customer tags": "Returning",
      "Order name": "#BC1001",
      "Order date": "2026-11-01",
      "Financial status": "Paid",
      "Fulfillment status": "Fulfilled",
      "Total sales": 12500,
      "Refunds": 0,
      "Product title": "Embroidered Lawn Suit",
      "SKU": "ELS-001",
      "Vendor": "Branded Cut Piece",
      "Quantity": 2
    },
    {
      "Customer name": "Usman Khan",
      "Customer ID": "C-1002",
      "Customer email": "usman@example.com",
      "Customer city": "Karachi",
      "Customer tags": "New",
      "Order name": "#BC1002",
      "Order date": "2026-11-03",
      "Financial status": "Paid",
      "Fulfillment status": "Unfulfilled",
      "Total sales": 8500,
      "Refunds": 0,
      "Product title": "Printed 3-Piece Suit",
      "SKU": "PTS-002",
      "Vendor": "Branded Cut Piece",
      "Quantity": 1
    },
    {
      "Customer name": "Sara Ahmed",
      "Customer ID": "C-1003",
      "Customer email": "sara@example.com",
      "Customer city": "Islamabad",
      "Customer tags": "Returning",
      "Order name": "#BC1003",
      "Order date": "2026-11-05",
      "Financial status": "Refunded",
      "Fulfillment status": "Fulfilled",
      "Total sales": 15000,
      "Refunds": 2500,
      "Product title": "Winter Khaddar Collection",
      "SKU": "WKC-003",
      "Vendor": "Branded Cut Piece",
      "Quantity": 1
    },
    {
      "Customer name": "Bilal Ahmed",
      "Customer ID": "C-1004",
      "Customer email": "bilal@example.com",
      "Customer city": "Lahore",
      "Customer tags": "New",
      "Order name": "#BC1004",
      "Order date": "2026-11-07",
      "Financial status": "Paid",
      "Fulfillment status": "Fulfilled",
      "Total sales": 6200,
      "Refunds": 0,
      "Product title": "Embroidered Lawn Suit",
      "SKU": "ELS-001",
      "Vendor": "Branded Cut Piece",
      "Quantity": 1
    },
    {
      "Customer name": "Fatima Noor",
      "Customer ID": "C-1005",
      "Customer email": "fatima@example.com",
      "Customer city": "Multan",
      "Customer tags": "Returning",
      "Order name": "#BC1005",
      "Order date": "2026-11-08",
      "Financial status": "Paid",
      "Fulfillment status": "Unfulfilled",
      "Total sales": 9800,
      "Refunds": 0,
      "Product title": "Printed 3-Piece Suit",
      "SKU": "PTS-002",
      "Vendor": "Branded Cut Piece",
      "Quantity": 2
    }
  ];
}

function applyFilters(rows) {
  if (!activeFilters.length) return rows;

  return rows.filter(row => {
    let result = null;

    activeFilters.forEach(filter => {
      const actual = row[filter.field];
      const expected = filter.value;

      let match = true;

      switch (filter.condition) {
        case "Is":
          match = String(actual ?? "").toLowerCase() ===
            String(expected).toLowerCase();
          break;

        case "Is not":
          match = String(actual ?? "").toLowerCase() !==
            String(expected).toLowerCase();
          break;

        case "Contains":
          match = String(actual ?? "").toLowerCase().includes(
            String(expected).toLowerCase()
          );
          break;

        case "Greater than":
          match = Number(actual) > Number(expected);
          break;

        case "Less than":
          match = Number(actual) < Number(expected);
          break;

        case "Is empty":
          match = actual === null || actual === undefined || actual === "";
          break;

        case "Is not empty":
          match = actual !== null && actual !== undefined && actual !== "";
          break;
      }

      if (result === null) {
        result = match;
      } else if (filter.logic === "OR") {
        result = result || match;
      } else {
        result = result && match;
      }
    });

    return result === null ? true : result;
  });
}

/* =====================================================
   REPORT PREVIEW
   ===================================================== */

function previewReport() {
  if (!selectedColumns.length) {
    showToast("Please select at least one column.");
    return;
  }

  let rows = getDemoRows();
  rows = applyFilters(rows);

  currentPreviewRows = rows;

  const preview = document.querySelector(".preview");
  if (!preview) return;

  const empty = preview.querySelector(".empty-preview");
  if (empty) empty.remove();

  let tableWrap = preview.querySelector(".table-wrap");

  if (!tableWrap) {
    tableWrap = document.createElement("div");
    tableWrap.className = "table-wrap";
    preview.appendChild(tableWrap);
  }

  const headings = selectedColumns.map(column =>
    `<th>${escapeHTML(column)}</th>`
  ).join("");

  const body = rows.map(row => {
    const cells = selectedColumns.map(column => {
      const value = row[column] ?? "—";
      return `<td>${escapeHTML(value)}</td>`;
    }).join("");

    return `<tr>${cells}</tr>`;
  }).join("");

  tableWrap.innerHTML = `
    <table>
      <thead><tr>${headings}</tr></thead>
      <tbody>
        ${body || `<tr><td colspan="${selectedColumns.length}">
          No records match your filters.
        </td></tr>`}
      </tbody>
    </table>
    <p class="preview-note">
      Demo preview · ${rows.length} sample records · Not live Shopify data
    </p>
  `;

  showToast(`Preview generated: ${rows.length} sample records.`);
}

/* =====================================================
   SAVE REPORT
   ===================================================== */

function saveReport() {
  const nameInput = document.getElementById("report-name");
  const name = nameInput?.value.trim();

  if (!name) {
    showToast("Please enter a report name.");
    nameInput?.focus();
    return;
  }

  if (!selectedColumns.length) {
    showToast("Please select at least one column.");
    return;
  }

  const report = {
    id: Date.now(),
    name,
    store: document.getElementById("builder-store-select")?.value || "all",
    columns: [...selectedColumns],
    filters: activeFilters.map(filter => ({ ...filter })),
    savedAt: new Date().toISOString()
  };

  let savedReports = [];

  try {
    savedReports = JSON.parse(
      localStorage.getItem("shopifyReportHubSavedReports") || "[]"
    );
  } catch (error) {
    savedReports = [];
  }

  savedReports.push(report);

  localStorage.setItem(
    "shopifyReportHubSavedReports",
    JSON.stringify(savedReports)
  );

  showToast("Report definition saved in this browser.");
}

/* =====================================================
   CSV EXPORT
   ===================================================== */

function exportCSV() {
  if (!selectedColumns.length) {
    showToast("Select columns before exporting.");
    return;
  }

  const rows = currentPreviewRows.length
    ? currentPreviewRows
    : applyFilters(getDemoRows());

  const csvCell = value => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = [
    selectedColumns.map(csvCell).join(","),
    ...rows.map(row =>
      selectedColumns.map(column => csvCell(row[column] ?? "")).join(",")
    )
  ];

  const csv = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const reportName =
    document.getElementById("report-name")?.value || "shopify-report";

  link.href = url;
  link.download =
    reportName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Demo CSV file exported.");
}

/* =====================================================
   BUILDER ACTIONS
   ===================================================== */

// Add a Preview button to the report preview panel.
const previewPanel = document.querySelector(".preview");

if (previewPanel) {
  const panelHead = previewPanel.querySelector(".panel-head");

  if (panelHead) {
    const actions = document.createElement("div");
    actions.className = "preview-actions";

    actions.innerHTML = `
      <button type="button" class="btn btn-light" id="preview-report-btn">
        Preview report
      </button>
      <button type="button" class="btn btn-primary" id="export-report-btn">
        Export CSV
      </button>
    `;

    panelHead.appendChild(actions);
  }
}

document.getElementById("preview-report-btn")?.addEventListener(
  "click",
  previewReport
);

document.getElementById("export-report-btn")?.addEventListener(
  "click",
  exportCSV
);

// Make the existing Export button work as well.
document.querySelector(".preview .panel-head > .btn")?.addEventListener(
  "click",
  exportCSV
);

/* =====================================================
   INITIALIZATION
   ===================================================== */

renderSelectedColumns();
renderFilters();

console.log("Shopify Report Hub frontend loaded.");