import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET reflection by date for authenticated user
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('date', date)
      .maybeSingle();

    if (error) throw error;
    res.json({ success: true, data: data || null });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPSERT reflection for authenticated user
router.post('/', async (req, res) => {
  try {
    const { date, content } = req.body;
    const { data, error } = await supabase
      .from('daily_reflections')
      .upsert(
        [{ user_id: req.user.id, date, content, updated_at: new Date().toISOString() }],
        { onConflict: 'user_id,date' }
      )
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

