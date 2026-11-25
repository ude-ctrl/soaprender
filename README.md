# SOaprender

Plataforma de estudo para Professor de Geografia da SEDUC-MA, código 17, com questões inéditas no padrão FCC. O acervo inicial está em auditoria editorial.

## Desenvolvimento

Com Node.js 24:

```sh
npm ci
npm run dev
```

```sh
npm run typecheck
npm test
npm run build
```

O conteúdo vem de `seduc-ma-bundle.json`. Tentativas e preferências ficam no navegador. Os backups JSON podem ser exportados e importados em Ajustes.

## Publicação

Em **Settings → Pages → Build and deployment**, selecione **GitHub Actions** como fonte. O workflow verifica PRs, testa e publica o build em pushes para `main`.

https://ude-ctrl.github.io/soaprender/
