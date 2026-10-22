import scrapperPkg from '@coflyn/scrapr';

export default async function handler(req, res) {
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

    // Mendeteksi berbagai kemungkinan bentuk ekspor dari library @coflyn/scrapr
    const scraperFunc = typeof scrapperPkg === 'function' 
      ? scrapperPkg 
      : (scrapperPkg.default || scrapperPkg.scrapr || scrapperPkg.download);

    if (typeof scraperFunc !== 'function') {
      // Mengirim detail tipe data agar kita tahu bentuk aslinya jika masih error
      throw new Error(`Struktur modul tidak dikenali (Tipe: ${typeof scrapperPkg})`);
    }

    const data = await scraperFunc(url);

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
