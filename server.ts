import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  const publicUploadsDir = path.join(__dirname, 'public', 'uploads');
  if (!fs.existsSync(publicUploadsDir)) {
    fs.mkdirSync(publicUploadsDir, { recursive: true });
  }

  // Serve uploads statically
  app.use('/uploads', express.static(publicUploadsDir));

  // Upload API: writes image to disk in public/uploads/ and updates persistedPhotos.json
  app.post('/api/upload', (req, res) => {
    try {
      const { key, dataUrl } = req.body;
      if (!key || !dataUrl) {
        return res.status(400).json({ error: 'Missing key or dataUrl' });
      }

      let finalUrl = dataUrl;

      // If it's a data URL, write to disk
      if (dataUrl.startsWith('data:')) {
        const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: 'Invalid data URL' });
        }

        const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
        const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${cleanKey}.${ext}`;
        const filePath = path.join(publicUploadsDir, filename);

        const buffer = Buffer.from(matches[2], 'base64');
        fs.writeFileSync(filePath, buffer);

        // If dist/uploads exists, mirror there
        const distUploadsDir = path.join(__dirname, 'dist', 'uploads');
        if (fs.existsSync(distUploadsDir)) {
          fs.writeFileSync(path.join(distUploadsDir, filename), buffer);
        }

        finalUrl = `/uploads/${filename}?t=${Date.now()}`;
      }

      // Persist to src/persistedPhotos.json so the build permanently bakes it
      const persistedPhotosFile = path.join(__dirname, 'src', 'persistedPhotos.json');
      let current: any = { certificates: {}, artworks: {} };
      if (fs.existsSync(persistedPhotosFile)) {
        try {
          current = JSON.parse(fs.readFileSync(persistedPhotosFile, 'utf-8'));
          if (!current.certificates) current.certificates = {};
          if (!current.artworks) current.artworks = {};
        } catch (_) {}
      }

      if (key === 'portrait' || key === 'anb_photo_portrait') {
        current.portrait = finalUrl;
      } else if (key === 'leve' || key === 'anb_photo_leve') {
        current.leve = finalUrl;
      } else if (key === 'rowbot' || key === 'anb_photo_rowbot') {
        current.rowbot = finalUrl;
      } else if (key.startsWith('anb_cert_')) {
        const id = key.replace('anb_cert_', '');
        current.certificates[id] = finalUrl;
      } else if (key.startsWith('cert-')) {
        current.certificates[key] = finalUrl;
      } else if (key.startsWith('anb_art_')) {
        const id = key.replace('anb_art_', '');
        current.artworks[id] = finalUrl;
      } else if (key.startsWith('art-')) {
        current.artworks[key] = finalUrl;
      }

      fs.writeFileSync(persistedPhotosFile, JSON.stringify(current, null, 2), 'utf-8');
      fs.writeFileSync(path.join(__dirname, 'public', 'persistedPhotos.json'), JSON.stringify(current, null, 2), 'utf-8');

      // Trigger background build so dist/ is immediately updated
      exec('npm run build', (err) => {
        if (err) console.warn('Background build warning:', err.message);
      });

      return res.json({ success: true, url: finalUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  // Site content API: keeps site-content.json synced on disk
  const contentFile = path.join(__dirname, 'public', 'site-content.json');

  app.get('/api/site-content', (req, res) => {
    try {
      if (fs.existsSync(contentFile)) {
        const data = fs.readFileSync(contentFile, 'utf-8');
        return res.json(JSON.parse(data));
      }
      return res.json({});
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/site-content', (req, res) => {
    try {
      const data = JSON.stringify(req.body, null, 2);
      fs.writeFileSync(contentFile, data, 'utf-8');

      // Mirror to dist if dist exists
      const distContentFile = path.join(__dirname, 'dist', 'site-content.json');
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        fs.writeFileSync(distContentFile, data, 'utf-8');
      }

      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Photo Sync API: writes image URLs directly to src/persistedPhotos.json
  const persistedPhotosFile = path.join(__dirname, 'src', 'persistedPhotos.json');

  app.get('/api/sync-photos', (req, res) => {
    try {
      if (fs.existsSync(persistedPhotosFile)) {
        return res.json(JSON.parse(fs.readFileSync(persistedPhotosFile, 'utf-8')));
      }
      return res.json({});
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/sync-photos', (req, res) => {
    try {
      const payload = req.body;
      let current: any = {};
      if (fs.existsSync(persistedPhotosFile)) {
        try {
          current = JSON.parse(fs.readFileSync(persistedPhotosFile, 'utf-8'));
        } catch (_) {}
      }

      const merged = {
        portrait: payload.portrait !== undefined ? payload.portrait : (current.portrait || ''),
        leve: payload.leve !== undefined ? payload.leve : (current.leve || ''),
        rowbot: payload.rowbot !== undefined ? payload.rowbot : (current.rowbot || ''),
        certificates: {
          ...(current.certificates || {}),
          ...(payload.certificates || {}),
        },
        artworks: {
          ...(current.artworks || {}),
          ...(payload.artworks || {}),
        },
      };

      fs.writeFileSync(persistedPhotosFile, JSON.stringify(merged, null, 2), 'utf-8');

      // Also copy to public
      fs.writeFileSync(path.join(__dirname, 'public', 'persistedPhotos.json'), JSON.stringify(merged, null, 2), 'utf-8');

      // Trigger background build so dist/ is immediately updated
      exec('npm run build', (err) => {
        if (err) console.warn('Background build warning:', err.message);
      });

      return res.json({ success: true, photos: merged });
    } catch (e: any) {
      console.error('Error syncing photos to codebase:', e);
      return res.status(500).json({ error: e.message });
    }
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

createServer();
