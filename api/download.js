const scraprModule = require('@coflyn/scrapr');

// Mengantisipasi berbagai cara library diekspor (Default Export, Named Export, atau Direct Function)
const scrapr = scraprModule.scrapr || scraprModule.default || (typeof scraprModule === 'function' ? scraprModule : null);

module.exports = async (req, res) => {
  // CORS Headers agar frontend (Vercel / GitHub Pages) bisa mengakses API
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Jalur khusus untuk preflight request dari browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL tidak boleh kosong!' });
    }

    if (typeof scrapr !== 'function') {
      throw new Error('Gagal memuat fungsi scraper dari @coflyn/scrapr.');
    }

    // Panggil fungsi scraper
    const data = await scrapr(url);

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
};
