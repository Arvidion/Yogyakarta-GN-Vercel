const path = require('path');
const { supabase } = require('../config/supabase');
const { IMAGE_TYPES } = require('../middleware/upload');

function sanitizeBaseName(name) {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 80) || 'file';
}

async function uploadFiles(req, res) {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'Tidak ada file yang diunggah' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const folder = IMAGE_TYPES.has(file.mimetype) ? 'images' : 'documents';
      const ext = path.extname(file.originalname).toLowerCase();
      const base = sanitizeBaseName(path.basename(file.originalname, ext));
      const filePath = `${folder}/${Date.now()}-${base}${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Gagal mengunggah ${file.originalname}: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      };
    });

    const files = await Promise.all(uploadPromises);
    res.status(201).json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

function handleUploadError(error, req, res, next) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file melebihi batas maksimal 10 MB' });
  }
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Jumlah file melebihi batas' });
  }
  if (error.message) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
}

module.exports = { uploadFiles, handleUploadError };
