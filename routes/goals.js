import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET all goals for authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE goal for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, life_area_id, title, description, target_date } = req.body;
    const { data, error } = await supabase
      .from('goals')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        life_area_id: life_area_id || null,
        title,
        description: description || '',
        target_date: target_date || '',
        is_active: true,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE goal for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, target_date, is_active, life_area_id } = req.body;
    const { data, error } = await supabase
      .from('goals')
      .update({ title, description, target_date, is_active, life_area_id })
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

// DELETE goal for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('goals')
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

