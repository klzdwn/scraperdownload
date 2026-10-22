import * as scrapperPkg from '@coflyn/scrapr';

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

    // Mencari properti apa pun di dalam modul yang berupa fungsi
    const possibleKeys = Object.keys(scrapperPkg);
    let scraperFunc = null;

    for (const key of possibleKeys) {
      if (typeof scrapperPkg[key] === 'function') {
        scraperFunc = scrapperPkg[key];
        break;
      }
    }

    // Fallback jika ada default export
    if (!scraperFunc && scrapperPkg.default && typeof scrapperPkg.default === 'function') {
      scraperFunc = scrapperPkg.default;
    }

    if (typeof scraperFunc !== 'function') {
      throw new Error(`Tidak ditemukan fungsi di dalam modul. Keys: ${possibleKeys.join(', ')}`);
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
