let cart = [];
let cartCount = 0;
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
  console.log('GameHub - Galería de videojuegos cargada');
  
  initAnimations();
  initBuyButtons();
  initCartCounter();
  initPlatformFilters();
  initSearchFunctionality();
  initSortingOptions();
  initGameDetailsModal();
  initCartModal();
  
  loadCartFromStorage();
  
  updateCartCounter();
});



function initAnimations() {
  const cards = document.querySelectorAll('.game-card');
  
  cards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('loaded');
    }, index * 100);
  });
  
  const headerTitle = document.querySelector('.header h1');
  if (headerTitle) {
    headerTitle.style.opacity = '0';
    headerTitle.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      headerTitle.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      headerTitle.style.opacity = '1';
      headerTitle.style.transform = 'translateY(0)';
    }, 300);
  }
}



function initBuyButtons() {
  const buyButtons = document.querySelectorAll('.btn-comprar');
  
  buyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation(); 
      
      const card = this.closest('.game-card');
      const gameData = extractGameData(card);
      
      addToCart(gameData);
      showPurchaseConfirmation(this, gameData);
    });
  });
}

function extractGameData(card) {
  const gameTitle = card.querySelector('.card-title').textContent;
  const gameSubtitle = card.querySelector('.card-subtitle').textContent;
  const priceText = card.querySelector('.price').textContent;
  const gamePrice = parsePrice(priceText);
  const gamePlatforms = extractPlatforms(card);
  const gameImage = card.querySelector('.card-img-top').src;
  const ratingText = card.querySelector('.rating-text').textContent;
  const gameRating = parseFloat(ratingText);
  
  
  const oldPriceElement = card.querySelector('.old-price');
  const originalPrice = oldPriceElement ? parsePrice(oldPriceElement.textContent) : gamePrice;
  
  return {
    id: generateGameId(gameTitle),
    title: gameTitle,
    subtitle: gameSubtitle,
    price: gamePrice,
    originalPrice: originalPrice,
    platforms: gamePlatforms,
    image: gameImage,
    rating: gameRating,
    quantity: 1,
    addedAt: new Date().toISOString()
  };
}

function extractPlatforms(card) {
  const platformElements = card.querySelectorAll('.platforms .platform-badge');
  return Array.from(platformElements).map(el => el.textContent);
}

