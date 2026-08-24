import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET all life areas for authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('life_areas')
      .select('*')
      .eq('user_id', req.user.id)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE life area for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, name, icon, color, sort_order } = req.body;
    const { data, error } = await supabase
      .from('life_areas')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        name,
        icon: icon || '📌',
        color: color || '#2563EB',
        sort_order: sort_order || 1,
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE life area for authenticated user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, color, sort_order } = req.body;
    const { data, error } = await supabase
      .from('life_areas')
      .update({ name, icon, color, sort_order })
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

// DELETE life area for authenticated user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('life_areas')
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

