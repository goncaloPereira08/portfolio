import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Garante que a pasta de uploads existe (antes era preciso criá-la à mão)
fs.mkdirSync('uploads', { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// Só são aceites imagens e vídeos: a pasta é servida publicamente em /uploads,
// por isso ficheiros HTML/JS enviados por utilizadores seriam um risco de XSS.
const TIPOS_PERMITIDOS = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime))$/;

export const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.test(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de ficheiro não suportado. Envie uma imagem ou um vídeo.'));
  }
});