function parsePrice(priceText) {
  const match = priceText.match(/\$?(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
}

function generateGameId(title) {
 
  return title.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function addToCart(game) {
 
  const existingIndex = cart.findIndex(item => item.id === game.id);
  
  if (existingIndex > -1) {
    
    cart[existingIndex].quantity += 1;
  } else {

    cart.push(game);
  }
  
  
  cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  
  saveCartToStorage();
  
  
  updateCartCounter();
  
  console.log(`"${game.title}" añadido al carrito. Total en carrito: ${cartCount}`);
  return cartCount;
}



function showPurchaseConfirmation(button, gameData) {

  const originalHTML = button.innerHTML;
  const originalBgColor = button.style.backgroundColor;
  
  
  button.innerHTML = '<i class="fas fa-check me-2"></i>Añadido';
  button.style.backgroundColor = '#27ae60';
  button.disabled = true;
  
 
  showToastNotification(gameData);
  
  
  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.style.backgroundColor = originalBgColor;
    button.disabled = false;
  }, 2000);
}

function showToastNotification(gameData) {

  let toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    `;
    document.body.appendChild(toastContainer);
    
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
      }
      .game-toast {
        animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
      }
    `;
    document.head.appendChild(style);
  }
  
 
  const toast = document.createElement('div');
  toast.className = 'game-toast';
  toast.style.cssText = `
    background: white;
    color: #2c3e50;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 15px;
    border-left: 5px solid #e74c3c;
  `;
  
  
  const icon = document.createElement('i');
  icon.className = 'fas fa-check-circle';
  icon.style.cssText = 'color: #27ae60; font-size: 1.5rem;';
  
  
  const content = document.createElement('div');
  content.style.flex = '1';
  
  const title = document.createElement('p');
  title.textContent = gameData.title;
  title.style.margin = '0 0 5px 0';
  title.style.fontWeight = '600';
  title.style.fontSize = '0.95rem';
  
  const price = document.createElement('p');
  price.textContent = `Precio: $${gameData.price.toFixed(2)}`;
  price.style.margin = '0 0 3px 0';
  price.style.fontSize = '0.9rem';
  price.style.color = '#7f8c8d';
  
  const cartInfo = document.createElement('p');
  cartInfo.textContent = `Artículos en carrito: ${cartCount}`;
  cartInfo.style.margin = '0';
  cartInfo.style.fontSize = '0.85rem';
  cartInfo.style.color = '#3498db';
  cartInfo.style.fontWeight = '600';
  
  content.appendChild(title);
  content.appendChild(price);
  content.appendChild(cartInfo);
  
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 1rem;
    padding: 5px;
    margin: -5px -5px -5px 0;
    border-radius: 50%;
    transition: background 0.2s;
  `;
  closeBtn.addEventListener('mouseover', function() {
    this.style.background = '#f5f5f5';
  });
  closeBtn.addEventListener('mouseout', function() {
    this.style.background = 'none';
  });
  closeBtn.addEventListener('click', function() {
    toast.remove();
  });
  
  toast.appendChild(icon);
  toast.appendChild(content);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);
  
  
  setTimeout(() => {
    if (toast.parentNode === toastContainer) {
      toast.remove();
    }
  }, 3000);
}



function initCartCounter() {
  
  const header = document.querySelector('.header');
  
  if (header && !document.querySelector('.cart-counter')) {
    const cartCounter = document.createElement('div');
    cartCounter.className = 'cart-counter';
    cartCounter.title = 'Ver carrito';
    cartCounter.addEventListener('click', showCartModal);
    header.appendChild(cartCounter);
  }
}

function updateCartCounter() {
  const cartCounter = document.querySelector('.cart-counter');
  if (cartCounter) {
    cartCounter.textContent = cartCount > 99 ? '99+' : cartCount;
    cartCounter.style.display = cartCount > 0 ? 'flex' : 'none';
    
    
    if (cartCount > 0) {
      cartCounter.classList.add('pulse');
      setTimeout(() => {
        cartCounter.classList.remove('pulse');
      }, 500);
    }
  }
}



function initPlatformFilters() {
  const filterBadges = document.querySelectorAll('.filter-badge');
  
  filterBadges.forEach(badge => {
    badge.addEventListener('click', function() {
      const platform = this.getAttribute('data-platform');
      filterByPlatform(platform);
    });
  });
}

function filterByPlatform(platform) {
  currentFilter = platform;
  
  
  const filterBadges = document.querySelectorAll('.filter-badge');
  filterBadges.forEach(badge => {
    if (badge.getAttribute('data-platform') === platform) {
      badge.classList.add('active');
    } else {
      badge.classList.remove('active');
    }
  });
  
 
  const allCards = document.querySelectorAll('.game-card');
  
  allCards.forEach(card => {
    const cardPlatforms = card.getAttribute('data-platforms');
    
    if (platform === 'all' || !cardPlatforms) {
      
      card.style.display = 'block';
      setTimeout(() => {
        card.style.opacity = '1';
      }, 10);
    } else {
      
      const platformsArray = cardPlatforms.split(',').map(p => p.trim());
      
      if (platformsArray.includes(platform)) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
        }, 10);
      } else {
        card.style.opacity = '0.5';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    }
  });
  
  console.log(`Filtrando por plataforma: ${platform}`);
}



function initSearchFunctionality() {
  const searchInput = document.querySelector('.game-search-input');
  
  if (searchInput) {
    
    searchInput.addEventListener('input', function() {
      const query = this.value.trim().toLowerCase();
      searchGames(query);
    });
    
   
    searchInput.addEventListener('search', function() {
      if (this.value === '') {
        searchGames('');
      }
    });
  }
}

function searchGames(query) {
  const allCards = document.querySelectorAll('.game-card');
  
  if (!query) {
    
    allCards.forEach(card => {
      const cardPlatforms = card.getAttribute('data-platforms');
      
      if (currentFilter === 'all' || !cardPlatforms) {
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.boxShadow = '';
        card.style.border = '';
      } else {
        const platformsArray = cardPlatforms.split(',').map(p => p.trim());
        
        if (platformsArray.includes(currentFilter)) {
          card.style.display = 'block';
          card.style.opacity = '1';
          card.style.boxShadow = '';
          card.style.border = '';
        }
      }
    });
    return;
  }
  
  
  allCards.forEach(card => {
    const title = card.querySelector('.card-title').textContent.toLowerCase();
    const subtitle = card.querySelector('.card-subtitle').textContent.toLowerCase();
    const platforms = card.getAttribute('data-platforms')?.toLowerCase() || '';
    
    const matches = title.includes(query) ||
                   subtitle.includes(query) ||
                   platforms.includes(query);
    
    if (matches) {
      card.style.display = 'block';
      card.style.opacity = '1';
      
      
      card.style.boxShadow = '0 5px 20px rgba(231, 76, 60, 0.3)';
      card.style.border = '2px solid #e74c3c';
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
    }
  });
}



function initSortingOptions() {
  const sortSelects = document.querySelectorAll('.sort-select');
  
  sortSelects.forEach(select => {
    select.addEventListener('change', function() {
      const section = this.getAttribute('data-section');
      const sortBy = this.value;
      sortGames(section, sortBy);
    });
  });
}

function sortGames(section, sortBy) {
  let container;
  
 
  if (section === 'recent') {
    container = document.getElementById('recent-games');
  } else if (section === 'offers') {
    container = document.getElementById('offer-games');
  } else if (section === 'top-rated') {
    container = document.getElementById('top-rated-games');
  } else {
    return;
  }
  
  if (!container) return;
  
  const gameElements = Array.from(container.children);
  
  gameElements.sort((a, b) => {
    const cardA = a.querySelector('.game-card');
    const cardB = b.querySelector('.game-card');
    
    if (!cardA || !cardB) return 0;
    
    switch(sortBy) {
      case 'price-asc':
        return parseFloat(cardA.getAttribute('data-price')) - 
               parseFloat(cardB.getAttribute('data-price'));
        
      case 'price-desc':
        return parseFloat(cardB.getAttribute('data-price')) - 
               parseFloat(cardA.getAttribute('data-price'));
        
      case 'rating':
        return parseFloat(cardB.getAttribute('data-rating')) - 
               parseFloat(cardA.getAttribute('data-rating'));
        
      case 'title':
        const titleA = cardA.querySelector('.card-title').textContent.toLowerCase();
        const titleB = cardB.querySelector('.card-title').textContent.toLowerCase();
        return titleA.localeCompare(titleB);
        
      default:
        return 0; 
    }
  });
  
  gameElements.forEach(element => {
    container.appendChild(element);
  });
  
  console.log(`Sección "${section}" ordenada por: ${sortBy}`);
}



function initGameDetailsModal() {
  const gameTitles = document.querySelectorAll('.game-title');
  
  gameTitles.forEach(title => {
    title.addEventListener('click', function(e) {
      e.stopPropagation(); 
      const card = this.closest('.game-card');
      showGameDetails(card);
    });
  });
  
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.btn-comprar')) {
        return;
      }
      showGameDetails(this);
    });
  });
  
  const modalAddToCartBtn = document.getElementById('modalAddToCart');
  if (modalAddToCartBtn) {
    modalAddToCartBtn.addEventListener('click', function() {
      const modalContent = document.getElementById('gameDetailsContent');
      const gameTitle = modalContent.querySelector('h4')?.textContent;
      
      if (gameTitle) {
        const allCards = document.querySelectorAll('.game-card');
        const targetCard = Array.from(allCards).find(card => 
          card.querySelector('.card-title').textContent === gameTitle
        );
        
        if (targetCard) {
          const gameData = extractGameData(targetCard);
          addToCart(gameData);
          
          this.innerHTML = '<i class="fas fa-check me-2"></i>Añadido';
          this.style.backgroundColor = '#27ae60';
          
          updateCartCounter();
          
          setTimeout(() => {
            $('#gameDetailsModal').modal('hide');
            setTimeout(() => {
              this.innerHTML = '<i class="fas fa-shopping-cart me-2"></i>Añadir al Carrito';
              this.style.backgroundColor = '';
            }, 300);
          }, 1000);
        }
      }
    });
  }
}

function showGameDetails(card) {
  const gameData = extractGameData(card);
  const content = document.getElementById('gameDetailsContent');
  
  const discount = gameData.originalPrice > gameData.price 
    ? Math.round((1 - gameData.price / gameData.originalPrice) * 100)
    : 0;
  
  const description = generateGameDescription(gameData.subtitle);
  
  const features = generateGameFeatures(gameData.platforms);
  
  content.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <img src="${gameData.image}" class="img-fluid rounded" alt="${gameData.title}" style="max-height: 400px; object-fit: cover;">
        ${discount > 0 ? `<div class="mt-2 text-center"><span class="badge badge-danger p-2">${discount}% DE DESCUENTO</span></div>` : ''}
      </div>
      <div class="col-md-6">
        <h4>${gameData.title}</h4>
        <h6 class="text-muted">${gameData.subtitle}</h6>
        
        <div class="my-3">
          <span class="rating" style="font-size: 1.2rem;">
            ${generateStarRating(gameData.rating)}
          </span>
          <span class="ml-2">${gameData.rating.toFixed(1)}/5</span>
        </div>
        
        <p><strong>Plataformas:</strong> 
          ${gameData.platforms.map(p => `<span class="badge badge-primary ml-1">${p}</span>`).join(' ')}
        </p>
        
        <div class="my-3">
          ${gameData.originalPrice > gameData.price 
            ? `<p class="mb-1"><strong>Precio original:</strong> <span class="text-muted" style="text-decoration: line-through;">$${gameData.originalPrice.toFixed(2)}</span></p>`
            : ''}
          <p class="mb-0"><strong>Precio actual:</strong> <span style="font-size: 1.8rem; color: #e74c3c; font-weight: bold;">$${gameData.price.toFixed(2)}</span></p>
        </div>
        
        <p class="game-description">${description}</p>
        
        <div class="game-features mt-4">
          <h6>Características principales:</h6>
          <ul class="pl-3">
            ${features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  `;
  
  // Mostrar modal.
  $('#gameDetailsModal').modal('show');
}

