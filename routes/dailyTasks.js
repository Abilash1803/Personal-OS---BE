import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET daily tasks for authenticated user
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', req.user.id);

    if (date) {
      query = query.eq('date', date);
    }
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE / UPSERT daily task for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, template_id, date, status, completed_at, actual_minutes } = req.body;
    const { data, error } = await supabase
      .from('daily_tasks')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        template_id: template_id || null,
        date,
        status: status || 'Pending',
        completed_at: completed_at || null,
        actual_minutes: actual_minutes || 0,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE daily task for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('daily_tasks')
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

// DELETE daily task for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

