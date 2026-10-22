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

    let data = null;
    const lowerUrl = url.toLowerCase();

    // Pilih fungsi scraper yang spesifik sesuai URL
    if ((lowerUrl.includes('tiktok.com') || lowerUrl.includes('vt.tiktok')) && typeof scrapr.tiktok === 'function') {
      data = await scrapr.tiktok(url);
    } else if ((lowerUrl.includes('instagram.com') || lowerUrl.includes('instagr.am')) && typeof scrapr.instagram === 'function') {
      data = await scrapr.instagram(url);
    } else if ((lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) && typeof scrapr.youtube === 'function') {
      data = await scrapr.youtube(url);
    } else if (lowerUrl.includes('facebook.com') && typeof scrapr.facebook === 'function') {
      data = await scrapr.facebook(url);
    } else if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') && typeof scrapr.twitter === 'function') {
      data = await scrapr.twitter(url);
    } else if (typeof scrapr.resolver === 'function') {
      // Gunakan resolver otomatis untuk platform lain
      data = await scrapr.resolver(url);
    } else if (typeof scrapr.default === 'function') {
      data = await scrapr.default(url);
    } else {
      throw new Error('Platform tidak didukung atau metode scraper tidak tersedia.');
    }

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
