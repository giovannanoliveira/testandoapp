# Próximas 5 features com score (RICE)

Metodologia: **RICE** — `Score = (Reach × Impact × Confidence) / Effort`.

- **Reach**: usuários impactados por mês (estimativa a partir do PRD, sem dado real de produção ainda).
- **Impact**: 3 = massivo, 2 = alto, 1 = médio, 0.5 = baixo, 0.25 = mínimo.
- **Confidence**: 100% / 80% / 50% — quão seguros estamos da estimativa.
- **Effort**: pessoa-semana estimada de trabalho.

Itens já implementados no código (filtro de avaliações por categoria, assistente de IA, comparador de imóveis, planos) foram excluídos por já estarem prontos.

| # | Feature | Reach | Impact | Confidence | Effort | Score | Por quê |
|---|---|---|---|---|---|---|---|
| 1 | Aviso de avaliação desatualizada (+18 meses) | 800 | 1 | 80% | 1 | **640** | PRD Milestone 2 (SHOULD). Toda ficha de imóvel se beneficia; simples de calcular a partir da data já salva na avaliação. |
| 2 | Selo "morador verificado" (comprovante opcional, sem exigir para publicar) | 500 | 2 | 50% | 3 | **166,7** | Ataca o "tópico em aberto" do PRD (avaliação falsa de concorrente) sem esbarrar em privacidade — mas incerto quanto à adesão real, por isso confidence baixa. |
| 3 | Notificação quando um imóvel favoritado recebe nova avaliação | 300 | 1 | 60% | 1,5 | **120** | Reaproveita `FavoritesContext`, já existente. Aumenta retorno ao app, mas depende de infra de push ainda não validada. |
| 4 | Denúncia de avaliação suspeita (3 denúncias → revisão manual em 48h) | 150 | 2 | 70% | 2 | **105** | PRD Milestone 2 (COULD). Protege a confiança da plataforma, mas afeta só quem encontra conteúdo suspeito — reach menor. |
| 5 | Exportar/compartilhar comparação de imóveis (link ou PDF) | 120 | 0,5 | 70% | 1 | **42** | Estende a tela `comparar.tsx` já existente; útil para decidir em casal/família, mas nicho. |

Ordenado por score decrescente — é também a ordem de prioridade sugerida.
