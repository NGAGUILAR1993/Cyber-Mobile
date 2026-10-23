// Menú del clic derecho: verificar un link, el texto seleccionado, la página o lo que se ve en pantalla.
// El pedido se guarda en la sesión de la extensión y se abre la ventanita de Vera para mostrar el resultado.
import { detectar } from './api.js';

const MENUS = [
    { id: 'link', title: 'Verificar este link con Vera', contexts: ['link'] },
    { id: 'texto', title: 'Preguntarle a Vera: "%s"', contexts: ['selection'] },
    { id: 'pagina', title: 'Verificar esta página con Vera', contexts: ['page'] },
    { id: 'pantalla', title: 'Analizar lo que veo en pantalla con Vera', contexts: ['page'] }
];

chrome.runtime.onInstalled.addListener((info) => {
    chrome.contextMenus.removeAll(() => MENUS.forEach((m) => chrome.contextMenus.create(m)));
    if (info.reason === 'install') chrome.tabs.create({ url: chrome.runtime.getURL('panel.html?bienvenida=1') });
});

async function abrirVentana(pendiente) {
    await chrome.storage.session.set({ pendiente: { ...pendiente, t: Date.now() } });
    await chrome.windows.create({ url: chrome.runtime.getURL('panel.html?ventana=1'), type: 'popup', width: 420, height: 680 });
}

const dataUrlABase64 = (d) => ({ mime: d.slice(5, d.indexOf(';')), datos: d.slice(d.indexOf(',') + 1) });

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === 'link' && info.linkUrl) return abrirVentana({ tipo: 'link', valor: info.linkUrl });
        if (info.menuItemId === 'texto' && info.selectionText) return abrirVentana(detectar(info.selectionText));
        if (info.menuItemId === 'pagina' && tab && /^https?:/.test(tab.url || '')) return abrirVentana({ tipo: 'link', valor: tab.url });
        if (info.menuItemId === 'pantalla' && tab) {
            const d = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 70 });
            const { mime, datos } = dataUrlABase64(d);
            return abrirVentana({ tipo: 'archivo', archivo: { nombre: 'captura.jpg', mime, datos } });
        }
    } catch {
        return abrirVentana({ error: 'No pude tomar eso para analizarlo. Probá de nuevo.' });
    }
});
