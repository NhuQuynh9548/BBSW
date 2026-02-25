import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Configure Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
    // JPEG variants
    'image/jpeg',
    'image/jpg',
    'image/jfif',
    'image/pjpeg',
    'image/pjp',
    // PNG
    'image/png',
    'image/apng',
    // BMP
    'image/bmp',
    'image/x-bmp',
    'image/x-ms-bmp',
    'image/dib',
    // GIF
    'image/gif',
    // WEBP
    'image/webp',
    // HEIC / HEIF (Apple)
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence',
    // TIFF
    'image/tiff',
    'image/x-tiff',
    // AVIF / AV1
    'image/avif',
    'image/avif-sequence',
    // JPEG XL
    'image/jxl',
    // SVG
    'image/svg+xml',
    // ICO
    'image/x-icon',
    'image/vnd.microsoft.icon',
    // Camera RAW
    'image/x-adobe-dng',
    'image/x-canon-cr2',
    'image/x-canon-cr3',
    'image/x-nikon-nef',
    'image/x-sony-arw',
    'image/x-panasonic-rw2',
    'image/x-olympus-orf',
    'image/x-fuji-raf',
    'image/x-raw',
    // Photoshop
    'image/vnd.adobe.photoshop',
    'image/x-photoshop',
    // PDF
    'application/pdf',
    // Video
    'video/mp4',
    'video/x-m4v',
    'video/quicktime',       // .mov
    'video/x-msvideo',       // .avi
    'video/x-matroska',      // .mkv
    'video/webm',
    'video/3gpp',
    'video/3gpp2',
    'video/ogg',
    'video/mpeg',
    'video/x-mpeg',
    'video/x-ms-wmv',        // .wmv
    'video/x-flv',           // .flv
    'video/hevc',            // .hevc / .h265
    'video/H264',
    'video/H265',
    'video/x-h264',
    'video/x-h265',
]);

// Allowed file extensions
const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|jpe|jfif|jif|jfi|pjpeg|pjp|png|apng|bmp|dib|gif|webp|heic|heif|heicv|heics|heivs|tiff|tif|avif|jxl|svg|svgz|ico|cur|dng|cr2|cr3|nef|nrw|arw|srf|sr2|rw2|orf|raf|raw|psd|psb|pdf|mp4|m4v|mov|avi|mkv|webm|3gp|3g2|ogv|mpeg|mpg|wmv|flv|hevc|h264|h265|ts|mts|m2ts|mxf|vob|rm|rmvb|asf|divx|xvid|f4v|m2v|m4p|m4b|mp2|mpe|mpv|ogm|qt)$/i;

const upload = multer({
    storage: storage,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '') || 500 * 1024 * 1024 }, // 500MB default (for video)
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        // Accept if mime type is any image/* or video/* OR is in our allowed set OR extension matches
        const mimeOk = ALLOWED_MIME_TYPES.has(file.mimetype)
            || file.mimetype.startsWith('image/')
            || file.mimetype.startsWith('video/');
        const extOk = ALLOWED_EXTENSIONS.test(file.originalname);

        if (mimeOk || extOk) {
            return cb(null, true);
        }
        cb(new Error(`Định dạng file không được hỗ trợ: "${ext || file.originalname}". Chỉ chấp nhận ảnh (JPG, PNG, HEIC, HEICV, BMP, GIF, WEBP, AVIF, RAW, PSD,...), video (MP4, MKV, MOV, AVI, HEVC,...) và PDF.`));
    }
});

// POST /api/upload
router.post('/', (req: AuthRequest, res: Response, next: NextFunction) => {
    upload.array('files')(req as any, res, (err: any) => {
        if (err instanceof multer.MulterError) {
            // Multer-specific error (e.g. file too large)
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File quá lớn. Kích thước tối đa là 10MB.' });
            }
            return res.status(400).json({ error: 'Lỗi upload file: ' + err.message });
        } else if (err) {
            // fileFilter error or other error
            return res.status(400).json({ error: err.message });
        }

        try {
            if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
                return res.status(400).json({ error: 'Không có file nào được upload' });
            }

            const files = (req.files as Express.Multer.File[]).map(file => {
                const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
                const videoExts = new Set(['mp4','m4v','mov','avi','mkv','webm','3gp','3g2','ogv','mpeg','mpg','wmv','flv','hevc','h264','h265','ts','mts','m2ts','mxf','vob','rm','rmvb','asf','divx','xvid','f4v']);
                let fileType = file.mimetype;
                if (!fileType || fileType === 'application/octet-stream') {
                    fileType = videoExts.has(ext) ? `video/${ext}` : `image/${ext}`;
                }
                return {
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType,
                    fileUrl: `/api/uploads/${file.filename}`
                };
            });

            res.json(files);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    });
});

export default router;
