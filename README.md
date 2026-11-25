# lp-factory

Repositório de landing pages geradas e publicadas automaticamente pelo workflow de bots do Orca.

## Estrutura

- `sites/<slug>/` — Landing page estática pronta para publicação no GitHub Pages (`https://williamdunbar1.github.io/lp-factory/sites/<slug>/`)
- `leads/` — Listas de estabelecimentos coletados, filtrados e briefings de design

## Pipeline de Bots

1. `maps-finder` — Busca estabelecimentos ativos no Google Maps por nicho e região
2. `lead-filter` — Filtra negócios sem site/landing page própria
3. `lp-designer` — Cria copy, estrutura e identidade visual
4. `lp-backend` — Configura captura de leads, webhooks e integrações compatíveis com site estático
5. `lp-frontend` — Implementa o frontend responsivo em `sites/<slug>/`
6. `lp-reviewer` — Revisa qualidade e publica no GitHub Pages
7. `whatsapper` — Prepara/envia a abordagem no WhatsApp Business