function generateStarRating(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let starsHTML = '';
  
  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }
  
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }
  
  return starsHTML;
}

function generateGameDescription(subtitle) {
  const descriptions = {
    'Acción/Aventura': 'Embárcate en una épica aventura llena de acción, combates intensos y una narrativa cautivadora que te mantendrá al borde de tu asiento durante horas.',
    'RPG/Aventura': 'Sumérgete en un mundo de fantasía con un sistema de progresión profundo, toma decisiones que afectan la historia y personaliza tu personaje a tu estilo.',
    'Acción/Supervivencia': 'Sobrevive en un mundo hostil donde cada recurso cuenta. Enfréntate a peligros constantes mientras luchas por mantenerte con vida.',
    'RPG/Acción': 'Combina la profundidad de un RPG con la intensidad de un juego de acción. Mejora tus habilidades, consigue equipo épico y enfréntate a desafiantes enemigos.',
    'Plataformas/Acción': 'Domina movimientos precisos, supera obstáculos creativos y enfréntate a emocionantes combates en este juego de plataformas lleno de acción.',
    'Roguelike/Acción': 'Cada partida es única en este roguelike de acción. Muévete con agilidad, consigue poderes aleatorios y supera oleadas de enemigos desafiantes.'

  };
  
  return descriptions[subtitle] || 'Un título imprescindible para los amantes del género. Con gráficos de última generación y una jugabilidad adictiva, este juego te mantendrá entretenido durante horas.';
}

