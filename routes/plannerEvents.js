import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET planner events for authenticated user
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase
      .from('planner_events')
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

// CREATE planner event for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, title, type, date, time, description, linked_task_id } = req.body;
    const { data, error } = await supabase
      .from('planner_events')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        title,
        type: type || 'Meeting',
        date,
        time: time || '',
        description: description || '',
        linked_task_id: linked_task_id || null,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// TOGGLE / UPDATE planner event for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('planner_events')
      .update({ ...updates, updated_at: new Date().toISOString() })
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

// DELETE planner event for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('planner_events')
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

