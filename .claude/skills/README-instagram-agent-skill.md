# Skills ig-* (Instagram)

Copiadas de https://github.com/Jakeschincariol/instagram-agent-skill, commit `d03c56b` (13/09/2026), licencia MIT (`LICENSE-instagram-agent-skill`).

Revisión de seguridad (14/10/2026):
- Los scripts de Python usan solo la biblioteca estándar: leen texto de un archivo o de la entrada y escriben el resultado. No hacen conexiones de red ni ejecutan comandos.
- No hay hooks, permisos especiales ni pedidos de claves.
- `ig-viral` prohíbe explícitamente pedir la contraseña de Instagram o hacer scraping.

Uso en Cyber Mobile:
- Las reglas de `CLAUDE.md` y `scripts/redes/GUIA.md` tienen prioridad: videos de 23 s, CTA "Comentá VERA", tapar datos personales y español rioplatense.
- Donde una skill pide `~/.claude/instagram/voice.md`, la voz de marca es la de `CLAUDE.md` (sección "Reglas del dueño").

Para actualizar: volver a revisar el repositorio original antes de copiar una versión nueva.
