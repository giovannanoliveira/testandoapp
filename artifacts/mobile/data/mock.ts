export type Categoria = 'apartamento' | 'condominio' | 'proprietario' | 'imobiliaria';

export const CATEGORIAS: { key: Categoria; label: string }[] = [
  { key: 'apartamento', label: 'Apartamento' },
  { key: 'condominio', label: 'Condomínio' },
  { key: 'proprietario', label: 'Proprietário' },
  { key: 'imobiliaria', label: 'Imobiliária' },
];

export interface NotaCategoria {
  nota: number; // 1–5
  comentario?: string;
}

export interface Avaliacao {
  id: string | number;
  imovelId: string | number;
  userId: string | number;
  userName: string;
  data: string; // ISO date string
  notas: Partial<Record<Categoria, NotaCategoria>>;
  oQueGostariaDeSaber: string;
}

export interface Imovel {
  id: string | number;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  avaliacoes: Avaliacao[];
}

export const IMOVEIS: Imovel[] = [
  {
    id: '1',
    nome: 'Edifício Solar das Palmeiras',
    endereco: 'Rua Aspicuelta, 234',
    bairro: 'Vila Madalena',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av1',
        imovelId: '1',
        userId: 'u1',
        userName: 'Mariana F.',
        data: '2025-06-15T00:00:00Z',
        notas: {
          apartamento: { nota: 4, comentario: 'Bem iluminado, bons armários embutidos. Janela do banheiro não veda bem, entra vento no inverno.' },
          condominio: { nota: 2, comentario: 'Elevador quebrou 3 vezes em 8 meses. Portaria sem câmeras no corredor.' },
          proprietario: { nota: 5, comentario: 'Muito atencioso, sempre respondeu rápido. O melhor proprietário que tive.' },
          imobiliaria: { nota: 3, comentario: 'Demora na devolução do IPTU proporcional e nas assinaturas.' },
        },
        oQueGostariaDeSaber: 'O elevador quebra com frequência e a manutenção demora semanas. Se você precisa do elevador por mobilidade ou tem filhos pequenos, verifique o histórico de manutenção antes de fechar.',
      },
      {
        id: 'av2',
        imovelId: '1',
        userId: 'u2',
        userName: 'Rafael T.',
        data: '2025-03-20T00:00:00Z',
        notas: {
          apartamento: { nota: 3, comentario: 'Pressão da água no 10º andar é fraca nas manhãs de dia útil.' },
          condominio: { nota: 3 },
          proprietario: { nota: 4, comentario: 'Razoável, mas demorou 2 semanas para trocar um cano.' },
        },
        oQueGostariaDeSaber: 'A pressão d\'água nos andares altos é fraca entre 7h e 9h — você espera pra tomar banho antes de trabalhar. Pergunte em qual andar fica o apartamento antes de fechar.',
      },
    ],
  },
  {
    id: '2',
    nome: 'Condomínio Jardins da Serra',
    endereco: 'Al. Franca, 852',
    bairro: 'Jardins',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av3',
        imovelId: '2',
        userId: 'u3',
        userName: 'Carla M.',
        data: '2025-09-01T00:00:00Z',
        notas: {
          apartamento: { nota: 5, comentario: 'Espaço excelente, acabamento premium, nenhum problema estrutural em 2 anos.' },
          condominio: { nota: 5, comentario: 'Área de lazer sempre limpa, portaria 24h com câmeras em todos os andares.' },
          proprietario: { nota: 4, comentario: 'Profissional e direto. Resolveu tudo por e-mail.' },
          imobiliaria: { nota: 2, comentario: 'Burocracia desnecessária e lentidão na vistoria de saída.' },
        },
        oQueGostariaDeSaber: 'A imobiliária demora mais de 30 dias para concluir a vistoria de saída, o que pode atrasar a devolução da caução. Fotografe tudo ao entrar e ao sair e envie por e-mail com aviso de recebimento.',
      },
    ],
  },
  {
    id: '3',
    nome: 'Residencial Pinheiros Park',
    endereco: 'Rua dos Pinheiros, 407',
    bairro: 'Pinheiros',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av4',
        imovelId: '3',
        userId: 'u4',
        userName: 'André S.',
        data: '2025-01-10T00:00:00Z',
        notas: {
          apartamento: { nota: 2, comentario: 'Infiltração na parede do quarto. Janelas com vedação ruim, entra vento frio.' },
          condominio: { nota: 4, comentario: 'Academia e coworking muito bons. Síndico presente.' },
          proprietario: { nota: 1, comentario: 'Sumiu depois de assinar. Levou 4 meses para resolver a infiltração.' },
        },
        oQueGostariaDeSaber: 'A infiltração no quarto existe faz anos e o proprietário tem histórico de ignorar chamados. Olhe os tijolos e o reboco da parede esquerda antes de fechar — se tiver mancha de umidade, não alugar.',
      },
      {
        id: 'av5',
        imovelId: '3',
        userId: 'u5',
        userName: 'Paula C.',
        data: '2024-10-05T00:00:00Z',
        notas: {
          apartamento: { nota: 3 },
          condominio: { nota: 4, comentario: 'Síndico presente e responsivo. Churrasqueira bem conservada.' },
          imobiliaria: { nota: 4, comentario: 'Processo tranquilo, caução devolvida em 15 dias.' },
        },
        oQueGostariaDeSaber: 'O barulho da Rua dos Pinheiros entra bastante no apartamento. Se você trabalha de madrugada ou dorme cedo, o trânsito dos fins de semana vai te incomodar até depois da 1h.',
      },
    ],
  },
  {
    id: '4',
    nome: 'Edifício Moema Living',
    endereco: 'Av. Ibirapuera, 2100',
    bairro: 'Moema',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av6',
        imovelId: '4',
        userId: 'u6',
        userName: 'Fernanda O.',
        data: '2025-07-22T00:00:00Z',
        notas: {
          apartamento: { nota: 5, comentario: 'Vista incrível do Ibirapuera, bem conservado, sem nenhum problema.' },
          condominio: { nota: 5, comentario: 'Portaria moderna, câmeras por todo o prédio, academia renovada em 2024.' },
          proprietario: { nota: 5, comentario: 'Melhor proprietário que já tive. Respondeu sempre no dia.' },
          imobiliaria: { nota: 4 },
        },
        oQueGostariaDeSaber: 'Nada de ruim a declarar — foi minha melhor experiência de aluguel. Só uma ressalva: o estacionamento tem uma coluna que reduz espaço na vaga. Se seu carro for grande, veja se cabe antes de assinar.',
      },
    ],
  },
  {
    id: '5',
    nome: 'Residencial Consolação',
    endereco: 'Rua da Consolação, 1830',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av7',
        imovelId: '5',
        userId: 'u7',
        userName: 'Bruno L.',
        data: '2025-05-14T00:00:00Z',
        notas: {
          apartamento: { nota: 2, comentario: 'Mofo no banheiro, tomadas insuficientes, interruptor com defeito desde o primeiro mês.' },
          condominio: { nota: 3 },
          proprietario: { nota: 2, comentario: 'Não resolveu o mofo em 6 meses, só mandou tinta por cima.' },
          imobiliaria: { nota: 2, comentario: 'Propuseram renovação automática sem avisar o vencimento — leia todas as cláusulas.' },
        },
        oQueGostariaDeSaber: 'Tem mofo no banheiro que o proprietário trata como problema estético, mas é infiltração estrutural da viga. Peça um laudo de umidade antes de fechar e documente tudo em fotos com data.',
      },
    ],
  },
  {
    id: '6',
    nome: 'Condomínio Brooklin Alto',
    endereco: 'Rua Samuel Morse, 120',
    bairro: 'Brooklin',
    cidade: 'São Paulo',
    avaliacoes: [
      {
        id: 'av8',
        imovelId: '6',
        userId: 'u8',
        userName: 'Letícia B.',
        data: '2025-08-03T00:00:00Z',
        notas: {
          apartamento: { nota: 4, comentario: 'Bom tamanho e bem distribuído. Cozinha americana funcional.' },
          condominio: { nota: 4, comentario: 'Academia e piscina bem mantidas, síndico presente.' },
          proprietario: { nota: 3, comentario: 'Ok, mas demorou 3 semanas para resolver vazamento no teto.' },
          imobiliaria: { nota: 5, comentario: 'Ótima experiência, toda documentação digital e assinada em 2 dias.' },
        },
        oQueGostariaDeSaber: 'A internet do condomínio (IPTV incluída no condomínio) tem queda frequente nos fins de semana. Vale contratar fibra própria mesmo que custe mais — trabalho remoto depende disso.',
      },
      {
        id: 'av9',
        imovelId: '6',
        userId: 'u9',
        userName: 'Gabriel R.',
        data: '2025-04-18T00:00:00Z',
        notas: {
          apartamento: { nota: 5, comentario: 'Perfeito para home office. Silencioso durante a semana.' },
          condominio: { nota: 3, comentario: 'Barulho das crianças na piscina nos fins de semana é alto.' },
        },
        oQueGostariaDeSaber: 'Nos fins de semana o barulho na área de lazer é alto até às 22h por causa de eventos de família. Se você precisa de silêncio o tempo todo, talvez não seja o lugar certo.',
      },
    ],
  },
];

