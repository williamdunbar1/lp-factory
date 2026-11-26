# LP Factory

Repositório de landing pages para negócios locais brasileiros, com um fluxo enxuto de descoberta, criação, publicação e contato.

## Fluxo de trabalho

1. `maps-finder` encontra estabelecimentos por nicho e região.
2. `lead-filter` confere os dados e seleciona oportunidades adequadas.
3. `lp-designer` prepara briefing, conteúdo e direção visual.
4. `lp-frontend` constrói a landing page em `sites/<slug>/` usando o briefing aprovado.
5. `lp-reviewer` revisa conteúdo, links, visualização em celular e publicação no GitHub Pages.
6. `whatsapper` prepara o contato pelo WhatsApp Business após a revisão.

`lp-backend` entra sob demanda quando o projeto precisar de captura de dados, webhooks ou outras integrações que não cabem em uma página estática.

## Leads e briefings

`leads/pipeline.json` é a fonte central dos leads. Cada item em `leads` acompanha o estabelecimento desde a descoberta até o encerramento. O bloco `_schema` documenta os campos e os estados válidos. Atualize `updated_at` ao alterar um lead e use `leads/briefings/` para briefings detalhados, nomeados pelo `slug` do lead.

Exemplo de estrutura:

```json
{
  "leads": [],
  "_schema": {
    "slug": "identificador-url",
    "status": ["found", "filtered", "designed", "built", "published", "contacted", "closed", "discarded"]
  }
}
```

Consulte o arquivo para a descrição completa de todos os campos.

## Template base

`templates/base/` contém `index.html`, `styles.css` e `script.js` como ponto de partida para novas páginas. Copie os três arquivos para `sites/<slug>/` e substitua os placeholders `{{...}}` por conteúdo conferido no briefing. Personalize as variáveis de cor e fonte no `:root` de `styles.css`; revise texto, serviços, avaliações, endereço, horário e links antes de publicar.

O template inclui hero com CTA para WhatsApp, diferenciais, cards de serviços, prova social, localização e horário, CTA final e botão flutuante de WhatsApp. Use `{{WHATSAPP_NUMBER}}` apenas com dígitos e código do país para formar links `wa.me` válidos.

## Publicação

As páginas publicadas ficam em `sites/<slug>/` e são servidas pelo GitHub Pages em `https://williamdunbar1.github.io/lp-factory/sites/<slug>/`.

## Biblioteca de presets

O cat?logo `templates/presets/catalog.json` descreve os presets reutiliz?veis: `craft-lounge`, `editorial-light` e `classic-club`. Cada preset inclui `index.html`, `styles.css`, `script.js` e uma imagem SVG de refer?ncia. A estrutura, o CSS e o comportamento visual foram extra?dos das p?ginas aprovadas do Lote 1.

### Criar um site a partir de um preset

1. Escolha um preset no cat?logo e copie sua pasta para `sites/<slug>/`.
2. Preencha os tokens `{{CAMPO}}` listados em `placeholders` no cat?logo, incluindo contato, endere?o, servi?os, pre?os e links.
3. Troque a refer?ncia `assets/hero.jpg` em `styles.css` pela foto do neg?cio; `assets/hero-placeholder.svg` serve como guia.
4. Revise conte?do, links e visual para celular antes de publicar. O CSS j? vem pronto, ent?o comece personalizando os dados.
