import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET all task templates for authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('task_templates')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE task template for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, goal_id, title, estimated_minutes, priority, recurrence, sort_order, is_active } = req.body;
    const { data, error } = await supabase
      .from('task_templates')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        goal_id: goal_id || null,
        title,
        estimated_minutes: estimated_minutes || 30,
        priority: priority || 'Medium',
        recurrence: recurrence || 'Daily',
        sort_order: sort_order || 1,
        is_active: is_active ?? true,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE task template for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('task_templates')
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

// DELETE task template for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('task_templates')
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

