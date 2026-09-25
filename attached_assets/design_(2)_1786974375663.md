# Design System — Vizinhança Real

**Versão:** 1.0 · **Data:** 10/08/2026 · fica na mesma pasta do `PRD.md`

## Posicionamento

O Vizinhança Real não deve parecer imobiliária nem plataforma de venda de imóvel. A sensação deve ser: "aqui alguém que já morou ali está te contando o que você gostaria de saber antes de assinar o contrato." Frase-guia: **"Descubra como é realmente morar ali antes de assinar."**

Filtro de decisão pra qualquer elemento visual novo: parece imobiliária → simplifique. Parece publicidade → remova. Parece excessivamente tecnológico → humanize. Parece pouco confiável → mostre evidência. Parece uma pessoa me ajudando a decidir → está certo.

## Tokens

| Token | Valor | Uso |
|---|---|---|
| Cor principal | azul petróleo `#1E4A4F` | marca, títulos, botão principal |
| Cor secundária | verde sálvia `#8FAE8A` | avaliações positivas, estados de confiança |
| Fundo | off-white/bege `#F7F2EA` | fundo predominante — sensação de casa, não de app frio |
| Superfície de card | branco `#FFFFFF`, borda `#E3DDCF` | qualquer card ou container |
| Texto principal | `#2B2B28` | títulos e corpo |
| Texto secundário | `#6B6862` | legendas, metadados, datas |
| Tipografia | Inter | única família; pesos diferentes criam hierarquia |
| Grid | 8px | espaçamento entre todos os elementos |
| Bordas | 12–16px de raio, sombra quase inexistente | cards modernos, leves, confiáveis — nunca "fofos" |
| Ícones | lineares, arredondados, minimalistas (Tabler outline) | não competem com o conteúdo |
| Imagens | fotos reais enviadas por usuários; nunca banco de imagem | autenticidade é parte da proposta |

## Tom de voz

Direto + humano + transparente + honesto — como alguém que já passou pela experiência ajudando outra pessoa a decidir. Evitar linguagem corporativa, jurídica, de marketing ou de imobiliária.

| Em vez de | Usar |
|---|---|
| "Índice de experiência residencial: 3,2/5." | "Como é morar aqui?" seguido de "Barulho: 3/5" + o relato da pessoa |

**Nota = visão geral. Relato = experiência real.** As duas aparecem sempre juntas, nunca só a nota.

## As 5 telas

### 1. Busca
Achar o imóvel sem precisar digitar o nome exato — história MUST do PRD.
- Wordmark + tagline no topo.
- Campo de busca com ícone de lupa em verde sálvia, borda 14px, placeholder "Buscar endereço ou condomínio".
- Lista de buscas recentes/sugeridas: ícone de prédio, nome, endereço, nota média, nº de avaliações.
- Sem resultado exato → mostrar os 3 condomínios com nome mais parecido.

### 2. Ficha do imóvel/condomínio
Peça central do produto — MUST do PRD.
- Header com nome, endereço e botão voltar.
- Grid 2×2 com nota geral das 4 categorias (apartamento, condomínio, proprietário, imobiliária) em azul petróleo.
- Seção "o que eu gostaria de saber antes de alugar", com nota + estrelas (verde sálvia se alta, tom terroso se baixa — nunca vermelho de alerta) ao lado da citação da pessoa entre aspas.

### 3. Formulário de nova avaliação
As 3 MUST do PRD reunidas — MUST.
- Lista das 4 categorias com seletor de estrelas 1–5.
- Comentário livre, até 500 caracteres, opcional por categoria.
- Bloco destacado (fundo verde sálvia claro, borda 1,5px) para "o que você gostaria de saber antes de alugar?" — obrigatório, mínimo 20 caracteres, placeholder com exemplo real.
- Botão "publicar avaliação" em azul petróleo sólido.

### 4. Login / cadastro
Suporte estrutural — sem ela ninguém consegue avaliar.
- Campo de e-mail, campo de senha, botão principal "Entrar".
- Link secundário "Criar conta".
- Texto curto explicando o motivo do cadastro ("crie sua conta pra avaliar um imóvel onde você já morou").

### 5. Filtro de avaliações
SHOULD do PRD — importante, mas o produto funciona sem.
- Bottom sheet com opção de mostrar só uma categoria por vez.
- Botões "aplicar filtro" e "limpar filtro".
- Lista de avaliações atualiza sem recarregar a página.

## Componentes reutilizáveis
- **Card de avaliação**: categoria + estrelas + citação — usado nas telas 2 e (em versão de input) 3.
- **Card de resultado de busca**: ícone + nome + endereço + nota — usado na tela 1.
- **Botão principal**: azul petróleo sólido, texto off-white, raio 12px.
- **Campo de texto**: borda `#E3DDCF`, raio 12px, fundo branco.
- **Bloco de destaque** (verde sálvia claro + borda 1,5px): reservado só pro campo "o que eu gostaria de saber", pra manter o peso visual que o PRD pede.

## Tópicos em aberto
Ícone e cor exatos para nota baixa (hoje usando tom terroso `#B98A5A` em vez de vermelho, pra não parecer alerta de erro) — validar se combina com a sensação "acolhedora" em telas reais antes de fechar.
