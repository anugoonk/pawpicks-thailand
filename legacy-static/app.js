const nav=document.getElementById('nav');
const menu=document.getElementById('menuToggle');
const panel=document.getElementById('searchPanel');
const search=document.getElementById('siteSearch');
const cards=[...document.querySelectorAll('.product-card')];
const empty=document.getElementById('emptyState');

menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
document.getElementById('searchToggle').addEventListener('click',()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))search.focus();});

function filterProducts(query){
  const term=query.trim().toLowerCase();
  let shown=0;
  cards.forEach(card=>{const match=!term||card.dataset.search.toLowerCase().includes(term)||card.innerText.toLowerCase().includes(term);card.hidden=!match;if(match)shown++;});
  empty.style.display=shown?'none':'block';
}
document.getElementById('searchButton').addEventListener('click',()=>{filterProducts(search.value);document.getElementById('new').scrollIntoView();});
search.addEventListener('keydown',event=>{if(event.key==='Enter'){filterProducts(search.value);document.getElementById('new').scrollIntoView();}});
document.querySelectorAll('[data-query]').forEach(link=>link.addEventListener('click',()=>{search.value=link.dataset.query;filterProducts(link.dataset.query);}));
