const TERM_BANK = {
  anatomia: {
    facil: [
      { answer: "FEMUR", clue: "Maior osso do corpo humano.", source: "https://pt.wikipedia.org/wiki/F%C3%AAmur" },
      { answer: "SCAPULA", clue: "Osso plano da cintura escapular.", source: "https://pt.wikipedia.org/wiki/Esc%C3%A1pula" },
      { answer: "CRANIO", clue: "Conjunto de ossos que protege o encéfalo." },
      { answer: "ULNA", clue: "Osso do antebraço em direção medial." },
      { answer: "PATELA", clue: "Ossículo sesamoide do joelho." },
    ],
    intermediario: [
      { answer: "HIPOFISE", clue: "Glândula pituitária; produtora de vários hormônios." },
      { answer: "MESENCEFALO", clue: "Parte do tronco encefálico entre ponte e diencéfalo." },
      { answer: "APONEUROSE", clue: "Tendão em forma de lâmina." },
    ],
    avancado: [
      { answer: "ESPACO_DE_MORRISON", clue: "Recesso hepatorrenal (eponímia)." },
      { answer: "TRIANGULO_DE_SCARPA", clue: "Região femoral ântero-medial (eponímia)." },
      { answer: "CIRCUNFLEXA_UMERAL", clue: "Artéria que contorna a cabeça do úmero." },
    ],
  },
  fisiologia: {
    facil: [
      { answer: "NEFRON", clue: "Unidade funcional do rim." },
      { answer: "ALVEOLO", clue: "Estrutura pulmonar de troca gasosa." },
      { answer: "SINAPSE", clue: "Junção funcional entre neurônios." },
    ],
    intermediario: [
      { answer: "DESPOLARIZACAO", clue: "Redução do potencial de membrana." },
      { answer: "ANGIOTENSINA", clue: "Peptídeo do sistema renina-angiotensina." },
    ],
    avancado: [
      { answer: "POTENCIAL_DE_ACAO", clue: "Evento elétrico com despolarização rápida." },
      { answer: "TRANSPORTE_CONTRACORRENTE", clue: "Mecanismo no néfron para concentração urinária." },
    ],
  },
  microbiologia: {
    facil: [
      { answer: "BACTERIA", clue: "Microrganismo procarionte." },
      { answer: "VIRUS", clue: "Acelular; depende da célula hospedeira." },
    ],
    intermediario: [
      { answer: "GRAM", clue: "Técnica de coloração diferencial." },
      { answer: "ESCHERICHIA", clue: "Gênero que inclui E. coli." },
    ],
    avancado: [
      { answer: "BETA_LACTAMASE", clue: "Enzima que confere resistência a antibióticos." },
    ],
  },
  farmacologia: {
    facil: [
      { answer: "ANALGESICO", clue: "Fármaco para dor." },
      { answer: "ANTIPIRETICO", clue: "Reduz febre." },
    ],
    intermediario: [
      { answer: "AGONISTA", clue: "Ativa receptor e gera resposta." },
      { answer: "BIODISPONIBILIDADE", clue: "Fração do fármaco que atinge a circulação." },
    ],
    avancado: [
      { answer: "INIBIDOR_DA_ACHE", clue: "Fármaco que inibe acetilcolinesterase." },
    ],
  },
  patologia: {
    facil: [
      { answer: "EDEMA", clue: "Acúmulo anormal de líquido no interstício." },
      { answer: "NECROSE", clue: "Morte celular patológica." },
    ],
    intermediario: [
      { answer: "APOPTOSE", clue: "Morte celular programada." },
      { answer: "GRANULOMA", clue: "Agregado de macrófagos ativados." },
    ],
    avancado: [
      { answer: "CARCINOMA_DUCTAL", clue: "Neoplasia maligna de origem epitelial em ductos." },
    ],
  },
  bioquimica: {
    facil: [
      { answer: "ENZIMA", clue: "Catalisador biológico." },
      { answer: "ATP", clue: "Principal moeda energética celular." },
    ],
    intermediario: [
      { answer: "GLICOLISE", clue: "Via metabólica que degrada glicose." },
      { answer: "NADH", clue: "Carreador de elétrons reduzido." },
    ],
    avancado: [
      { answer: "CICLO_DA_UREIA", clue: "Processo hepático de eliminação de amônia." },
    ],
  },
};

function normalizeAnswer(s) {
  return s
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_');
}

