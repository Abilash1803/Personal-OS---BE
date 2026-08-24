import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET focus sessions for authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('started_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE focus session for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, daily_task_id, started_at, actual_duration, paused_duration, status, notes } = req.body;
    const { data, error } = await supabase
      .from('focus_sessions')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        daily_task_id: daily_task_id || null,
        started_at: started_at || new Date().toISOString(),
        actual_duration: actual_duration || 0,
        paused_duration: paused_duration || 0,
        status: status || 'Running',
        notes: notes || '',
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE focus session for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('focus_sessions')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

