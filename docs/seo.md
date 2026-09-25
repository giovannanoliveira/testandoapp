# SEO — Vizinhança Real

Página de referência: `/(auth)/login` — única rota pública (não exige login) do app, portanto a única indexável por crawlers hoje.

## Title

```
Vizinhança Real — Avaliações reais de aluguel antes de você assinar
```

## Meta description

```
Vizinhança Real reúne avaliações reais de apartamento, condomínio, proprietário e imobiliária feitas por quem já morou lá. Descubra como é morar ali antes de assinar o contrato de aluguel.
```

## H1

```
Descubra como é realmente morar ali antes de assinar
```

## Onde está aplicado no código

| Elemento | Arquivo | Como |
|---|---|---|
| Title | `artifacts/mobile/app.json` (`expo.web.name`) | Vira a tag `<title>` do build web via `expo export -p web` |
| Meta description | `artifacts/mobile/app.json` (`expo.web.description`) | Vira `<meta name="description">` no HTML gerado |
| H1 | `artifacts/mobile/app/(auth)/login.tsx` | Texto com `accessibilityRole="header"` + `aria-level={1}` → renderiza `role="heading" aria-level="1"` no DOM web (equivalente semântico a `<h1>` em apps React Native Web) |

O texto do H1 é a frase-guia de posicionamento já definida em `attached_assets/design_(2)_1786974375663.md` ("Descubra como é realmente morar ali antes de assinar."), então título, meta description e H1 contam a mesma história.

## Limitação importante para SEO real

Hoje só a tela de login/cadastro é pública. Busca, ficha de imóvel e avaliações (o conteúdo que de fato atrai busca orgânica — "avaliação condomínio X", "como é morar em Y") ficam atrás de login (`app/_layout.tsx`, `Stack.Protected guard={Boolean(user)}`). Google não se autentica, então essas páginas não são indexadas enquanto isso não mudar. Para uma estratégia de SEO orientada a conteúdo, seria necessário liberar leitura pública de ficha de imóvel/avaliações (mantendo só a publicação de avaliação atrás de login) — decisão de produto que não foi tomada aqui.

## Domínio

`sitemap.xml`, `robots.txt` e `llms.txt` usam `https://vizinhancareal.example.com` como placeholder — ainda não existe domínio de produção. Trocar pela URL final assim que o deploy estiver no ar.
