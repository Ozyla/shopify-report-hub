function showPage(page){document.querySelectorAll('.content').forEach(x=>x.classList.add('hidden'));const target=document.getElementById(page);if(target)target.classList.remove('hidden');document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.dataset.page===page));const titles={dashboard:'Dashboard',reports:'Report Library',builder:'Custom Report Builder',stores:'Stores',products:'Products & Inventory',customers:'Customers',schedules:'Schedules',settings:'Settings'};const title=document.getElementById('page-title');if(title)title.textContent=titles[page]||'Dashboard';window.location.hash=page}
document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();showPage(a.dataset.page)}));
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2600)}
function addColumn(){const name=prompt('Enter the column name (example: First order date)');if(!name)return;const el=document.createElement('div');el.className='column-chip';el.textContent=name+' ';const b=document.createElement('button');b.textContent='×';b.onclick=()=>el.remove();el.appendChild(b);document.getElementById('selected-columns').appendChild(el)}
function saveReport(){const name=document.getElementById('report-name')?.value.trim()||'Untitled report';toast('Prototype: "'+name+'" is ready to save when backend is connected.')}
function filterFields(){const q=document.getElementById('field-search').value.toLowerCase();document.querySelectorAll('.field-group label').forEach(x=>x.style.display=x.textContent.toLowerCase().includes(q)?'block':'none')}
const storeDemoData={
 branded:{name:'Branded Cut Pieces',currency:'PKR',total:'Rs 8,425,600',net:'Rs 7,986,200',orders:'1,284',aov:'Rs 6,559',yMax:'10M',channel:[72,18,10],products:[['A','Embroidered Lawn Suit',186,'Rs 1,116,000'],['B','Printed 3-Piece Suit',142,'Rs 852,000'],['C','Winter Khaddar Collection',98,'Rs 784,000']],activity:'Branded Cut Pieces · demo activity'},
 branzzy:{name:'Branzzy',currency:'USD',total:'$12,480.00',net:'$11,920.00',orders:'186',aov:'$67.31',yMax:'15K',channel:[64,26,10],products:[['B','Baby Photo Frame',54,'$3,240.00'],['C','Personalized Gift Set',38,'$2,660.00'],['A','Keepsake Frame',27,'$1,890.00']],activity:'Branzzy · demo activity'}
};
function updateProducts(rows){const body=document.getElementById('top-products-body');if(!body)return;body.innerHTML=rows.map(([letter,name,qty,sales],i)=>`<tr><td><span class="product-thumb ${i===1?'pink':i===2?'gold':''}">${letter}</span><b>${name}</b></td><td>${qty}</td><td>${sales}</td></tr>`).join('')}
function changeStore(key){const note=document.getElementById('currency-context-note');const summary=document.getElementById('all-stores-currency-summary');const builder=document.getElementById('builder-store-select');if(builder&&builder.value!==key)builder.value=key;
 if(key==='all'){document.body.classList.add('all-stores-view');document.body.classList.remove('single-store-view');if(note)note.textContent='All stores selected. Each store is shown separately; currencies are never added or converted.';return}
 const s=storeDemoData[key];if(!s)return;document.body.classList.remove('all-stores-view');document.body.classList.add('single-store-view');
 const values={'kpi-total-sales-main':s.total,'kpi-net-sales':s.net,'kpi-orders':s.orders,'kpi-aov':s.aov};Object.entries(values).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});
 const channelOrders=document.getElementById('channel-orders');if(channelOrders)channelOrders.textContent=s.orders;
 [['channel-online',s.channel[0]+'%'],['channel-social',s.channel[1]+'%'],['channel-other',s.channel[2]+'%']].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v});
 const donut=document.getElementById('sales-donut');if(donut){const a=s.channel[0],b=a+s.channel[1];donut.style.background=`conic-gradient(#3978e8 0 ${a}%,#9271d8 ${a}% ${b}%,#e9a65c ${b}% 100%)`}
 updateProducts(s.products);const chartLabels=document.querySelectorAll('.y-labels span');if(chartLabels.length){chartLabels[0].textContent=s.yMax;chartLabels[1].textContent=key==='branzzy'?'11.25K':'7.5M';chartLabels[2].textContent=key==='branzzy'?'7.5K':'5M';chartLabels[3].textContent=key==='branzzy'?'3.75K':'2.5M'}
 const activity=document.querySelector('.activity-item small');if(activity)activity.textContent=s.activity;
 if(note)note.textContent='Showing '+s.currency+' for '+s.name+'. Demo figures only; live Shopify data will replace these after integration.';
}
const builderStore=document.getElementById('builder-store-select');if(builderStore)builderStore.addEventListener('change',()=>{const top=document.getElementById('global-store-select');if(top)top.value=builderStore.value;changeStore(builderStore.value)});
if(location.hash&&document.getElementById(location.hash.slice(1)))showPage(location.hash.slice(1));const initial=document.getElementById('global-store-select');changeStore(initial?initial.value:'all');


