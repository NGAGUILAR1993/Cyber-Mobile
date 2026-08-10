/**
 * CYBER MOBILE - Analytics Tracking Pixel
 * URL configurada: https://cyber-mobile-panel-production.up.railway.app/
 */

(function() {
    // Configuración
    const API_ENDPOINT = 'https://cyber-mobile-panel-production.up.railway.app/api/track';
    const SESSION_ID = generateSessionId();
    const PAGE_LOAD_TIME = Date.now();

    // IDs de elementos clave a trackear
    const TRACKED_ELEMENTS = {
        'cta-whatsapp': 'CTA WhatsApp',
        'cta-planes': 'CTA Planes',
        'cta-simular': 'CTA Simulador',
        'btn-base': 'Plan Base',
        'btn-premium': 'Plan Premium',
        'btn-cyber': 'Plan Cyber',
        'tab-herramientas': 'Tab Herramientas',
        'tab-comunidad': 'Tab Comunidad',
        'tab-simulador': 'Tab Simulador'
    };

    // ==================== UTILIDADES ====================
    function generateSessionId() {
        const stored = localStorage.getItem('cm_session_id');
        if (stored) return stored;
        const id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cm_session_id', id);
        return id;
    }

    function getFingerprint() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screenResolution: window.innerWidth + 'x' + window.innerHeight,
            platform: navigator.platform
        };
    }

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
            return /iphone|ipad|ipod/i.test(ua) ? 'iOS' : 'Android';
        }
        return 'Desktop';
    }

    function getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        if (ua.indexOf('Edge') > -1) return 'Edge';
        if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
        return 'Unknown';
    }

    // Geolocalización (usando IP libre)
    async function getLocation() {
        try {
            const response = await fetch('https://ipapi.co/json/', { 
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                return {
                    country: data.country_name || 'Unknown',
                    city: data.city || 'Unknown',
                    ip: data.ip || 'Unknown',
                    latitude: data.latitude,
                    longitude: data.longitude
                };
            }
        } catch (e) {
            console.warn('Geo lookup failed:', e);
        }
        return { country: 'Unknown', city: 'Unknown', ip: 'Unknown' };
    }

    // ==================== TRACKING ====================
    function sendEvent(eventType, eventData = {}) {
        const payload = {
            sessionId: SESSION_ID,
            timestamp: Date.now(),
            eventType: eventType,
            page: {
                url: window.location.href,
                pathname: window.location.pathname,
                title: document.title,
                referrer: document.referrer
            },
            device: {
                type: getDeviceType(),
                browser: getBrowserName(),
                resolution: window.innerWidth + 'x' + window.innerHeight
            },
            fingerprint: getFingerprint(),
            ...eventData
        };

        // Envía beacon (no bloquea)
        if (navigator.sendBeacon) {
            navigator.sendBeacon(API_ENDPOINT, JSON.stringify(payload));
        } else {
            fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true
            }).catch(e => console.warn('Track failed:', e));
        }
    }

    // ==================== PAGE VIEW ====================
    function trackPageView() {
        sendEvent('page_view', {
            scrollDepth: 0
        });
    }

    // ==================== SCROLL TRACKING ====================
    let maxScrollDepth = 0;
    function trackScroll() {
        const scrollPercentage = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercentage > maxScrollDepth) {
            maxScrollDepth = scrollPercentage;
            
            // Trackea hitos importantes
            if (scrollPercentage === 25 || scrollPercentage === 50 || scrollPercentage === 75 || scrollPercentage === 100) {
                sendEvent('scroll_milestone', { scrollDepth: scrollPercentage });
            }
        }
    }

    // ==================== CLICK TRACKING ====================
    function trackClicks() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-track], button, a[href*="#"], .btn, [class*="cta"]');
            
            if (!target) return;

            const trackId = target.getAttribute('data-track') || target.id || target.className;
            const label = TRACKED_ELEMENTS[trackId] || target.innerText || trackId;
            const elementType = target.tagName.toLowerCase();

            sendEvent('click', {
                elementType: elementType,
                elementId: target.id || null,
                elementClass: target.className || null,
                label: label.substring(0, 100),
                scrollPosition: window.scrollY
            });
        });
    }

    // ==================== TAB VISIBILITY ====================
    function trackTabVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                sendEvent('tab_hidden', {
                    sessionDuration: Date.now() - PAGE_LOAD_TIME
                });
            } else {
                sendEvent('tab_visible');
            }
        });
    }

    // ==================== ANTES DE DESCARGAR ====================
    function trackUnload() {
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - PAGE_LOAD_TIME;
            const scrollDepth = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            sendEvent('session_end', {
                sessionDuration: sessionDuration,
                finalScrollDepth: Math.min(scrollDepth, 100)
            });
        });
    }

    // ==================== INICIALIZACIÓN ====================
    async function init() {
        // Obtén geolocalización
        const location = await getLocation();

        // Trackea page view con geolocalización
        sendEvent('page_view', {
            location: location,
            scrollDepth: 0
        });

        // Listeners
        window.addEventListener('scroll', trackScroll, { passive: true });
        trackClicks();
        trackTabVisibility();
        trackUnload();

        // Envía heartbeat cada 30 segundos si el usuario sigue activo
        setInterval(() => {
            if (!document.hidden) {
                sendEvent('heartbeat', {
                    sessionDuration: Date.now() - PAGE_LOAD_TIME,
                    scrollDepth: maxScrollDepth
                });
            }
        }, 30000);
    }

    // Espera a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expone función global para trackear eventos manuales
    window.cmTrack = function(eventType, data) {
        sendEvent(eventType, data);
    };
})();
