import { supabase } from '../config/supabase.js';

/**
 * Authentication middleware for Personal OS API
 * Validates Supabase JWT from 'Authorization: Bearer <token>' header.
 * Attaches authenticated user object to req.user.
 * Supports fallback dev user ID in non-production mode for local development.
 */
export const requireAuth = async (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      error: 'Database service is not configured. Please check SUPABASE_URL and SUPABASE_ANON_KEY.',
    });
  }

  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'] || process.env.DEFAULT_USER_ID;

  // 1. Check Bearer token with Supabase Auth
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired authentication token.',
        });
      }
      req.user = user;
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: `Authentication verification failed: ${err.message}`,
      });
    }
  }

  // 2. Custom header fallback for explicit tenant / local testing
  if (devUserId) {
    req.user = { id: devUserId };
    return next();
  }

  // 3. Strict mode check in production
  if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid Authorization Bearer token.',
    });
  }

  // 4. Default local development tenant ID
  req.user = { id: '00000000-0000-0000-0000-000000000000' };
  next();
};