// --- Helpers ---

export function getImovel(id: string): Imovel | undefined {
  return IMOVEIS.find((i) => i.id === id);
}

export function getMediaCategoria(avaliacoes: Avaliacao[], categoria: Categoria): number {
  const notas = avaliacoes
    .map((av) => av.notas[categoria]?.nota)
    .filter((n): n is number => n !== undefined);
  if (notas.length === 0) return 0;
  return notas.reduce((a, b) => a + b, 0) / notas.length;
}

export function getMediaGeral(avaliacoes: Avaliacao[]): number {
  const cats: Categoria[] = ['apartamento', 'condominio', 'proprietario', 'imobiliaria'];
  const medias = cats.map((c) => getMediaCategoria(avaliacoes, c)).filter((m) => m > 0);
  if (medias.length === 0) return 0;
  return medias.reduce((a, b) => a + b, 0) / medias.length;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const months =
    (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
  if (months < 1) return 'este mês';
  if (months === 1) return 'há 1 mês';
  if (months > 18) return `há ${months} meses · informação antiga`;
  return `há ${months} meses`;
}

export function fuzzySearch(query: string, imoveis: Imovel[]): Imovel[] {
  const q = query.toLowerCase().trim();
  if (!q) return imoveis;

  const scored = imoveis.map((imovel) => {
    const target = `${imovel.nome} ${imovel.endereco} ${imovel.bairro} ${imovel.cidade}`.toLowerCase();
    let score = 0;

    if (target.includes(q)) {
      score += 10;
    } else {
      const words = q.split(/\s+/);
      words.forEach((word) => {
        if (target.includes(word)) score += 3;
      });
      if (score === 0) {
        const chars = q.split('');
        const matched = chars.filter((c) => target.includes(c)).length;
        score = matched / chars.length;
      }
    }
    return { imovel, score };
  });

  return scored
    .filter(({ score }) => score > 0.3)
    .sort((a, b) => b.score - a.score)
    .map(({ imovel }) => imovel);
}