function generateGameFeatures(platforms) {
  const allFeatures = [
    'Modo historia épico con más de 30 horas de gameplay',
    'Multijugador en línea con soporte para hasta 16 jugadores',
    'Grágficos en 4K con soporte para HDR',
    'Sistema de progresión profundo con árbol de habilidades',
    'Mundo abierto expansivo con actividades secundarias',
    'Personalización completa de personaje y equipo',
    'Banda sonora original compuesta por artistas premiados',
    'Soporte para ray tracing (RTX)',
    'Compatibilidad con next-gen (60 FPS en 4K)',
    'Modo foto para capturar momentos épicos'
  ];
  
  const shuffled = [...allFeatures].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5);
}



function initCartModal() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', checkout);
  }
  
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }
}

function updateCartModal() {
  const cartContent = document.getElementById('cartContent');
  const cartSummary = document.querySelector('.cart-summary');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  
  if (cart.length === 0) {
    cartContent.innerHTML = '<p class="text-center text-muted py-4">El carrito está vacío</p>';
    cartSummary.style.display = 'none';
    checkoutBtn.style.display = 'none';
    clearCartBtn.style.display = 'none';
    return;
  }
  
  let html = '<div class="cart-items">';
  let total = 0;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    html += `
      <div class="cart-item d-flex align-items-center mb-3 p-3 border rounded" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
        <div class="ml-3 flex-grow-1">
          <h6 class="mb-1" style="font-size: 1rem;">${item.title}</h6>
          <p class="mb-1 text-muted small">${item.platforms.join(', ')}</p>
          <div class="d-flex justify-content-between align-items-center mt-2">
            <div>
              <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="decrease" data-index="${index}">
                <i class="fas fa-minus"></i>
              </button>
              <span class="mx-2" style="min-width: 30px; text-align: center; font-weight: bold;">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary quantity-btn" data-action="increase" data-index="${index}">
                <i class="fas fa-plus"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger ml-3 remove-btn" data-index="${index}">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
            <div class="text-right">
              <div class="font-weight-bold" style="font-size: 1.1rem;">$${itemTotal.toFixed(2)}</div>
              <div class="text-muted small">$${item.price.toFixed(2)} c/u</div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  cartContent.innerHTML = html;
  
  document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
  
  cartSummary.style.display = 'block';
  checkoutBtn.style.display = 'inline-block';
  clearCartBtn.style.display = 'inline-block';
  
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      const action = this.dataset.action;
      
      if (action === 'increase') {
        cart[index].quantity += 1;
      } else if (action === 'decrease') {
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
        } else {
          cart.splice(index, 1);
        }
      }
      
      cartCount = cart.reduce((total, item) => total + item.quantity, 0);
      saveCartToStorage();
      updateCartCounter();
      updateCartModal();
    });
  });
  
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.dataset.index);
      const removedItem = cart[index];
      
      if (confirm(`¿Eliminar "${removedItem.title}" del carrito?`)) {
        cart.splice(index, 1);
        
        cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        saveCartToStorage();
        updateCartCounter();
        updateCartModal();
        
        showToastNotification({
          title: `"${removedItem.title}" eliminado`,
          price: removedItem.price
        });
      }
    });
  });
}

function showCartModal() {
  updateCartModal();
  $('#cartModal').modal('show');
}

function checkout() {
  if (cart.length === 0) return;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const gameTitles = cart.map(item => `• ${item.title} (x${item.quantity})`).join('\n');
  
  if (confirm(`¿Confirmar compra?\n\n${gameTitles}\n\nTotal: $${total.toFixed(2)}\n\n¿Proceder al pago?`)) {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const originalText = checkoutBtn.innerHTML;
    
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Procesando...';
    checkoutBtn.disabled = true;
    
    setTimeout(() => {
      checkoutBtn.innerHTML = '<i class="fas fa-check me-2"></i>¡Compra exitosa!';
      checkoutBtn.className = 'btn btn-success';
      
      showToastNotification({
        title: `¡Compra completada!`,
        price: total
      });
      
      setTimeout(() => {
        cart = [];
        cartCount = 0;
        saveCartToStorage();
        updateCartCounter();
        $('#cartModal').modal('hide');
        
        setTimeout(() => {
          checkoutBtn.innerHTML = originalText;
          checkoutBtn.className = 'btn btn-success';
          checkoutBtn.disabled = false;
        }, 300);
      }, 1500);
    }, 2000);
  }
}

function clearCart() {
  if (cart.length === 0) return;
  
  if (confirm(`¿Estás seguro de que quieres vaciar el carrito?\n\nSe eliminarán ${cartCount} artículo(s).`)) {
    cart = [];
    cartCount = 0;
    saveCartToStorage();
    updateCartCounter();
    $('#cartModal').modal('hide');
    
    showToastNotification({
      title: 'Carrito vaciado',
      price: 0
    });
  }
}



function saveCartToStorage() {
  try {
    localStorage.setItem('gamehub_cart', JSON.stringify(cart));
    localStorage.setItem('gamehub_cart_count', cartCount.toString());
  } catch (e) {
    console.error('Error al guardar el carrito en localStorage:', e);
  }
}

function loadCartFromStorage() {
  try {
    const savedCart = localStorage.getItem('gamehub_cart');
    const savedCount = localStorage.getItem('gamehub_cart_count');
    
    if (savedCart) {
      cart = JSON.parse(savedCart);
      cartCount = savedCount ? parseInt(savedCount) : cart.reduce((total, item) => total + item.quantity, 0);
    }
  } catch (e) {
    console.error('Error al cargar el carrito desde localStorage:', e);
    cart = [];
    cartCount = 0;
  }
}


window.GameHub = {
  getCart: () => [...cart],
  getCartCount: () => cartCount,
  clearCart: () => {
    cart = [];
    cartCount = 0;
    saveCartToStorage();
    updateCartCounter();
    console.log('Carrito limpiado');
  },
  showCart: () => showCartModal(),
  addTestGame: () => {
    const testGame = {
      id: 'test-game',
      title: 'Juego de Prueba',
      subtitle: 'Acción/Aventura',
      price: 29.99,
      originalPrice: 39.99,
      platforms: ['PC', 'PS5'],
      image: 'https://via.placeholder.com/150',
      rating: 4.5,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    addToCart(testGame);
  }
};

console.log('GameHub JS cargado correctamente');
console.log('Funciones disponibles en GameHub object:', Object.keys(window.GameHub));
