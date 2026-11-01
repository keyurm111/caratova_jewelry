(function () {
  if (window.__luxuryCardScriptLoaded) return;
  window.__luxuryCardScriptLoaded = true;

  document.addEventListener('click', function (e) {
    var cartBtn = e.target.closest('.luxury-product-card__btn--cart');
    var buyNowBtn = e.target.closest('.luxury-product-card__btn--buynow');

    if (cartBtn) {
      e.preventDefault();
      e.stopPropagation();
      var variantId = cartBtn.getAttribute('data-variant-id');
      if (!variantId || variantId === '0') {
        var card = cartBtn.closest('.luxury-product-card');
        var link = card ? card.querySelector('a') : null;
        if (link) window.location.href = link.href;
        return;
      }

      var textSpan = cartBtn.querySelector('span');
      var originalText = textSpan ? textSpan.textContent : 'ADD TO CART';
      if (textSpan) textSpan.textContent = 'ADDING...';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: Number(variantId), quantity: 1 })
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (textSpan) textSpan.textContent = 'ADDED!';
        setTimeout(function () {
          if (textSpan) textSpan.textContent = originalText;
        }, 1500);

        // Update cart drawer or cart count
        var cartDrawer = document.querySelector('cart-drawer');
        if (cartDrawer && typeof cartDrawer.open === 'function') {
          cartDrawer.open();
        } else {
          // Refresh cart bubble
          fetch('/?section_id=cart-icon-bubble')
            .then(function (r) { return r.text(); })
            .then(function (html) {
              var parser = new DOMParser();
              var doc = parser.parseFromString(html, 'text/html');
              var newBubble = doc.querySelector('#cart-icon-bubble');
              var curBubble = document.querySelector('#cart-icon-bubble');
              if (newBubble && curBubble) curBubble.innerHTML = newBubble.innerHTML;
            });
        }
      })
      .catch(function (err) {
        console.error('Add to cart failed:', err);
        if (textSpan) textSpan.textContent = originalText;
      });
    }

    if (buyNowBtn) {
      e.preventDefault();
      e.stopPropagation();
      var variantId = buyNowBtn.getAttribute('data-variant-id');
      if (!variantId || variantId === '0') {
        var card = buyNowBtn.closest('.luxury-product-card');
        var link = card ? card.querySelector('a') : null;
        if (link) window.location.href = link.href;
        return;
      }

      var textSpan = buyNowBtn.querySelector('span');
      if (textSpan) textSpan.textContent = 'PROCESSING...';

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: Number(variantId), quantity: 1 })
      })
      .then(function () {
        window.location.href = '/checkout';
      })
      .catch(function () {
        window.location.href = '/checkout';
      });
    }
  });
})();

