import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ytbmkxgzdeezomvjbbxx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xVTlVVoka2Ju-GmWsxi9yg_oL6TXJRu';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    }
  }
});

/**
 * Obtiene la configuración y alertas oficiales de la radio desde Supabase
 */
export async function getRemoteRadioConfig() {
  try {
    const { data, error } = await supabase
      .from('radio_config')
      .select('config, updated_at')
      .eq('id', 'main')
      .maybeSingle();

    if (error) {
      // 404 o tabla no creada aún
      console.warn('[Supabase] Aviso al leer radio_config:', error.message);
      return null;
    }

    if (data && data.config) {
      return {
        ...data.config,
        updatedAt: data.updated_at || data.config.updatedAt
      };
    }
    return null;
  } catch (err) {
    console.warn('[Supabase] Error en conexión remota:', err.message);
    return null;
  }
}

/**
 * Guarda o publica la configuración y alertas en Supabase
 */
export async function saveRemoteRadioConfig(configPayload) {
  try {
    const payload = {
      id: 'main',
      config: configPayload,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('radio_config')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error al publicar en radio_config:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Excepción al guardar en la nube:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Suscripción en Tiempo Real (WebSockets):
 * Cuando la emisora emite una cadena de emergencia, todos los teléfonos
 * y navegadores reciben el cambio al milisegundo sin recargar.
 */
export function subscribeToRadioChanges(onUpdate) {
  try {
    const channel = supabase
      .channel('radio-realtime-alerts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'radio_config' },
        (payload) => {
          if (payload && payload.new && payload.new.config) {
            onUpdate({
              ...payload.new.config,
              updatedAt: payload.new.updated_at || payload.new.config.updatedAt
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('[Supabase] No se pudo iniciar el canal de tiempo real:', err.message);
    return () => {};
  }
}
