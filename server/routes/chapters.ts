import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const countWords = (content: string) => {
  if (!content) return 0;
  return content.replace(/<[^>]*>?/gm, ' ').trim().split(/\s+/).filter(Boolean).length;
};

// Get chapters for a novel
router.get('/novel/:novelId', async (req, res) => {
  try {
    const [chapters] = await pool.query(
      'SELECT id, novel_id as novelId, title, word_count as wordCount, created_at as createdAt FROM chapters WHERE novel_id = ? ORDER BY created_at ASC',
      [req.params.novelId]
    );
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get a specific chapter
router.get('/:id', async (req, res) => {
  try {
    const [chapters] = await pool.query('SELECT * FROM chapters WHERE id = ?', [req.params.id]);
    const chapter = (chapters as any[])[0];
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });
    
    // Convert to camelCase
    res.json({
      id: chapter.id,
      novelId: chapter.novel_id,
      title: chapter.title,
      content: chapter.content,
      wordCount: chapter.word_count,
      createdAt: chapter.created_at
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Create chapter
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { novelId, title, content, wordCount } = req.body;

    // Check if user is uploader or admin
    const [novels] = await pool.query('SELECT uploader_id FROM novels WHERE id = ?', [novelId]);
    const novel = (novels as any[])[0];
    if (!novel) return res.status(404).json({ message: 'Novel not found' });

    const isAdmin = req.user?.roles.includes('Admin') || req.user?.roles.includes('SSR');
    if (novel.uploader_id !== req.user?.id && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const id = uuidv4();
    const calculatedWordCount = countWords(content);
    await pool.query(
      'INSERT INTO chapters (id, novel_id, title, content, word_count) VALUES (?, ?, ?, ?, ?)',
      [id, novelId, title, content, calculatedWordCount]
    );

    res.status(201).json({ id, message: 'Chapter created successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Delete chapter
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user is uploader or admin
    const [chapters] = await pool.query('SELECT novel_id FROM chapters WHERE id = ?', [id]);
    const chapter = (chapters as any[])[0];
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const [novels] = await pool.query('SELECT uploader_id FROM novels WHERE id = ?', [chapter.novel_id]);
    const novel = (novels as any[])[0];

    const isAdmin = req.user?.roles.includes('Admin') || req.user?.roles.includes('SSR');
    if (novel.uploader_id !== req.user?.id && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Update chapter
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Check permissions
    const [chapters] = await pool.query('SELECT novel_id FROM chapters WHERE id = ?', [id]);
    const chapter = (chapters as any[])[0];
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const [novels] = await pool.query('SELECT uploader_id FROM novels WHERE id = ?', [chapter.novel_id]);
    const novel = (novels as any[])[0];

    const isAdmin = req.user?.roles.includes('Admin') || req.user?.roles.includes('SSR');
    if (novel.uploader_id !== req.user?.id && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const calculatedWordCount = countWords(content);
    await pool.query(
      'UPDATE chapters SET title = ?, content = ?, word_count = ? WHERE id = ?',
      [title, content, calculatedWordCount, id]
    );

    res.json({ message: 'Chapter updated successfully', wordCount: calculatedWordCount });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
