(function () {
  // Prevent duplicate injection
  if (document.getElementById('static-share-widget-root')) return;

  // 1. Inject Premium CSS aligned with the WB Accountability style system
  const css = `
    /* Floating Trigger Button - Positioned Middle Center-Right */
    .static-share-trigger {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 99999;
      background-color: #128C7E; /* Premium WhatsApp Brand Teal-Green */
      color: #ffffff;
      border: none;
      border-radius: 20px 0 0 20px;
      width: 44px;
      height: 44px;
      cursor: pointer;
      box-shadow: -3px 0 12px rgba(15, 17, 23, 0.12);
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .static-share-trigger:hover {
      width: 50px;
      background-color: #0b7367; /* Deeper WhatsApp Teal-Green on hover */
      box-shadow: -4px 0 16px rgba(15, 17, 23, 0.18);
    }

    /* Hidden Checkbox for CSS Toggle */
    .static-share-checkbox {
      display: none;
    }

    /* Modal Overlay Backdrop with Glassmorphism */
    .static-share-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 17, 23, 0.4);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s ease;
      z-index: 999999;
    }

    .static-share-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    /* Centered Share Modal Box */
    .static-share-modal {
      background: var(--paper);
      padding: 28px;
      border-radius: 12px;
      position: relative;
      z-index: 1000000;
      width: 90%;
      max-width: 380px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
      border: 1px solid var(--rule-light);
      transform: scale(0.95) translateY(15px);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
      color: var(--ink);
    }

    /* Checkbox state modifications */
    .static-share-checkbox:checked ~ .static-share-overlay {
      opacity: 1;
      visibility: visible;
    }

    .static-share-checkbox:checked ~ .static-share-overlay .static-share-modal {
      transform: scale(1) translateY(0);
    }

    .static-share-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .static-share-header h3 {
      margin: 0;
      font-family: var(--font-display), serif;
      font-size: 22px;
      font-weight: 700;
      color: var(--ink);
    }

    .static-share-close {
      font-size: 26px;
      cursor: pointer;
      line-height: 1;
      color: var(--ink-faint);
      transition: color 0.2s;
    }

    .static-share-close:hover {
      color: var(--saffron);
    }

    /* Grid layout for options */
    .static-share-options {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .static-share-options a, .static-share-options button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      background: var(--paper-warm);
      border: 1px solid var(--rule-light);
      border-radius: 8px;
      text-decoration: none;
      color: var(--ink-mid);
      font-family: var(--font-ui), sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .static-share-options a:hover, .static-share-options button:hover {
      background: var(--saffron-pale);
      border-color: var(--saffron-mid);
      color: var(--saffron-dark);
    }

    /* Copy Feedback Alert */
    .static-copy-feedback {
      display: none;
      text-align: center;
      color: #27500A; /* Done indicator green */
      background: #F5FCF8;
      border: 1px solid #C5ECD0;
      padding: 8px;
      border-radius: 6px;
      margin-top: 18px;
      font-family: var(--font-mono), monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `;

  const styleNode = document.createElement('style');
  styleNode.textContent = css;
  document.head.appendChild(styleNode);

  // 2. Inject HTML structure before the closing body tag
  const html = `
    <input type="checkbox" id="static-share-trigger" class="static-share-checkbox">
    
    <button id="static-share-btn" class="static-share-trigger" aria-label="Share this page">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="18" cy="5" r="3"></circle>
        <circle cx="6" cy="12" r="3"></circle>
        <circle cx="18" cy="19" r="3"></circle>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
      </svg>
    </button>

    <div class="static-share-overlay">
      <label for="static-share-trigger" class="static-share-backdrop"></label>
      <div class="static-share-modal">
        <div class="static-share-header">
          <h3>Share This Page</h3>
          <label for="static-share-trigger" class="static-share-close">&times;</label>
        </div>
        <div class="static-share-options">
          <a href="#" id="static-link-wa" target="_blank" rel="nofollow noopener">WhatsApp</a>
          <a href="#" id="static-link-tg" target="_blank" rel="nofollow noopener">Telegram</a>
          <a href="#" id="static-link-fb" target="_blank" rel="nofollow noopener">Facebook</a>
          <a href="#" id="static-link-tw" target="_blank" rel="nofollow noopener">X (Twitter)</a>
          <button id="static-link-copy">Copy Link</button>
        </div>
        <div id="static-copy-success" class="static-copy-feedback">Link Copied Successfully!</div>
      </div>
    </div>
  `;

  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'static-share-widget-root';
  widgetContainer.innerHTML = html;
  document.body.appendChild(widgetContainer);

  // 3. Set up functionality
  const shareBtn = document.getElementById('static-share-btn');
  const shareTrigger = document.getElementById('static-share-trigger');
  const copyBtn = document.getElementById('static-link-copy');
  const copySuccess = document.getElementById('static-copy-success');

  const pageUrl = window.location.href;
  const pageTitle = document.title;

  // Pull description snippet from meta tag (up to 200 chars)
  const metaDesc = document.querySelector('meta[name="description"]');
  const rawDesc = metaDesc ? metaDesc.getAttribute('content') : '';
  const snippet = rawDesc.length > 200 ? rawDesc.slice(0, 197) + '...' : rawDesc;

  // Rich share text: title + snippet + link
  const richText = snippet
    ? `${pageTitle}\n\n${snippet}\n\nRead more:` 
    : `${pageTitle}\n\nRead more:`;

  // Build target share links dynamically with rich text
  document.getElementById('static-link-wa').href = `https://wa.me/?text=${encodeURIComponent(richText + ' ' + pageUrl)}`;
  document.getElementById('static-link-tg').href = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(richText)}`;
  document.getElementById('static-link-fb').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
  document.getElementById('static-link-tw').href = `https://x.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`;

  // Intercept trigger button click
  shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: snippet || pageTitle,
          url: pageUrl
        });
      } catch (err) {
        console.warn('Native share dismissed or failed:', err);
      }
    } else {
      // Fallback: manually toggle checkbox for CSS modal
      shareTrigger.checked = !shareTrigger.checked;
    }
  });

  // Handle Clipboard Copy
  copyBtn.addEventListener('click', () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pageUrl)
        .then(() => showFeedback())
        .catch(err => console.error('Clipboard error:', err));
    } else {
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = pageUrl;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showFeedback();
      } catch (err) {
        console.error('Fallback copy error:', err);
      }
      document.body.removeChild(textArea);
    }
  });

  function showFeedback() {
    copySuccess.style.display = 'block';
    setTimeout(() => {
      copySuccess.style.display = 'none';
    }, 2000);
  }
})();

  // 4. Preserve query parameters and hash for language toggle dynamically
  document.addEventListener('click', function(e) {
    const langToggle = e.target.closest('.lang-toggle-simple') || e.target.closest('.lang-toggle');
    if (langToggle) {
      e.preventDefault();
      const isCurrentlyBn = document.documentElement.lang === 'bn';
      localStorage.setItem('lang', isCurrentlyBn ? 'en' : 'bn');
      const baseHref = langToggle.getAttribute('href').split('?')[0];
      const search = window.location.search;
      const hash = window.location.hash;
      window.location.href = baseHref + search + hash;
    }
  });
