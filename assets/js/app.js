(() => {
  'use strict';

  const STORAGE_KEY = 'smartpos:portfolio:v2';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const h = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const moneyNum = value => Number(value || 0);
  const dateKey = value => {
    const d = value ? new Date(value) : new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const isoDaysAgo = (days, hour = 10, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  const views = {
    dashboard: ['Dashboard', 'Business overview and daily performance.'],
    pos: ['Point of Sale', 'Fast checkout, payments, discounts and held orders.'],
    products: ['Products', 'Manage your catalog, pricing and product availability.'],
    inventory: ['Inventory', 'Monitor stock levels and every inventory movement.'],
    transactions: ['Transactions', 'Review receipts, payment methods and transaction status.'],
    customers: ['Customers', 'Track shoppers and their purchase history.'],
    suppliers: ['Suppliers', 'Maintain vendor records for future purchasing workflows.'],
    reports: ['Reports', 'Analyze revenue, profit, products and payment performance.'],
    settings: ['Settings', 'Customize business details and manage demo data.']
  };

  function seedData() {
    const products = [
      {id:'p1',sku:'PROD-001',barcode:'4800012345678',name:'Coca-Cola 1.5L',category:'Beverages',unit:'bottle',cost:55,price:75,stock:24,reorder:10,status:'active'},
      {id:'p2',sku:'PROD-002',barcode:'4800098765432',name:'Pepsi 1.5L',category:'Beverages',unit:'bottle',cost:50,price:70,stock:18,reorder:10,status:'active'},
      {id:'p3',sku:'PROD-003',barcode:'4800044400012',name:'Bottled Water 500ml',category:'Beverages',unit:'bottle',cost:8,price:15,stock:60,reorder:20,status:'active'},
      {id:'p4',sku:'PROD-004',barcode:'4800004441009',name:'Sliced Bread',category:'Bakery',unit:'loaf',cost:30,price:45,stock:12,reorder:8,status:'active'},
      {id:'p5',sku:'PROD-005',barcode:'4800022290001',name:'Fresh Milk 1L',category:'Dairy',unit:'carton',cost:60,price:90,stock:2,reorder:10,status:'active'},
      {id:'p6',sku:'PROD-006',barcode:'4800077700014',name:'Premium Rice 5kg',category:'Grocery',unit:'bag',cost:180,price:230,stock:15,reorder:5,status:'active'},
      {id:'p7',sku:'PROD-007',barcode:'4800033300025',name:'Instant Coffee 100g',category:'Grocery',unit:'pack',cost:110,price:145,stock:4,reorder:10,status:'active'},
      {id:'p8',sku:'PROD-008',barcode:'4800055500048',name:'White Sugar 1kg',category:'Grocery',unit:'bag',cost:48,price:65,stock:0,reorder:10,status:'active'},
      {id:'p9',sku:'PROD-009',barcode:'4800066600033',name:'Potato Chips',category:'Snacks',unit:'pack',cost:22,price:35,stock:30,reorder:12,status:'active'},
      {id:'p10',sku:'PROD-010',barcode:'4800088800011',name:'Dishwashing Liquid',category:'Household',unit:'bottle',cost:35,price:52,stock:16,reorder:8,status:'active'},
      {id:'p11',sku:'PROD-011',barcode:'4800011100111',name:'Chocolate Cookies',category:'Snacks',unit:'pack',cost:28,price:42,stock:22,reorder:10,status:'active'},
      {id:'p12',sku:'PROD-012',barcode:'4800022200222',name:'Instant Noodles',category:'Grocery',unit:'pack',cost:12,price:18,stock:44,reorder:20,status:'active'},
      {id:'p13',sku:'PROD-013',barcode:'4800033300333',name:'Bath Soap',category:'Personal Care',unit:'bar',cost:24,price:35,stock:19,reorder:8,status:'active'},
      {id:'p14',sku:'PROD-014',barcode:'4800044400444',name:'Tissue Roll 4-Pack',category:'Household',unit:'pack',cost:46,price:69,stock:11,reorder:8,status:'active'}
    ];

    const customers = [
      {id:'c1',name:'Walk-in Customer',phone:'',email:'',createdAt:isoDaysAgo(90)},
      {id:'c2',name:'Mika Santos',phone:'0917 555 0132',email:'mika@example.com',createdAt:isoDaysAgo(40)},
      {id:'c3',name:'Paolo Reyes',phone:'0918 555 0194',email:'paolo@example.com',createdAt:isoDaysAgo(25)},
      {id:'c4',name:'Anne Cruz',phone:'0920 555 0101',email:'anne@example.com',createdAt:isoDaysAgo(12)}
    ];

    const suppliers = [
      {id:'s1',name:'Metro Wholesale Trading',contact:'Carlo Lim',phone:'0917 800 1122',email:'orders@metrowholesale.example',category:'Grocery & Beverages',status:'active'},
      {id:'s2',name:'Freshway Distribution',contact:'Nina Flores',phone:'0918 811 2200',email:'sales@freshway.example',category:'Dairy & Bakery',status:'active'},
      {id:'s3',name:'HomePlus Supply Co.',contact:'Ramon Uy',phone:'0919 833 3300',email:'hello@homeplus.example',category:'Household',status:'active'}
    ];

    const p = id => products.find(x => x.id === id);
    let seq = 101;
    const sale = (daysAgo, itemSpec, cashier, payment, customerId='c1', discount=0, status='completed') => {
      const items = itemSpec.map(([id, qty]) => {
        const pr = p(id);
        return {productId:id,name:pr.name,sku:pr.sku,qty,price:pr.price,cost:pr.cost,subtotal:pr.price*qty};
      });
      const subtotal = items.reduce((a,i)=>a+i.subtotal,0);
      const total = Math.max(0, subtotal-discount);
      const createdAt = isoDaysAgo(daysAgo, 9 + (seq%8), (seq*7)%55);
      return {id:uid('sale'),txnNo:`TXN-${dateKey(createdAt).replaceAll('-','')}-${seq++}`,createdAt,cashier,payment,customerId,items,subtotal,discount,tax:0,total,amountReceived:payment==='Cash'?Math.ceil(total/100)*100:total,change:payment==='Cash'?Math.ceil(total/100)*100-total:0,status};
    };

    const sales = [
      sale(0,[['p1',2],['p4',1]],'Jamie Cruz','Cash','c2'),
      sale(0,[['p5',1],['p7',1]],'Alex Dela Cruz','GCash','c1',10),
      sale(0,[['p9',3],['p3',2]],'Jamie Cruz','Cash','c3'),
      sale(0,[['p6',1]],'Jamie Cruz','Card','c1'),
      sale(1,[['p12',8],['p3',4]],'Jamie Cruz','Cash','c4'),
      sale(1,[['p11',3],['p13',2]],'Alex Dela Cruz','Maya','c1'),
      sale(2,[['p1',4],['p10',2]],'Jamie Cruz','GCash','c2'),
      sale(2,[['p6',2],['p8',2]],'Alex Dela Cruz','Cash','c1'),
      sale(3,[['p4',2],['p9',5],['p11',2]],'Jamie Cruz','Cash','c3'),
      sale(4,[['p2',4],['p3',6]],'Jamie Cruz','Card','c1'),
      sale(5,[['p7',2],['p12',10]],'Alex Dela Cruz','GCash','c4'),
      sale(6,[['p14',3],['p10',2],['p13',2]],'Jamie Cruz','Cash','c1')
    ];

    const inventoryMovements = [
      {id:uid('mov'),productId:'p1',type:'Stock In',qty:40,reason:'Opening stock',createdAt:isoDaysAgo(10),user:'Alex Dela Cruz'},
      {id:uid('mov'),productId:'p5',type:'Adjustment',qty:-2,reason:'Damaged cartons',createdAt:isoDaysAgo(2),user:'Alex Dela Cruz'},
      {id:uid('mov'),productId:'p7',type:'Adjustment',qty:-1,reason:'Store use',createdAt:isoDaysAgo(1),user:'Alex Dela Cruz'},
      {id:uid('mov'),productId:'p12',type:'Stock In',qty:30,reason:'Supplier delivery',createdAt:isoDaysAgo(1),user:'Alex Dela Cruz'}
    ];

    return {
      version: 2,
      role: 'Admin',
      activeView: 'dashboard',
      business: {
        name:'Northstar Mini Mart',
        address:'Caloocan City, Metro Manila',
        phone:'0917 555 2026',
        email:'hello@northstarmart.example',
        currency:'₱',
        taxRate:0,
        receiptFooter:'Thank you for shopping with us!'
      },
      users: {
        Admin:{name:'Alex Dela Cruz',roleLabel:'Administrator',initials:'AD'},
        Cashier:{name:'Jamie Cruz',roleLabel:'Cashier',initials:'JC'}
      },
      products, customers, suppliers, sales, inventoryMovements,
      heldOrders: [],
      activity: [
        {id:uid('act'),action:'Demo workspace initialized',user:'System',createdAt:new Date().toISOString()},
        {id:uid('act'),action:'Stock adjusted for Fresh Milk 1L (-2)',user:'Alex Dela Cruz',createdAt:isoDaysAgo(2)}
      ]
    };
  }

  let store = loadStore();
  let activeView = store.activeView || 'dashboard';
  let cart = [];
  let posSearch = '';
  let posCategory = 'All';
  let selectedCustomerId = 'c1';
  let payMethod = 'Cash';
  let amountReceived = '';
  let discountMode = 'amount';
  let discountValue = 0;

  function loadStore(){
    try{
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if(parsed && parsed.version === 2) return parsed;
    }catch(e){ console.warn('Unable to read SmartPOS data', e); }
    const fresh = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function saveStore(){
    store.activeView = activeView;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function fmt(value){
    return `${store.business.currency || '₱'}${moneyNum(value).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  }

  function formatDate(value, withTime=true){
    const opts = withTime ? {month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'} : {month:'short',day:'numeric',year:'numeric'};
    return new Date(value).toLocaleString('en-PH', opts);
  }

  function toast(message){
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(window.__smartToast);
    window.__smartToast = setTimeout(()=>el.classList.remove('show'), 2600);
  }

  function logActivity(action){
    const user = store.users[store.role]?.name || store.role;
    store.activity.unshift({id:uid('act'),action,user,createdAt:new Date().toISOString()});
    store.activity = store.activity.slice(0,80);
  }

  function badge(text, type='muted'){ return `<span class="badge ${type}">${h(text)}</span>`; }
  function productById(id){ return store.products.find(p=>p.id===id); }
  function customerById(id){ return store.customers.find(c=>c.id===id); }
  function completedSales(){ return store.sales.filter(s=>s.status==='completed'); }
  function saleProfit(s){ return s.items.reduce((sum,i)=>sum+(i.price-i.cost)*i.qty,0) - moneyNum(s.discount); }
  function todaySales(){ return completedSales().filter(s=>dateKey(s.createdAt)===dateKey()); }
  function calcInventoryValue(){ return store.products.filter(p=>p.status==='active').reduce((sum,p)=>sum+p.cost*p.stock,0); }
  function lowProducts(){ return store.products.filter(p=>p.status==='active' && p.stock>0 && p.stock<=p.reorder); }
  function outProducts(){ return store.products.filter(p=>p.status==='active' && p.stock<=0); }

  function updateChrome(){
    const [title, sub] = views[activeView] || views.dashboard;
    $('#viewTitle').textContent = title;
    $('#viewSubtitle').textContent = sub;
    $('#sidebarBusiness').textContent = store.business.name;
    $('#dateChip').textContent = new Date().toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
    $('#roleSelect').value = store.role;
    const u = store.users[store.role];
    $('#userName').textContent = u.name;
    $('#userRole').textContent = u.roleLabel;
    $('#avatar').textContent = u.initials;
    document.body.classList.toggle('role-cashier', store.role === 'Cashier');
    $$('.nav-item').forEach(btn=>btn.classList.toggle('active', btn.dataset.view===activeView));
  }

  function navigate(view){
    if(store.role==='Cashier' && ['reports','settings'].includes(view)) view='dashboard';
    activeView = view;
    saveStore();
    updateChrome();
    render();
    $('#sidebar').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function render(){
    updateChrome();
    const renderers = {dashboard:renderDashboard,pos:renderPOS,products:renderProducts,inventory:renderInventory,transactions:renderTransactions,customers:renderCustomers,suppliers:renderSuppliers,reports:renderReports,settings:renderSettings};
    $('#mainArea').innerHTML = (renderers[activeView] || renderDashboard)();
  }

  function renderDashboard(){
    const today = todaySales();
    const revenue = today.reduce((a,s)=>a+s.total,0);
    const profit = today.reduce((a,s)=>a+saleProfit(s),0);
    const avg = today.length ? revenue/today.length : 0;
    const low = lowProducts();
    const out = outProducts();
    const days = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(6-i));return d;});
    const totals = days.map(d=>completedSales().filter(s=>dateKey(s.createdAt)===dateKey(d)).reduce((a,s)=>a+s.total,0));
    const max = Math.max(...totals,1);
    const itemMap={};
    completedSales().forEach(s=>s.items.forEach(i=>{ if(!itemMap[i.productId]) itemMap[i.productId]={name:i.name,qty:0,revenue:0}; itemMap[i.productId].qty+=i.qty; itemMap[i.productId].revenue+=i.subtotal; }));
    const top = Object.values(itemMap).sort((a,b)=>b.qty-a.qty).slice(0,5);
    const recent = [...store.sales].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6);
    return `
      <div class="kpi-grid">
        ${kpi('Today\'s Revenue',fmt(revenue),'Completed sales today','good')}
        ${kpi('Gross Profit',fmt(profit),'Estimated from item cost','good')}
        ${kpi('Transactions',today.length,'Completed today')}
        ${kpi('Avg. Order',fmt(avg),'Revenue ÷ transactions')}
        ${kpi('Stock Alerts',low.length+out.length,`${out.length} out · ${low.length} low`,out.length?'bad':'warn')}
      </div>
      <div class="grid grid-2" style="margin-bottom:16px">
        <div class="card card-pad">
          <div class="section-head"><div><h2>Sales trend</h2><p>Revenue generated during the last 7 days.</p></div><button class="btn sm ghost admin-only" onclick="navigate('reports')">Open reports</button></div>
          <div class="chart-box">${days.map((d,i)=>`<div class="bar-col"><div class="bar" style="height:${Math.max(3,(totals[i]/max)*175)}px" data-tip="${h(fmt(totals[i]))}"></div><span class="bar-label">${d.toLocaleDateString('en-PH',{weekday:'short'})}</span></div>`).join('')}</div>
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h2>Top products</h2><p>Best-selling items by unit volume.</p></div></div>
          <div class="metric-list">${top.map((x,i)=>`<div class="metric-row"><div><strong>${i+1}. ${h(x.name)}</strong><br><span>${x.qty} units sold</span></div><strong>${fmt(x.revenue)}</strong></div>`).join('') || emptyInline('No sales data yet.')}</div>
        </div>
      </div>
      <div class="grid grid-2">
        <div class="card card-pad">
          <div class="section-head"><div><h2>Recent transactions</h2><p>Latest completed and voided sales.</p></div><button class="btn sm ghost" onclick="navigate('transactions')">View all</button></div>
          <div class="table-wrap"><table class="data-table"><thead><tr><th>Transaction</th><th>Cashier</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead><tbody>
            ${recent.map(s=>`<tr><td><div class="td-main">${h(s.txnNo)}</div><div class="td-sub">${formatDate(s.createdAt)}</div></td><td>${h(s.cashier)}</td><td>${h(s.payment)}</td><td>${badge(s.status,s.status==='completed'?'success':'danger')}</td><td class="td-main">${fmt(s.total)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
        <div class="card card-pad">
          <div class="section-head"><div><h2>Inventory attention</h2><p>Products that may need replenishment.</p></div><button class="btn sm ghost" onclick="navigate('inventory')">Manage stock</button></div>
          <div class="metric-list">
            ${[...out,...low].slice(0,7).map(p=>`<div class="metric-row"><div><strong>${h(p.name)}</strong><br><span>${h(p.sku)} · reorder at ${p.reorder}</span></div>${badge(p.stock<=0?'Out of stock':`${p.stock} left`,p.stock<=0?'danger':'warning')}</div>`).join('') || emptyInline('All stock levels look healthy.')}
          </div>
          <div class="notice" style="margin-top:12px">Current inventory value: <strong>${fmt(calcInventoryValue())}</strong></div>
        </div>
      </div>`;
  }

  function kpi(label,value,note,type=''){
    return `<div class="kpi ${type}"><div class="k-label"><span class="k-accent"></span>${h(label)}</div><div class="k-value">${value}</div><div class="k-note">${h(note)}</div></div>`;
  }

  function emptyInline(text){ return `<div class="empty-state"><div class="empty-icon">○</div><strong>Nothing to show</strong>${h(text)}</div>`; }

  function cartTotals(){
    const subtotal = cart.reduce((sum,i)=>sum+i.price*i.qty,0);
    const discount = discountMode==='percent' ? Math.min(subtotal, subtotal*(Math.max(0,discountValue)/100)) : Math.min(subtotal,Math.max(0,discountValue));
    const taxable = Math.max(0,subtotal-discount);
    const tax = taxable * (moneyNum(store.business.taxRate)/100);
    const total = taxable + tax;
    const change = payMethod==='Cash' ? Math.max(0,moneyNum(amountReceived)-total) : 0;
    return {subtotal,discount,tax,total,change};
  }

  function renderPOS(){
    const categories=['All',...new Set(store.products.filter(p=>p.status==='active').map(p=>p.category))];
    let list=store.products.filter(p=>p.status==='active');
    if(posCategory!=='All') list=list.filter(p=>p.category===posCategory);
    if(posSearch.trim()){
      const q=posSearch.toLowerCase();
      list=list.filter(p=>`${p.name} ${p.sku} ${p.barcode||''}`.toLowerCase().includes(q));
    }
    const t=cartTotals();
    const canCheckout=cart.length>0 && (payMethod!=='Cash' || moneyNum(amountReceived)>=t.total);
    return `<div class="pos-layout">
      <div class="card pos-products">
        <div class="page-actions" style="margin-bottom:0">
          <div class="left"><input id="posSearch" class="search" type="search" value="${h(posSearch)}" placeholder="Search name, SKU or scan barcode…" oninput="setPosSearch(this.value)"></div>
          <div class="right"><button class="btn" onclick="openHeldOrders()">Held Orders <span class="badge info" style="margin-left:5px">${store.heldOrders.length}</span></button></div>
        </div>
        <div class="chips">${categories.map(c=>`<button class="chip ${c===posCategory?'active':''}" onclick="setPosCategory('${encodeURIComponent(c)}')">${h(c)}</button>`).join('')}</div>
        <div class="product-grid">${list.map(p=>`<button class="product-tile ${p.stock<=0?'disabled':''}" ${p.stock<=0?'disabled':''} onclick="addToCart('${p.id}')"><span class="prod-badge">${p.stock<=0?'Out':`${p.stock} left`}</span><div class="prod-icon">${h(p.name.slice(0,1).toUpperCase())}</div><div class="prod-name">${h(p.name)}</div><div class="prod-meta">${h(p.category)} · ${h(p.sku)}</div><div class="prod-price">${fmt(p.price)}</div></button>`).join('') || emptyInline('No matching products.')}</div>
      </div>
      <div class="card cart-card">
        <div class="cart-head"><div class="section-head" style="margin:0"><div><h2>Current order</h2><p>${cart.reduce((a,i)=>a+i.qty,0)} item(s)</p></div>${cart.length?'<button class="btn sm danger" onclick="clearCart()">Clear</button>':''}</div></div>
        <div class="cart-items">${cart.length?cart.map((i,idx)=>`<div class="cart-item"><div><div class="name">${h(i.name)}</div><div class="price">${fmt(i.price)} each</div></div><div class="qty"><button onclick="changeQty(${idx},-1)">−</button><strong>${i.qty}</strong><button onclick="changeQty(${idx},1)">+</button></div><div style="text-align:right"><strong>${fmt(i.price*i.qty)}</strong><br><button class="btn sm ghost" style="padding:3px 6px;margin-top:3px" onclick="removeCartItem(${idx})">Remove</button></div></div>`).join(''):emptyInline('Add a product to begin a sale.')}</div>
        <div class="cart-summary">
          <div class="form-group" style="margin-bottom:9px"><label>Customer</label><select class="select" style="width:100%" onchange="setSelectedCustomer(this.value)"><option value="c1">Walk-in Customer</option>${store.customers.filter(c=>c.id!=='c1').map(c=>`<option value="${c.id}" ${c.id===selectedCustomerId?'selected':''}>${h(c.name)}</option>`).join('')}</select></div>
          <div class="form-grid" style="gap:8px;margin-bottom:8px"><div class="form-group"><label>Discount</label><input class="field" type="number" min="0" value="${discountValue}" oninput="setDiscount(this.value)"></div><div class="form-group"><label>Mode</label><select class="select" onchange="setDiscountMode(this.value)"><option value="amount" ${discountMode==='amount'?'selected':''}>Amount</option><option value="percent" ${discountMode==='percent'?'selected':''}>Percent</option></select></div></div>
          <div class="summary-row"><span>Subtotal</span><strong>${fmt(t.subtotal)}</strong></div>
          <div class="summary-row"><span>Discount</span><strong>−${fmt(t.discount)}</strong></div>
          ${store.business.taxRate?`<div class="summary-row"><span>Tax (${store.business.taxRate}%)</span><strong>${fmt(t.tax)}</strong></div>`:''}
          <div class="summary-row total"><span>Total</span><span>${fmt(t.total)}</span></div>
          <div class="payment-grid">${['Cash','GCash','Maya','Card','Bank','Other'].map(m=>`<button class="btn ${payMethod===m?'dark':''}" onclick="setPayMethod('${m}')">${m}</button>`).join('')}</div>
          ${payMethod==='Cash'?`<div class="form-grid" style="gap:8px"><div class="form-group"><label>Amount received</label><input class="field" type="number" min="0" value="${h(amountReceived)}" oninput="setAmountReceived(this.value)"></div><div class="form-group"><label>Change</label><input class="field" value="${fmt(t.change)}" disabled></div></div>`:''}
          <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:8px;margin-top:10px"><button class="btn" ${cart.length?'':'disabled'} onclick="holdCurrentOrder()">Hold Order</button><button class="btn primary" ${canCheckout?'':'disabled'} onclick="checkout()">Complete Sale · ${fmt(t.total)}</button></div>
        </div>
      </div>
    </div>`;
  }

  window.setPosSearch = value => { posSearch=value; render(); requestAnimationFrame(()=>{const el=$('#posSearch');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length);}}); };
  window.setPosCategory = enc => { posCategory=decodeURIComponent(enc); render(); };
  window.setDiscount = value => { discountValue=moneyNum(value); render(); };
  window.setDiscountMode = value => { discountMode=value; render(); };
  window.setPayMethod = value => { payMethod=value; amountReceived=''; render(); };
  window.setAmountReceived = value => { amountReceived=value; render(); };
  window.setSelectedCustomer = value => { selectedCustomerId=value; };

  window.addToCart = id => {
    const p=productById(id); if(!p||p.stock<=0) return;
    const existing=cart.find(i=>i.productId===id);
    if(existing){ if(existing.qty>=p.stock) return toast('Not enough stock available.'); existing.qty++; }
    else cart.push({productId:p.id,name:p.name,sku:p.sku,price:p.price,cost:p.cost,qty:1});
    render();
  };
  window.changeQty = (idx,delta) => {
    const item=cart[idx]; if(!item) return;
    const p=productById(item.productId); const next=item.qty+delta;
    if(next<=0) cart.splice(idx,1); else if(next>p.stock) return toast('Quantity exceeds available stock.'); else item.qty=next;
    render();
  };
  window.removeCartItem = idx => {cart.splice(idx,1);render();};
  window.clearCart = () => {cart=[];discountValue=0;discountMode='amount';amountReceived='';payMethod='Cash';selectedCustomerId='c1';render();};
  window.holdCurrentOrder = () => {
    if(!cart.length) return;
    const totals=cartTotals();
    store.heldOrders.unshift({id:uid('hold'),label:`Hold ${String(store.heldOrders.length+1).padStart(2,'0')}`,createdAt:new Date().toISOString(),cart:JSON.parse(JSON.stringify(cart)),discountMode,discountValue,customerId:selectedCustomerId,total:totals.total});
    logActivity(`Held order worth ${fmt(totals.total)}`); saveStore(); window.clearCart(); toast('Order held successfully.');
  };

  window.openHeldOrders = () => {
    const body = store.heldOrders.length ? `<div class="metric-list">${store.heldOrders.map(o=>`<div class="metric-row"><div><strong>${h(o.label)}</strong><br><span>${formatDate(o.createdAt)} · ${o.cart.reduce((a,i)=>a+i.qty,0)} items</span></div><div style="display:flex;gap:6px;align-items:center"><strong>${fmt(o.total)}</strong><button class="btn sm primary" onclick="resumeHeld('${o.id}')">Resume</button><button class="btn sm danger" onclick="deleteHeld('${o.id}')">Delete</button></div></div>`).join('')}</div>` : emptyInline('No held orders right now.');
    openModal('Held Orders','Pause a transaction and resume it later.',body,'sm');
  };
  window.resumeHeld = id => {const o=store.heldOrders.find(x=>x.id===id);if(!o)return;cart=o.cart;discountMode=o.discountMode;discountValue=o.discountValue;selectedCustomerId=o.customerId;store.heldOrders=store.heldOrders.filter(x=>x.id!==id);saveStore();closeModal();navigate('pos');toast('Held order resumed.');};
  window.deleteHeld = id => {store.heldOrders=store.heldOrders.filter(x=>x.id!==id);saveStore();closeModal();openHeldOrders();};

  window.checkout = () => {
    if(!cart.length) return;
    const t=cartTotals();
    if(payMethod==='Cash' && moneyNum(amountReceived)<t.total) return toast('Amount received is below the total.');
    for(const item of cart){ const p=productById(item.productId); if(!p||item.qty>p.stock) return toast(`${item.name} no longer has enough stock.`); }
    const now=new Date();
    const seq=store.sales.length+1001;
    const cashier=store.users[store.role].name;
    const sale={id:uid('sale'),txnNo:`TXN-${dateKey(now).replaceAll('-','')}-${seq}`,createdAt:now.toISOString(),cashier,payment:payMethod,customerId:selectedCustomerId,items:cart.map(i=>({...i,subtotal:i.price*i.qty})),subtotal:t.subtotal,discount:t.discount,tax:t.tax,total:t.total,amountReceived:payMethod==='Cash'?moneyNum(amountReceived):t.total,change:payMethod==='Cash'?t.change:0,status:'completed'};
    for(const item of cart){ const p=productById(item.productId); p.stock-=item.qty; store.inventoryMovements.unshift({id:uid('mov'),productId:p.id,type:'Sale',qty:-item.qty,reason:sale.txnNo,createdAt:now.toISOString(),user:cashier}); }
    store.sales.push(sale);
    logActivity(`Completed ${sale.txnNo} for ${fmt(sale.total)}`);
    saveStore();
    const saleCopy=JSON.parse(JSON.stringify(sale));
    window.clearCart();
    showReceipt(saleCopy,true);
  };

  function renderProducts(){
    const q=(window.productSearch||'').toLowerCase();
    const cat=window.productCategory||'All';
    const status=window.productStatus||'active';
    const cats=['All',...new Set(store.products.map(p=>p.category))];
    let list=store.products.filter(p=>status==='all'||p.status===status);
    if(cat!=='All') list=list.filter(p=>p.category===cat);
    if(q) list=list.filter(p=>`${p.name} ${p.sku} ${p.barcode||''}`.toLowerCase().includes(q));
    return `<div class="page-actions"><div class="left"><input class="search" placeholder="Search products…" value="${h(window.productSearch||'')}" oninput="window.productSearch=this.value;render()"><select class="select" onchange="window.productCategory=this.value;render()">${cats.map(c=>`<option ${c===cat?'selected':''}>${h(c)}</option>`).join('')}</select><select class="select" onchange="window.productStatus=this.value;render()"><option value="active" ${status==='active'?'selected':''}>Active</option><option value="archived" ${status==='archived'?'selected':''}>Archived</option><option value="all" ${status==='all'?'selected':''}>All Status</option></select></div><div class="right"><button class="btn" onclick="exportProductsCSV()">Export CSV</button><button class="btn primary admin-only" onclick="openProductModal()">+ Add Product</button></div></div>
      <div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>Category</th><th>Cost</th><th>Price</th><th>Margin</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
      ${list.map(p=>{const margin=p.price?((p.price-p.cost)/p.price)*100:0; const stockBadge=p.stock<=0?badge('Out','danger'):p.stock<=p.reorder?badge(`${p.stock} low`,'warning'):badge(`${p.stock} in stock`,'success');return `<tr><td><div class="td-main">${h(p.name)}</div><div class="td-sub">${h(p.sku)}${p.barcode?` · ${h(p.barcode)}`:''}</div></td><td>${h(p.category)}</td><td>${fmt(p.cost)}</td><td class="td-main">${fmt(p.price)}</td><td>${margin.toFixed(1)}%</td><td>${stockBadge}</td><td>${badge(p.status,p.status==='active'?'success':'muted')}</td><td style="white-space:nowrap"><button class="btn sm admin-only" onclick="openProductModal('${p.id}')">Edit</button> <button class="btn sm ghost admin-only" onclick="toggleProductArchive('${p.id}')">${p.status==='archived'?'Restore':'Archive'}</button></td></tr>`}).join('') || `<tr><td colspan="8">${emptyInline('No products match the current filters.')}</td></tr>`}
      </tbody></table></div></div>`;
  }

  window.openProductModal = id => {
    const p=id?productById(id):null;
    const body=`<div class="form-grid">
      ${fg('Product Name',`<input id="pName" class="field" value="${h(p?.name||'')}">`,'full')}
      ${fg('SKU',`<input id="pSku" class="field" value="${h(p?.sku||nextSku())}">`)}
      ${fg('Barcode',`<input id="pBarcode" class="field" value="${h(p?.barcode||'')}">`)}
      ${fg('Category',`<input id="pCategory" class="field" value="${h(p?.category||'General')}">`)}
      ${fg('Unit',`<input id="pUnit" class="field" value="${h(p?.unit||'piece')}">`)}
      ${fg('Cost Price',`<input id="pCost" type="number" min="0" class="field" value="${p?.cost??0}">`)}
      ${fg('Selling Price',`<input id="pPrice" type="number" min="0" class="field" value="${p?.price??0}">`)}
      ${fg('Current Stock',`<input id="pStock" type="number" min="0" class="field" value="${p?.stock??0}" ${p?'disabled':''}>`)}
      ${fg('Reorder Level',`<input id="pReorder" type="number" min="0" class="field" value="${p?.reorder??5}">`)}
    </div>${p?'<div class="notice" style="margin-top:12px">For auditability, edit stock from the Inventory page instead of changing it directly here.</div>':''}`;
    openModal(p?'Edit Product':'Add Product',p?'Update catalog and pricing information.':'Create a new product in the catalog.',body,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveProduct('${p?.id||''}')">Save Product</button>`);
  };

  function nextSku(){ const nums=store.products.map(p=>Number((p.sku.match(/(\d+)$/)||[])[1]||0)); return `PROD-${String(Math.max(0,...nums)+1).padStart(3,'0')}`; }
  window.saveProduct = id => {
    const name=$('#pName').value.trim(), sku=$('#pSku').value.trim(), barcode=$('#pBarcode').value.trim(), category=$('#pCategory').value.trim()||'General', unit=$('#pUnit').value.trim()||'piece', cost=moneyNum($('#pCost').value), price=moneyNum($('#pPrice').value), reorder=Math.max(0,Number($('#pReorder').value||0));
    if(!name||!sku) return toast('Product name and SKU are required.');
    if(price<cost) return toast('Selling price should not be below cost for this demo.');
    if(store.products.some(p=>p.id!==id && p.sku.toLowerCase()===sku.toLowerCase())) return toast('SKU must be unique.');
    if(barcode && store.products.some(p=>p.id!==id && p.barcode===barcode)) return toast('Barcode must be unique.');
    if(id){ const p=productById(id); Object.assign(p,{name,sku,barcode,category,unit,cost,price,reorder}); logActivity(`Updated product ${name}`); }
    else { const stock=Math.max(0,Number($('#pStock').value||0)); const p={id:uid('p'),name,sku,barcode,category,unit,cost,price,stock,reorder,status:'active'}; store.products.push(p); if(stock)store.inventoryMovements.unshift({id:uid('mov'),productId:p.id,type:'Stock In',qty:stock,reason:'Opening stock',createdAt:new Date().toISOString(),user:store.users[store.role].name}); logActivity(`Added product ${name}`); }
    saveStore();closeModal();render();toast('Product saved.');
  };
  window.toggleProductArchive = id => {const p=productById(id);if(!p)return;p.status=p.status==='archived'?'active':'archived';logActivity(`${p.status==='archived'?'Archived':'Restored'} product ${p.name}`);saveStore();render();};

  function renderInventory(){
    const q=(window.invSearch||'').toLowerCase();
    const list=store.products.filter(p=>p.status==='active' && (!q||`${p.name} ${p.sku}`.toLowerCase().includes(q))).sort((a,b)=>(a.stock-a.reorder)-(b.stock-b.reorder));
    const moves=[...store.inventoryMovements].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,15);
    return `<div class="kpi-grid">${kpi('Inventory Value',fmt(calcInventoryValue()),`${store.products.filter(p=>p.status==='active').length} active products`)}${kpi('Low Stock',lowProducts().length,'At or below reorder level','warn')}${kpi('Out of Stock',outProducts().length,'Requires replenishment','bad')}${kpi('Units on Hand',store.products.filter(p=>p.status==='active').reduce((a,p)=>a+p.stock,0),'Across active products')}${kpi('Movements',store.inventoryMovements.length,'Recorded stock events')}</div>
      <div class="grid grid-2"><div class="card card-pad"><div class="section-head"><div><h2>Stock levels</h2><p>Adjustments create a movement record for traceability.</p></div><input class="search" style="min-width:190px" placeholder="Search stock…" value="${h(window.invSearch||'')}" oninput="window.invSearch=this.value;render()"></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Product</th><th>Stock</th><th>Reorder</th><th>Value</th><th></th></tr></thead><tbody>${list.map(p=>`<tr><td><div class="td-main">${h(p.name)}</div><div class="td-sub">${h(p.sku)}</div></td><td>${p.stock<=0?badge('Out','danger'):p.stock<=p.reorder?badge(`${p.stock} low`,'warning'):badge(p.stock,'success')}</td><td>${p.reorder}</td><td>${fmt(p.stock*p.cost)}</td><td><button class="btn sm primary admin-only" onclick="openStockAdjust('${p.id}')">Adjust</button></td></tr>`).join('')}</tbody></table></div></div>
      <div class="card card-pad"><div class="section-head"><div><h2>Recent movements</h2><p>Latest inventory changes.</p></div></div><div class="metric-list">${moves.map(m=>{const p=productById(m.productId);return `<div class="metric-row"><div><strong>${h(p?.name||'Unknown product')}</strong><br><span>${formatDate(m.createdAt)} · ${h(m.type)} · ${h(m.reason||'')}</span></div><strong style="color:${m.qty>=0?'var(--green)':'var(--red)'}">${m.qty>=0?'+':''}${m.qty}</strong></div>`}).join('') || emptyInline('No movements recorded.')}</div></div></div>`;
  }

  window.openStockAdjust = id => {
    const p=productById(id); if(!p)return;
    const body=`<div class="notice" style="margin-bottom:13px"><strong>${h(p.name)}</strong><br>Current stock: ${p.stock} ${h(p.unit||'unit(s)')}</div><div class="form-grid">${fg('Adjustment Type',`<select id="adjType" class="select"><option value="add">Stock In / Add</option><option value="remove">Stock Out / Remove</option><option value="set">Set Exact Quantity</option></select>`)}${fg('Quantity',`<input id="adjQty" class="field" type="number" min="0" value="1">`)}${fg('Reason',`<input id="adjReason" class="field" placeholder="Delivery, damage, count correction…">`,'full')}</div>`;
    openModal('Adjust Inventory','Every change is recorded in the movement history.',body,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveStockAdjust('${id}')">Apply Adjustment</button>`);
  };
  window.saveStockAdjust = id => {
    const p=productById(id); if(!p)return;
    const type=$('#adjType').value, qty=Math.max(0,Number($('#adjQty').value||0)), reason=$('#adjReason').value.trim()||'Manual adjustment';
    let delta=0;
    if(type==='add') delta=qty; else if(type==='remove') delta=-qty; else delta=qty-p.stock;
    if(p.stock+delta<0) return toast('Adjustment would make stock negative.');
    p.stock+=delta;
    store.inventoryMovements.unshift({id:uid('mov'),productId:id,type:type==='add'?'Stock In':type==='remove'?'Stock Out':'Adjustment',qty:delta,reason,createdAt:new Date().toISOString(),user:store.users[store.role].name});
    logActivity(`Adjusted ${p.name} stock (${delta>=0?'+':''}${delta})`);saveStore();closeModal();render();toast('Inventory adjusted.');
  };

  function renderTransactions(){
    const search=(window.txnSearch||'').toLowerCase(), status=window.txnStatus||'all', payment=window.txnPayment||'all';
    const payments=['all',...new Set(store.sales.map(s=>s.payment))];
    let list=[...store.sales].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    if(search) list=list.filter(s=>`${s.txnNo} ${s.cashier} ${customerById(s.customerId)?.name||''}`.toLowerCase().includes(search));
    if(status!=='all') list=list.filter(s=>s.status===status);
    if(payment!=='all') list=list.filter(s=>s.payment===payment);
    return `<div class="page-actions"><div class="left"><input class="search" placeholder="Search transaction, cashier or customer…" value="${h(window.txnSearch||'')}" oninput="window.txnSearch=this.value;render()"><select class="select" onchange="window.txnStatus=this.value;render()"><option value="all">All Status</option><option value="completed" ${status==='completed'?'selected':''}>Completed</option><option value="voided" ${status==='voided'?'selected':''}>Voided</option></select><select class="select" onchange="window.txnPayment=this.value;render()">${payments.map(p=>`<option value="${h(p)}" ${p===payment?'selected':''}>${p==='all'?'All Payments':h(p)}</option>`).join('')}</select></div><div class="right"><button class="btn" onclick="exportTransactionsCSV()">Export CSV</button></div></div>
      <div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Transaction</th><th>Customer</th><th>Cashier</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${list.map(s=>`<tr><td><div class="td-main">${h(s.txnNo)}</div><div class="td-sub">${formatDate(s.createdAt)}</div></td><td>${h(customerById(s.customerId)?.name||'Walk-in Customer')}</td><td>${h(s.cashier)}</td><td>${s.items.reduce((a,i)=>a+i.qty,0)}</td><td>${h(s.payment)}</td><td class="td-main">${fmt(s.total)}</td><td>${badge(s.status,s.status==='completed'?'success':'danger')}</td><td><button class="btn sm" onclick="showReceiptById('${s.id}')">View</button></td></tr>`).join('') || `<tr><td colspan="8">${emptyInline('No transactions match the filters.')}</td></tr>`}</tbody></table></div></div>`;
  }

  window.showReceiptById = id => {const s=store.sales.find(x=>x.id===id);if(s)showReceipt(s,false);};
  function showReceipt(sale, completed=false){
    const customer=customerById(sale.customerId)?.name||'Walk-in Customer';
    const body=`<div class="receipt" id="receiptPrint"><div class="receipt-head"><strong>${h(store.business.name)}</strong><div>${h(store.business.address||'')}</div><div>${h(store.business.phone||'')}</div></div><hr><div class="receipt-line"><span>${h(sale.txnNo)}</span><span>${formatDate(sale.createdAt)}</span></div><div class="receipt-line"><span>Cashier</span><span>${h(sale.cashier)}</span></div><div class="receipt-line"><span>Customer</span><span>${h(customer)}</span></div><hr>${sale.items.map(i=>`<div class="receipt-line"><span>${h(i.name)} × ${i.qty}</span><span>${fmt(i.subtotal)}</span></div>`).join('')}<hr><div class="receipt-line"><span>Subtotal</span><span>${fmt(sale.subtotal)}</span></div><div class="receipt-line"><span>Discount</span><span>−${fmt(sale.discount)}</span></div>${sale.tax?`<div class="receipt-line"><span>Tax</span><span>${fmt(sale.tax)}</span></div>`:''}<div class="receipt-line receipt-total"><span>TOTAL</span><span>${fmt(sale.total)}</span></div><div class="receipt-line"><span>${h(sale.payment)}</span><span>${fmt(sale.amountReceived)}</span></div>${sale.payment==='Cash'?`<div class="receipt-line"><span>Change</span><span>${fmt(sale.change)}</span></div>`:''}${sale.status==='voided'?`<hr><div style="text-align:center;color:#b91c1c;font-weight:800">VOIDED</div><div class="receipt-line"><span>Reason</span><span>${h(sale.voidReason||'—')}</span></div>`:''}<div class="receipt-note">${h(store.business.receiptFooter||'Thank you!')}</div></div>`;
    const footer=`${sale.status==='completed' && store.role==='Admin'?`<button class="btn danger" onclick="openVoidSale('${sale.id}')">Void Transaction</button>`:''}<button class="btn" onclick="window.print()">Print Receipt</button><button class="btn primary" onclick="closeModal()">Close</button>`;
    openModal(completed?'Sale Complete':'Transaction Receipt',completed?'Payment recorded and stock updated.':'Review the transaction details below.',body,'sm',footer);
  }

  window.openVoidSale = id => {
    const s=store.sales.find(x=>x.id===id);if(!s)return;
    const body=`<div class="notice danger-note">Voiding restores sold quantities to inventory and keeps the original transaction for audit history.</div><div class="form-group" style="margin-top:12px"><label>Void Reason</label><input id="voidReason" class="field" placeholder="Duplicate entry, cancelled sale…"></div>`;
    openModal('Void Transaction',h(s.txnNo),body,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn danger" onclick="confirmVoid('${id}')">Confirm Void</button>`);
  };
  window.confirmVoid = id => {
    const s=store.sales.find(x=>x.id===id);if(!s||s.status!=='completed')return;
    const reason=$('#voidReason').value.trim()||'No reason provided';
    s.status='voided';s.voidReason=reason;s.voidedAt=new Date().toISOString();s.voidedBy=store.users[store.role].name;
    s.items.forEach(i=>{const p=productById(i.productId);if(p){p.stock+=i.qty;store.inventoryMovements.unshift({id:uid('mov'),productId:p.id,type:'Void Restore',qty:i.qty,reason:s.txnNo,createdAt:new Date().toISOString(),user:s.voidedBy});}});
    logActivity(`Voided ${s.txnNo}: ${reason}`);saveStore();closeModal();render();toast('Transaction voided and stock restored.');
  };

  function renderCustomers(){
    const q=(window.customerSearch||'').toLowerCase();
    const list=store.customers.filter(c=>c.id!=='c1' && (!q||`${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q)));
    return `<div class="page-actions"><div class="left"><input class="search" placeholder="Search customers…" value="${h(window.customerSearch||'')}" oninput="window.customerSearch=this.value;render()"></div><div class="right"><button class="btn primary" onclick="openCustomerModal()">+ Add Customer</button></div></div><div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Customer</th><th>Phone</th><th>Transactions</th><th>Total Spend</th><th>Last Purchase</th><th></th></tr></thead><tbody>${list.map(c=>{const sales=completedSales().filter(s=>s.customerId===c.id);const spend=sales.reduce((a,s)=>a+s.total,0);const last=[...sales].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];return `<tr><td><div class="td-main">${h(c.name)}</div><div class="td-sub">${h(c.email||'No email')}</div></td><td>${h(c.phone||'—')}</td><td>${sales.length}</td><td class="td-main">${fmt(spend)}</td><td>${last?formatDate(last.createdAt,false):'—'}</td><td><button class="btn sm" onclick="openCustomerModal('${c.id}')">Edit</button></td></tr>`}).join('') || `<tr><td colspan="6">${emptyInline('No customers found.')}</td></tr>`}</tbody></table></div></div>`;
  }

  window.openCustomerModal = id => {const c=store.customers.find(x=>x.id===id);const body=`<div class="form-grid">${fg('Full Name',`<input id="cName" class="field" value="${h(c?.name||'')}">`,'full')}${fg('Phone',`<input id="cPhone" class="field" value="${h(c?.phone||'')}">`)}${fg('Email',`<input id="cEmail" type="email" class="field" value="${h(c?.email||'')}">`)}</div>`;openModal(c?'Edit Customer':'Add Customer','Keep contact details for purchase history and future loyalty features.',body,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveCustomer('${c?.id||''}')">Save Customer</button>`);};
  window.saveCustomer = id => {const name=$('#cName').value.trim(),phone=$('#cPhone').value.trim(),email=$('#cEmail').value.trim();if(!name)return toast('Customer name is required.');if(id){Object.assign(store.customers.find(c=>c.id===id),{name,phone,email});logActivity(`Updated customer ${name}`);}else{store.customers.push({id:uid('c'),name,phone,email,createdAt:new Date().toISOString()});logActivity(`Added customer ${name}`);}saveStore();closeModal();render();toast('Customer saved.');};

  function renderSuppliers(){
    const q=(window.supplierSearch||'').toLowerCase();
    const list=store.suppliers.filter(s=>!q||`${s.name} ${s.contact} ${s.category}`.toLowerCase().includes(q));
    return `<div class="page-actions"><div class="left"><input class="search" placeholder="Search suppliers…" value="${h(window.supplierSearch||'')}" oninput="window.supplierSearch=this.value;render()"></div><div class="right"><button class="btn primary admin-only" onclick="openSupplierModal()">+ Add Supplier</button></div></div><div class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Supplier</th><th>Contact</th><th>Phone</th><th>Category</th><th>Status</th><th></th></tr></thead><tbody>${list.map(s=>`<tr><td><div class="td-main">${h(s.name)}</div><div class="td-sub">${h(s.email||'')}</div></td><td>${h(s.contact||'—')}</td><td>${h(s.phone||'—')}</td><td>${h(s.category||'—')}</td><td>${badge(s.status,s.status==='active'?'success':'muted')}</td><td><button class="btn sm admin-only" onclick="openSupplierModal('${s.id}')">Edit</button></td></tr>`).join('')}</tbody></table></div><div class="notice" style="margin:16px">Supplier records are ready for a future Purchase Orders / Receiving module in the full-stack version.</div></div>`;
  }

  window.openSupplierModal = id => {const s=store.suppliers.find(x=>x.id===id);const body=`<div class="form-grid">${fg('Supplier Name',`<input id="sName" class="field" value="${h(s?.name||'')}">`,'full')}${fg('Contact Person',`<input id="sContact" class="field" value="${h(s?.contact||'')}">`)}${fg('Phone',`<input id="sPhone" class="field" value="${h(s?.phone||'')}">`)}${fg('Email',`<input id="sEmail" type="email" class="field" value="${h(s?.email||'')}">`)}${fg('Supplies / Category',`<input id="sCategory" class="field" value="${h(s?.category||'')}">`)}</div>`;openModal(s?'Edit Supplier':'Add Supplier','Maintain vendor contact information.',body,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveSupplier('${s?.id||''}')">Save Supplier</button>`);};
  window.saveSupplier = id => {const obj={name:$('#sName').value.trim(),contact:$('#sContact').value.trim(),phone:$('#sPhone').value.trim(),email:$('#sEmail').value.trim(),category:$('#sCategory').value.trim(),status:'active'};if(!obj.name)return toast('Supplier name is required.');if(id){Object.assign(store.suppliers.find(s=>s.id===id),obj);logActivity(`Updated supplier ${obj.name}`);}else{store.suppliers.push({id:uid('s'),...obj});logActivity(`Added supplier ${obj.name}`);}saveStore();closeModal();render();toast('Supplier saved.');};

  function renderReports(){
    const sales=completedSales();
    const revenue=sales.reduce((a,s)=>a+s.total,0), profit=sales.reduce((a,s)=>a+saleProfit(s),0), units=sales.reduce((a,s)=>a+s.items.reduce((x,i)=>x+i.qty,0),0), avg=sales.length?revenue/sales.length:0;
    const payMap={},prodMap={},catMap={};
    sales.forEach(s=>{payMap[s.payment]=(payMap[s.payment]||0)+s.total;s.items.forEach(i=>{if(!prodMap[i.productId])prodMap[i.productId]={name:i.name,qty:0,revenue:0,profit:0,category:productById(i.productId)?.category||'Other'};prodMap[i.productId].qty+=i.qty;prodMap[i.productId].revenue+=i.subtotal;prodMap[i.productId].profit+=(i.price-i.cost)*i.qty;catMap[prodMap[i.productId].category]=(catMap[prodMap[i.productId].category]||0)+i.subtotal;});});
    const topProducts=Object.values(prodMap).sort((a,b)=>b.revenue-a.revenue).slice(0,8),maxProd=Math.max(...topProducts.map(x=>x.revenue),1),maxPay=Math.max(...Object.values(payMap),1);
    return `<div class="kpi-grid">${kpi('Total Revenue',fmt(revenue),`${sales.length} completed transactions`,'good')}${kpi('Gross Profit',fmt(profit),revenue?`${((profit/revenue)*100).toFixed(1)}% gross margin`:'No revenue','good')}${kpi('Units Sold',units,'Across all completed sales')}${kpi('Average Order',fmt(avg),'Average completed ticket')}${kpi('Inventory Value',fmt(calcInventoryValue()),'Cost-based stock value')}</div>
      <div class="grid grid-2" style="margin-bottom:16px"><div class="card card-pad"><div class="section-head"><div><h2>Product performance</h2><p>Revenue contribution by top products.</p></div><button class="btn sm" onclick="exportTransactionsCSV()">Export sales</button></div>${topProducts.map(x=>`<div class="progress-row"><div><strong>${h(x.name)}</strong><div class="td-sub">${x.qty} units</div></div><div class="progress"><span style="width:${(x.revenue/maxProd)*100}%"></span></div><strong>${fmt(x.revenue)}</strong></div>`).join('')}</div>
      <div class="card card-pad"><div class="section-head"><div><h2>Payment mix</h2><p>Revenue by payment method.</p></div></div>${Object.entries(payMap).sort((a,b)=>b[1]-a[1]).map(([name,value])=>`<div class="progress-row"><strong>${h(name)}</strong><div class="progress"><span style="width:${(value/maxPay)*100}%"></span></div><strong>${fmt(value)}</strong></div>`).join('')}</div></div>
      <div class="card card-pad"><div class="section-head"><div><h2>Category revenue</h2><p>Sales grouped by product category.</p></div></div><div class="grid grid-3">${Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([name,value])=>`<div class="kpi" style="min-height:auto"><div class="k-label">${h(name)}</div><div class="k-value" style="font-size:20px">${fmt(value)}</div><div class="k-note">${revenue?((value/revenue)*100).toFixed(1):0}% of item revenue</div></div>`).join('')}</div></div>`;
  }

  function renderSettings(){
    const b=store.business;
    return `<div class="grid grid-2"><div class="card card-pad"><div class="section-head"><div><h2>Business profile</h2><p>Used on receipts and throughout the demo.</p></div></div><div class="form-grid">${fg('Business Name',`<input id="bizName" class="field" value="${h(b.name)}">`,'full')}${fg('Address',`<input id="bizAddress" class="field" value="${h(b.address||'')}">`,'full')}${fg('Phone',`<input id="bizPhone" class="field" value="${h(b.phone||'')}">`)}${fg('Email',`<input id="bizEmail" class="field" value="${h(b.email||'')}">`)}${fg('Currency Symbol',`<input id="bizCurrency" class="field" value="${h(b.currency||'₱')}">`)}${fg('Tax Rate (%)',`<input id="bizTax" class="field" type="number" min="0" max="100" step="0.01" value="${b.taxRate||0}">`)}${fg('Receipt Footer',`<input id="bizFooter" class="field" value="${h(b.receiptFooter||'')}">`,'full')}</div><div style="margin-top:14px"><button class="btn primary" onclick="saveBusinessSettings()">Save Settings</button></div></div>
      <div class="card card-pad"><div class="section-head"><div><h2>Data & portfolio tools</h2><p>Useful for demos, GitHub Pages and testing.</p></div></div><div class="metric-list"><div class="metric-row"><div><strong>Backup demo data</strong><br><span>Download the browser dataset as JSON.</span></div><button class="btn sm" onclick="downloadBackup()">Download</button></div><div class="metric-row"><div><strong>Reset sample data</strong><br><span>Restore the original portfolio demo content.</span></div><button class="btn sm danger" onclick="confirmResetDemo()">Reset</button></div></div><div class="notice" style="margin-top:12px"><strong>Portfolio architecture note:</strong> this GitHub Pages edition intentionally uses browser storage. The README explains how to upgrade it to a production backend with real authentication, a database and API.</div></div></div>
      <div class="card card-pad" style="margin-top:16px"><div class="section-head"><div><h2>Recent activity</h2><p>Simple audit trail for important demo actions.</p></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>User</th><th>Action</th></tr></thead><tbody>${store.activity.slice(0,20).map(a=>`<tr><td>${formatDate(a.createdAt)}</td><td>${h(a.user)}</td><td>${h(a.action)}</td></tr>`).join('')}</tbody></table></div></div>`;
  }

  window.saveBusinessSettings = () => {
    const name=$('#bizName').value.trim();if(!name)return toast('Business name is required.');
    Object.assign(store.business,{name,address:$('#bizAddress').value.trim(),phone:$('#bizPhone').value.trim(),email:$('#bizEmail').value.trim(),currency:$('#bizCurrency').value.trim()||'₱',taxRate:Math.max(0,moneyNum($('#bizTax').value)),receiptFooter:$('#bizFooter').value.trim()});
    logActivity('Updated business settings');saveStore();render();toast('Business settings saved.');
  };

  function fg(label,control,cls=''){return `<div class="form-group ${cls}"><label>${h(label)}</label>${control}</div>`;}

  function openModal(title,subtitle,body,size='sm',footer=''){
    $('#modalRoot').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()"><div class="modal ${size}"><div class="modal-header"><div><h3>${title}</h3><p>${subtitle||''}</p></div><button class="close-btn" onclick="closeModal()">×</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</div></div>`;
  }
  window.closeModal = () => {$('#modalRoot').innerHTML='';};

  function download(filename,content,type='text/plain'){
    const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }
  function csvEscape(v){const s=String(v??'');return /[",\n]/.test(s)?`"${s.replaceAll('"','""')}"`:s;}
  window.exportProductsCSV = () => {const rows=[['SKU','Name','Category','Cost','Price','Stock','Reorder Level','Status'],...store.products.map(p=>[p.sku,p.name,p.category,p.cost,p.price,p.stock,p.reorder,p.status])];download('smartpos-products.csv',rows.map(r=>r.map(csvEscape).join(',')).join('\n'),'text/csv');toast('Products CSV exported.');};
  window.exportTransactionsCSV = () => {const rows=[['Transaction','Date','Cashier','Customer','Payment','Subtotal','Discount','Tax','Total','Status'],...store.sales.map(s=>[s.txnNo,s.createdAt,s.cashier,customerById(s.customerId)?.name||'Walk-in',s.payment,s.subtotal,s.discount,s.tax,s.total,s.status])];download('smartpos-transactions.csv',rows.map(r=>r.map(csvEscape).join(',')).join('\n'),'text/csv');toast('Transactions CSV exported.');};
  window.downloadBackup = () => download(`smartpos-backup-${dateKey()}.json`,JSON.stringify(store,null,2),'application/json');
  window.confirmResetDemo = () => openModal('Reset Demo Data','This will replace all browser-stored demo changes.',`<div class="notice danger-note">This cannot be undone unless you downloaded a JSON backup first.</div>`,'sm',`<button class="btn" onclick="closeModal()">Cancel</button><button class="btn danger" onclick="resetDemo()">Reset Everything</button>`);
  window.resetDemo = () => {store=seedData();activeView='dashboard';cart=[];localStorage.setItem(STORAGE_KEY,JSON.stringify(store));closeModal();render();toast('Demo data restored.');};

  window.navigate = navigate;
  window.render = render;

  $('#nav').addEventListener('click', e => {const btn=e.target.closest('[data-view]');if(btn)navigate(btn.dataset.view);});
  $('#roleSelect').addEventListener('change', e => {store.role=e.target.value;if(store.role==='Cashier'&&['reports','settings'].includes(activeView))activeView='dashboard';logActivity(`Switched demo role to ${store.role}`);saveStore();render();});
  $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();navigate('pos');setTimeout(()=>$('#posSearch')?.focus(),0);}});

  render();
})();
