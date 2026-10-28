# Staging de Cyber Mobile para análisis de seguridad

Una copia de la web **igual a la de producción, pero en tu computadora**, para correrle
herramientas de seguridad (OWASP ZAP, Nuclei, Nikto o Shannon) **sin tocar el sitio real,
sin gastar y sin mandar nada por WhatsApp ni Mercado Pago**.

Todo corre aislado:
- **web** (http://localhost:8080): la web real, con las mismas páginas, funciones y encabezados de seguridad.
- **redis**: un Redis propio y vacío, solo para la prueba.
- **vera** (n8n falso): responde como el flujo de Vera, pero no consulta WhatsApp, Gemini ni Mercado Pago.
- Las claves son de **mentira** (ver `docker-compose.yml`): no sirven para nada real.

> ⚠️ **Regla de oro:** estas herramientas atacan de verdad. Corrélas **solo** contra este staging
> (localhost), **nunca** contra www.cybermobile.com.ar ni contra n8n/Evolution en Railway.

---

## 1. Instalar Docker

Sirve igual en **Linux Mint** y en **Kali** (para practicar, Kali te deja todo a mano).

**Mint / Ubuntu:**
```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER      # para no usar sudo; cerrá y volvé a entrar la sesión
```

**Kali:**
```bash
sudo apt update && sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER      # cerrá y volvé a entrar la sesión
```

Probá que anda: `docker run --rm hello-world`

---

## 2. Levantar el staging

Desde la carpeta del repo (`Cyber-Mobile`):
```bash
docker compose -f scripts/staging/docker-compose.yml up --build
```
Cuando veas `Staging de Cyber Mobile en http://localhost:8080`, abrí esa dirección en el navegador:
tiene que verse la web igual que la real.

Para apagarlo todo (y borrar el Redis de prueba):
```bash
docker compose -f scripts/staging/docker-compose.yml down -v
```

> Sin Docker también anda, pero hay que tener un Redis local:
> `REDIS_URL=redis://localhost:6379 N8N_WEB_URL=http://localhost:5699/x node scripts/staging/servidor.mjs`
> (y en otra terminal `node scripts/staging/n8n-falso.mjs`).

---

## 3. Correr el análisis (gratis, sin IA)

Con el staging corriendo en `http://localhost:8080`. Estas tres son el estándar de la industria
y son las que más te van a servir para arrancar en ciber. Todas son gratis.

### OWASP ZAP (lo primero que miraría)
```bash
docker run --rm -v "$(pwd)/scripts/staging/informes:/zap/wrk:rw" \
  --network host zaproxy/zap-stable zap-baseline.py \
  -t http://localhost:8080 -r zap.html
```
Deja el informe en `scripts/staging/informes/zap.html`. El "baseline" es pasivo: mira sin atacar.
Para un análisis activo (prueba inyecciones), cambiá `zap-baseline.py` por `zap-full-scan.py`.

### Nuclei (miles de plantillas de vulnerabilidades conocidas)
```bash
docker run --rm projectdiscovery/nuclei -u http://localhost:8080 -o - \
  > scripts/staging/informes/nuclei.txt
```

### Nikto (configuración del servidor)
```bash
docker run --rm sullo/nikto -h http://localhost:8080 \
  > scripts/staging/informes/nikto.txt
```

> **Burp Suite Community** (viene en Kali) sirve para mirar y modificar a mano lo que la web le
> manda a la API (`/api/agente/consulta`, `/api/agente/estado`). Ahí se aprende de verdad.

---

## 4. Sobre Shannon y una IA gratis (lo honesto)

Shannon necesita Docker (ya lo tenés) y una **clave de IA que pagás vos**. Una corrida completa
tarda 1 a 1,5 h y puede costar **de decenas a cientos de dólares**.

Niveles gratis (Gemini, OpenRouter): tienen límite de pedidos por minuto/día y una corrida hace
cientos o miles de pedidos, así que **lo más probable es que se corte a la mitad**. Se puede
**probar** como experimento, no esperes un informe completo. Un modelo local con Ollama es gratis
pero necesita una placa de video potente y los modelos chicos fallan en algo tan complejo.

**Mi recomendación:** arrancá con ZAP + Nuclei + Nikto (gratis, estándar de la industria). Cuando
tengas acceso a una clave de IA (por vos o por el trabajo), sumamos Shannon apuntándolo a
`http://localhost:8080`.

---

## 5. Pasame el informe

Guardá los informes de `scripts/staging/informes/` y pasámelos. Revisamos **juntos** cada hallazgo:
te explico qué tipo de vulnerabilidad es y cómo se arregla, y corrijo lo que sea real en la web.
Es buena práctica para empezar en ciber: muchos hallazgos van a ser "informativos" o falsos
positivos, y aprender a distinguirlos es medio trabajo.
