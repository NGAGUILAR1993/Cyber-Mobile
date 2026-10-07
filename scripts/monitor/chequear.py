"""Monitoreo de Cyber Mobile: revisa el sitio, el agente web, n8n y WhatsApp.

Lo corre .github/workflows/monitor.yml cada 30 minutos. Solo avisa cuando algo
cambia de estado (se cae o se recupera), para no llenar la casilla de correos:
el estado se guarda en un issue con la etiqueta "monitor" (abierto = hay caída).

Variables de entorno:
  GITHUB_TOKEN, GITHUB_REPOSITORY   para abrir y cerrar el issue de estado.
  SMTP_USER, SMTP_PASS              Gmail y contraseña de aplicación para mandar el aviso.
  AVISO_A                           destinatario (por defecto cybermobile.ai@gmail.com).
  EVOLUTION_APIKEY                  opcional: revisa que el WhatsApp del agente esté conectado.
"""
import json
import os
import smtplib
import time
import urllib.error
import urllib.request
from email.mime.text import MIMEText

SITIO = 'https://www.cybermobile.com.ar'
N8N = 'https://primary-production-3c8ba.up.railway.app'
EVOLUTION = 'https://evolution-api-production-bf51.up.railway.app'
INSTANCIA = 'Agente%20Ciber'
ETIQUETA = 'monitor'
INTENTOS = 3
ESPERA = 20  # segundos entre intentos, para no avisar por un corte de segundos


def pedir(url, cabeceras=None, tiempo=25):
    req = urllib.request.Request(url, headers={'User-Agent': 'CyberMobile-Monitor/1.0', **(cabeceras or {})})
    try:
        with urllib.request.urlopen(req, timeout=tiempo) as r:
            return r.status, r.read(200_000).decode('utf-8', 'replace')
    except urllib.error.HTTPError as e:
        return e.code, e.read(2000).decode('utf-8', 'replace')
    except Exception as e:  # sin respuesta: DNS, timeout, TLS
        return 0, str(e)


def chequeos():
    lista = [
        ('Sitio (home)', lambda: pedir(SITIO + '/'), lambda c, t: c == 200 and 'Cyber Mobile' in t),
        ('Vera web (/agente)', lambda: pedir(SITIO + '/agente'), lambda c, t: c == 200 and 'Vera' in t),
        ('API del agente web', lambda: pedir(SITIO + '/api/agente/estado'),
         lambda c, t: c == 200 and '"configurado":true' in t.replace(' ', '')),
        ('Observatorio', lambda: pedir(SITIO + '/observatorio'), lambda c, t: c == 200),
        ('Sitemap', lambda: pedir(SITIO + '/sitemap.xml'), lambda c, t: c == 200 and '<urlset' in t),
        ('n8n (flujos del agente)', lambda: pedir(N8N + '/healthz'), lambda c, t: c == 200 and 'ok' in t),
        ('Evolution API (WhatsApp)', lambda: pedir(EVOLUTION + '/'), lambda c, t: 200 <= c < 500 and c != 0),
    ]
    clave = os.environ.get('EVOLUTION_APIKEY', '').strip()
    if clave:
        lista.append(('WhatsApp del agente conectado',
                      lambda: pedir(f'{EVOLUTION}/instance/connectionState/{INSTANCIA}', {'apikey': clave}),
                      lambda c, t: c == 200 and '"open"' in t))
    return lista


def correr():
    fallas = []
    for nombre, hacer, ok in chequeos():
        detalle = ''
        for intento in range(INTENTOS):
            codigo, texto = hacer()
            if ok(codigo, texto):
                detalle = ''
                break
            detalle = f'respuesta {codigo}' if codigo else f'sin respuesta ({texto[:120]})'
            if intento < INTENTOS - 1:
                time.sleep(ESPERA)
        print(('FALLA ' if detalle else 'OK    ') + nombre + (f': {detalle}' if detalle else ''))
        if detalle:
            fallas.append((nombre, detalle))
    return fallas


def github(metodo, ruta, cuerpo=None):
    token, repo = os.environ.get('GITHUB_TOKEN'), os.environ.get('GITHUB_REPOSITORY')
    if not token or not repo:
        return None
    req = urllib.request.Request(f'https://api.github.com/repos/{repo}{ruta}', method=metodo,
                                 data=json.dumps(cuerpo).encode() if cuerpo is not None else None,
                                 headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json',
                                          'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read() or b'null')


def correo(asunto, cuerpo):
    usuario, clave = os.environ.get('SMTP_USER', '').strip(), os.environ.get('SMTP_PASS', '').replace(' ', '')
    destino = os.environ.get('AVISO_A', '').strip() or 'cybermobile.ai@gmail.com'
    if not usuario or not clave:
        print('Sin SMTP_USER/SMTP_PASS: el aviso queda solo en el issue de GitHub.')
        return
    msg = MIMEText(cuerpo, 'plain', 'utf-8')
    msg['Subject'], msg['From'], msg['To'] = asunto, f'Monitor Cyber Mobile <{usuario}>', destino
    with smtplib.SMTP_SSL('smtp.gmail.com', 465, timeout=30) as s:
        s.login(usuario, clave)
        s.send_message(msg)
    print('Aviso enviado a', destino)


def main():
    fallas = correr()
    abiertos = github('GET', f'/issues?state=open&labels={ETIQUETA}&per_page=1') or []
    abierto = abiertos[0] if abiertos else None
    ahora = time.strftime('%d/%m %H:%M', time.gmtime(time.time() - 3 * 3600))

    if fallas and not abierto:
        try:
            github('POST', '/labels', {'name': ETIQUETA, 'color': 'D93F0B', 'description': 'Caída detectada por el monitor'})
        except urllib.error.HTTPError:
            pass  # ya existe
        lista = '\n'.join(f'• {n}: {d}' for n, d in fallas)
        cuerpo = (f'Detectamos una caída a las {ahora} (hora de Argentina):\n\n{lista}\n\n'
                  'Revisá Railway (n8n y Evolution) o Vercel según lo que falle. '
                  'Te aviso de nuevo cuando todo vuelva a funcionar.\n\n— Monitor de Cyber Mobile')
        github('POST', '/issues', {'title': f'🔴 Caída: {", ".join(n for n, _ in fallas)}', 'body': cuerpo, 'labels': [ETIQUETA]})
        correo(f'🔴 Cyber Mobile: falla {fallas[0][0]}' + (f' y {len(fallas) - 1} más' if len(fallas) > 1 else ''), cuerpo)
    elif not fallas and abierto:
        cuerpo = f'Todo volvió a funcionar a las {ahora} (hora de Argentina).\n\n— Monitor de Cyber Mobile'
        github('POST', f'/issues/{abierto["number"]}/comments', {'body': cuerpo})
        github('PATCH', f'/issues/{abierto["number"]}', {'state': 'closed'})
        correo('✅ Cyber Mobile: todo funciona de nuevo', cuerpo)
    elif fallas:
        print('La caída ya estaba avisada; no se repite el correo.')


if __name__ == '__main__':
    main()
