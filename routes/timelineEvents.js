import { Router } from 'express';
import { supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET timeline events for authenticated user
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('timeline_events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE timeline event for authenticated user
router.post('/', async (req, res) => {
  try {
    const { id, type, timestamp, entity_type, entity_id, life_area_id, goal_id, title, metadata } = req.body;
    const { data, error } = await supabase
      .from('timeline_events')
      .insert([{
        id: id || undefined,
        user_id: req.user.id,
        type,
        timestamp: timestamp || new Date().toISOString(),
        entity_type: entity_type || 'General',
        entity_id: entity_id || null,
        life_area_id: life_area_id || null,
        goal_id: goal_id || null,
        title,
        metadata: metadata || {},
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

