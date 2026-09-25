/**
 * Vizinhança Real — Design Tokens
 * Brand identity: warm, human, trustworthy — like a neighbor helping you decide.
 * Filtro de decisão: parece imobiliária → simplifique. Parece uma pessoa ajudando → está certo.
 */
const colors = {
  light: {
    // Legacy aliases
    text: '#2B2B28',
    tint: '#1E4A4F',

    // Core surfaces
    background: '#F7F2EA',       // off-white/bege — sensação de casa
    foreground: '#2B2B28',       // texto principal

    // Cards
    card: '#FFFFFF',
    cardForeground: '#2B2B28',

    // Primary — azul petróleo (marca, títulos, botão principal)
    primary: '#1E4A4F',
    primaryForeground: '#F7F2EA',

    // Secondary — verde sálvia (avaliações positivas, confiança)
    secondary: '#8FAE8A',
    secondaryForeground: '#2B2B28',

    // Muted
    muted: '#EDE8DF',
    mutedForeground: '#6B6862',  // legendas, metadados

    // Accent — verde sálvia claro (bloco de destaque)
    accent: '#C8DCBE',
    accentForeground: '#1E4A4F',

    // Destructive
    destructive: '#D9534F',
    destructiveForeground: '#FFFFFF',

    // Provider brand color
    googleBlue: '#4285F4',

    // Borders and inputs
    border: '#E3DDCF',
    input: '#E3DDCF',

    // Nota baixa — tom terroso (nunca vermelho de alerta)
    lowScore: '#B98A5A',

    // Surface overlay (modal backdrop)
    overlay: 'rgba(43, 43, 40, 0.4)',
  },

  // 14px border radius — cards modernos, leves, confiáveis
  radius: 14,
};

export default colors;