// Ready-made Report Library actions: open the designer with a sensible field preset.
const reportPresets = {
  'Sales summary': ['Order date','Order name','Gross sales','Discounts','Refunds','Net sales','Taxes','Total sales'],
  'Orders report': ['Order name','Order date','Customer name','Financial status','Fulfillment status','Total sales'],
  'Sales by product': ['Product title','SKU','Quantity sold','Gross sales','Net sales'],
  'Sales by variant': ['Product title','Variant title','SKU','Quantity sold','Net sales'],
  'Discount code performance': ['Discount code','Orders','Discount amount','Net sales'],
  'Inventory on hand': ['Product title','SKU','Variant title','Available quantity','Committed quantity','Location'],
  'Low stock products': ['Product title','SKU','Available quantity','Reorder threshold','Location'],
  'Inventory by location': ['Location','Product title','SKU','Available quantity'],
  'Best selling products': ['Product title','SKU','Quantity sold','Net sales'],
  'Never sold products': ['Product title','SKU','Created at','Available quantity'],
  'Customer lifetime value': ['Customer name','Customer email','Orders count (lifetime)','Total spent (lifetime)','First order date','Last order date'],
  'Repeat customers': ['Customer name','Customer email','Orders count (lifetime)','Total spent (lifetime)'],
  'New customers': ['Customer name','Customer email','Created at','First order date'],
  'Customer orders': ['Customer name','Customer email','Order name','Order date','Total sales'],
  'Customers by location': ['Customer name','City','Province/State','Country','Orders count (lifetime)'],
  'Profit summary': ['Gross sales','Discounts','Refunds','Net sales','COGS','Shipping expense','Gateway fees','Gross profit','Net profit'],
  'Refund report': ['Order name','Refund date','Customer name','Refund amount','Reason'],
  'Payment methods': ['Payment gateway','Orders','Gross sales','Gateway fees','Net payout'],
  'Taxes report': ['Order name','Order date','Tax name','Tax rate','Tax amount','Country/Region'],
  'Expenses report': ['Expense date','Expense category','Description','Amount','Store']
};
function openPresetReport(reportName) {
  const fields = reportPresets[reportName] || ['Order date','Order name','Customer name','Total sales'];
  const heading = document.getElementById('designer-heading');
  const description = document.getElementById('designer-description');
  const nameInput = document.getElementById('report-name');
  const selected = document.getElementById('selected-columns');
  if (heading) heading.textContent = reportName + ' — Report Designer';
  if (description) description.textContent = 'Customize columns, filters, sorting and date range for ' + reportName + '.';
  if (nameInput) nameInput.value = reportName;
  if (selected) {
    selected.innerHTML = '';
    fields.forEach(field => {
      const chip = document.createElement('div');
      chip.className = 'column-chip';
      chip.append(document.createTextNode(field + ' '));
      const remove = document.createElement('button');
      remove.type = 'button'; remove.textContent = '×';
      remove.setAttribute('aria-label', 'Remove ' + field);
      remove.addEventListener('click', () => chip.remove());
      chip.appendChild(remove); selected.appendChild(chip);
    });
  }
  showPage('builder');
  toast('Opened ' + reportName + ' in Report Designer');
}
document.querySelectorAll('.report-link[data-report]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    openPresetReport(link.dataset.report);
  });
});
