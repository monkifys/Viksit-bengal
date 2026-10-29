/**
 * Autonomous AI News Scraper Bot for WB Accountability Tracker
 * Direct SQLite Database Integration
 */

const https = require('https');
const http = require('http');
const db = require('./db');

const SEARCH_QUERIES = [
  'West Bengal cabinet decision',
  'West Bengal government order notification',
  'West Bengal Suvendu Adhikari scheme',
  'West Bengal DA arrears government employees',
  'West Bengal border fencing infiltration',
  'West Bengal Ayushman Bharat health insurance',
  'West Bengal women free bus transport',
  'West Bengal education teacher recruitment',
  'West Bengal industry investment Haldia IT'
];

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function parseRss(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const titleMatch = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i) || content.match(/<title>(.*?)<\/title>/i);
    const linkMatch = content.match(/<link>(.*?)<\/link>/i);
    const pubDateMatch = content.match(/<pubDate>(.*?)<\/pubDate>/i);
    const sourceMatch = content.match(/<source[^>]*>(.*?)<\/source>/i);
    const descMatch = content.match(/<description>([\s\S]*?)<\/description>/i);

    let cleanDesc = '';
    if (descMatch) {
      cleanDesc = descMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
    }

    let title = titleMatch ? titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : '';
    let link = linkMatch ? linkMatch[1].trim() : '';
    let pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
    let source = sourceMatch ? sourceMatch[1].replace(/&amp;/g, '&').trim() : 'Media Wire';

    if (title.includes(' - ') && source === 'Media Wire') {
      const parts = title.split(' - ');
      source = parts.pop().trim();
      title = parts.join(' - ').trim();
    }

    if (title && link) {
      items.push({ title, link, pubDate, source, desc: cleanDesc });
    }
  }
  return items;
}

function evaluateMatch(article, promises) {
  const textToAnalyze = (article.title + ' ' + article.desc).toLowerCase();
  
  let bestMatch = null;
  let highestScore = 0;
  let suggestedStatus = 'inprogress';

  for (const promise of promises) {
    let score = 0;
    const keywords = promise.keywords || [];

    for (const kw of keywords) {
      const kwClean = kw.toLowerCase().trim();
      if (!kwClean || kwClean.length < 3) continue;
      if (textToAnalyze.includes(kwClean)) {
        score += 15;
      }
    }

    if (promise.category && textToAnalyze.includes(promise.category.replace('-', ' '))) {
      score += 10;
    }

    if (textToAnalyze.includes('cabinet') || textToAnalyze.includes('suvendu adhikari') || textToAnalyze.includes('west bengal')) {
      score += 8;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = promise;
    }
  }

  if (/operational|completed|inaugurated|handed over|fully delivered/i.test(textToAnalyze)) {
    suggestedStatus = 'delivered';
  } else if (/shelved|scrapped|abandoned|repealed|cancelled|withdrawn/i.test(textToAnalyze)) {
    suggestedStatus = 'reversed';
  } else if (/delayed|stalled|slow progress|put on hold/i.test(textToAnalyze)) {
    suggestedStatus = 'delayed';
  } else if (/funded|allocated|budget sanction|financial approval/i.test(textToAnalyze)) {
    suggestedStatus = 'funded';
  } else if (/gazette|notified|orders issued|enacted|bill passed|ordinance/i.test(textToAnalyze)) {
    suggestedStatus = 'legally_initiated';
  } else {
    suggestedStatus = 'under_implementation';
  }

  const confidenceScore = Math.min(Math.round(highestScore * 1.5), 98);

  return {
    bestMatch,
    confidenceScore,
    suggestedStatus
  };
}

async function runScraper() {
  console.log('🤖 AI News Scraper Bot running against SQLite database...');
  const promises = db.getPromises();
  const existingUpdates = db.getUpdates(1000);
  const queue = db.getScrapedQueue();

  const existingUrls = new Set();
  const existingTitles = new Set();

  existingUpdates.forEach(u => {
    if (u.sources) u.sources.forEach(s => s.url && existingUrls.add(s.url.trim()));
    if (u.title_en) existingTitles.add(u.title_en.toLowerCase().trim());
  });

  queue.forEach(q => {
    if (q.sourceUrl) existingUrls.add(q.sourceUrl.trim());
    if (q.newsTitle) existingTitles.add(q.newsTitle.toLowerCase().trim());
  });

  let totalScraped = 0;
  let newCandidates = 0;

  for (const query of SEARCH_QUERIES) {
    const encoded = encodeURIComponent(query);
    const feedUrl = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;
    try {
      console.log(`[RSS] Fetching feed for query: "${query}"...`);
      const xml = await fetchUrl(feedUrl);
      const items = parseRss(xml);
      totalScraped += items.length;

      for (const item of items) {
        if (existingUrls.has(item.link.trim()) || existingTitles.has(item.title.toLowerCase().trim())) {
          continue;
        }

        if (item.pubDate) {
          const itemYear = new Date(item.pubDate).getFullYear();
          if (!isNaN(itemYear) && itemYear < 2025) {
            continue;
          }
        }

        const match = evaluateMatch(item, promises);

        if (match.bestMatch && match.confidenceScore >= 35) {
          const formattedDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          const cleanSnippet = item.desc ? item.desc.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim() : item.title;

          const candidate = {
            id: 'cand-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            scrapedAt: new Date().toISOString(),
            sourceName: item.source || 'News Wire',
            sourceUrl: item.link,
            pubDate: formattedDate,
            newsTitle: item.title,
            newsSnippet: cleanSnippet,
            matchedPromiseId: match.bestMatch.id,
            matchedPromiseText: match.bestMatch.text_en,
            matchedCategory: match.bestMatch.category,
            confidenceScore: match.confidenceScore,
            suggestedStatus: match.suggestedStatus,
            proposedTitleEn: item.title,
            proposedTitleBn: match.bestMatch.highlight_bn || (match.bestMatch.text_bn ? match.bestMatch.text_bn.substring(0, 100) + '...' : ''),
            proposedNoteEn: cleanSnippet || `Reported on ${formattedDate} by ${item.source}: ${item.title}. Verified under administrative follow-up.`,
            proposedNoteBn: `${item.source} সূত্রে প্রকাশ (${formattedDate}): ${item.title} সংক্রান্ত সরকারি পদক্ষেপ গ্রহণ করা হয়েছে।`
          };

          db.addToScrapedQueue(candidate);
          existingUrls.add(item.link.trim());
          existingTitles.add(item.title.toLowerCase().trim());
          newCandidates++;
        }
      }
    } catch (err) {
      console.warn(`[WARN] Failed to fetch feed for "${query}": ${err.message}`);
    }
  }

  const updatedQueue = db.getScrapedQueue();
  console.log(`✅ Scraper finished. Stored in SQLite database. Total raw: ${totalScraped}, New added: ${newCandidates}, Total in Queue: ${updatedQueue.length}`);
  return {
    success: true,
    totalScraped,
    newCandidates,
    queueTotal: updatedQueue.length
  };
}

if (require.main === module) {
  runScraper()
    .then(res => console.log('Result:', res))
    .catch(err => console.error('Error:', err));
}

module.exports = { runScraper };
