import * as scrapr from '@coflyn/scrapr';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL tidak boleh kosong!' });
    }

    const lowerUrl = url.toLowerCase();
    let targetModule = null;

    // 1. Tentukan modul target berdasarkan URL
    if (lowerUrl.includes('tiktok') || lowerUrl.includes('vt.tiktok')) {
      targetModule = scrapr.tiktok;
    } else if (lowerUrl.includes('instagram') || lowerUrl.includes('instagr.am')) {
      targetModule = scrapr.instagram;
    } else if (lowerUrl.includes('youtube') || lowerUrl.includes('youtu.be')) {
      targetModule = scrapr.youtube;
    } else if (lowerUrl.includes('facebook') || lowerUrl.includes('fb.watch')) {
      targetModule = scrapr.facebook;
    } else if (lowerUrl.includes('twitter') || lowerUrl.includes('x.com')) {
      targetModule = scrapr.twitter;
    } else {
      targetModule = scrapr.resolver || scrapr.default;
    }

    // 2. Cari fungsi eksekusi dari targetModule
    let fetchFn = null;

    if (typeof targetModule === 'function') {
      fetchFn = targetModule;
    } else if (targetModule && typeof targetModule === 'object') {
      // Cari fungsi di dalam objek modul (misal: targetModule.download, targetModule.default, dll)
      fetchFn = targetModule.download || targetModule.default || targetModule.scrape || targetModule.getVideo;
      if (!fetchFn) {
        // Ambil fungsi pertama yang ditemukan di dalam objek tersebut
        for (const key of Object.keys(targetModule)) {
          if (typeof targetModule[key] === 'function') {
            fetchFn = targetModule[key];
            break;
          }
        }
      }
    }

    if (typeof fetchFn !== 'function') {
      throw new Error(`Gagal menemukan fungsi ekstraksi untuk URL ini. Structural Type: ${typeof targetModule}`);
    }

    // 3. Jalankan fungsi scraper
    const data = await fetchFn(url);

    return res.status(200).json({
      success: true,
      result: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengekstrak link.'
    });
  }
}
