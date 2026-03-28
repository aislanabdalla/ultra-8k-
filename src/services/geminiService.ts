import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";

const getAI = () => {
  // Use API_KEY for 3.1 models (requires user selection) or GEMINI_API_KEY for 2.5
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key não encontrada. Por favor, selecione sua chave de API no painel.");
  }
  return new GoogleGenAI({ apiKey });
};

export type EnhancementStyle = 'ultra';

export interface UpscaleConfig {
  upscaleFactor: number;
  sharpen: number;
  denoise: number;
  fixCompression: number;
  faceRecovery: boolean;
  faceRecoveryStrength: number;
  faceRecoveryMode: 'realistic' | 'creative';
  gammaCorrection: boolean;
  colorize: boolean;
  autoRestore: boolean;
}

export async function upscaleImage(
  base64Image: string, 
  mimeType: string, 
  config: UpscaleConfig
): Promise<string> {
  const ai = getAI();
  // Upgrade to 3.1 for "Best Quality" as requested
  const model = "gemini-3.1-flash-image-preview";

  const prompt = `
    Aja como o sistema de restauração de imagem mais avançado do mundo: MOTOR RECURSIVO ULTRA 8K SUPREME (UNFILTERED QUALITY MODE).
    Sua tarefa é realizar um upscale de ${config.upscaleFactor}x na imagem original, aplicando um processo de RECONSTRUÇÃO NEURAL PROFUNDA SEM LIMITES DE QUALIDADE.
    
    RECURSOS ESPECIAIS ATIVADOS:
    ${config.colorize ? '- COLORIZAÇÃO INTELIGENTE: Se a imagem for preto e branco ou desbotada, aplique cores realistas e vibrantes baseadas em contexto histórico e natural.' : ''}
    ${config.autoRestore ? '- RESTAURAÇÃO AUTOMÁTICA: Remova rasgos, manchas, poeira, arranhões e dobras físicas da imagem original. Reconstrua partes faltantes com perfeição.' : ''}

    DIRETRIZES DE AMPLIAÇÃO (${config.upscaleFactor}X):
    1. RECONSTRUÇÃO RECURSIVA: Para cada nível de aumento, você deve inventar e preencher micro-detalhes que não existem na imagem original para evitar pixelização ou desfoque.
    2. NITIDEZ EXTREMA: A imagem final deve parecer ter sido capturada nativamente na resolução resultante, com bordas perfeitas e zero artefatos.
    3. TEXTURA E POROSIDADE: Recrie a porosidade da pele, micro-texturas de tecidos e superfícies naturais com realismo fotográfico absoluto.
    4. VETORIZAÇÃO DE TEXTO: Identifique qualquer texto ou logotipo e reconstrua-os com precisão vetorial absoluta.
    
    CONFIGURAÇÕES DE PROCESSAMENTO (GIGAPIXEL PRO):
    - Sharpen (Nitidez): ${config.sharpen}/100
    - Denoise (Redução de Ruído): ${config.denoise}/100
    - Fix Compression (Remover Artefatos): ${config.fixCompression}/100
    - Gamma Correction: ${config.gammaCorrection ? 'ATIVADO' : 'DESATIVADO'}
    
    RECUPERAÇÃO FACIAL: ${config.faceRecovery ? `ATIVADA (Força: ${config.faceRecoveryStrength}/100, Modo: ${config.faceRecoveryMode.toUpperCase()}). Reconstrua íris, cílios, dentes e pele com perfeição microscópica.` : 'Mantenha os rostos naturais mas com alta nitidez.'}
    
    O resultado deve ser uma obra-prima de nitidez e realismo, desafiando os limites da física óptica. A imagem deve ser EXTREMAMENTE DETALHISTA.
    
    Retorne apenas a imagem processada.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        // Remove blocks that limit quality/content as requested
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ]
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].content) {
      throw new Error("Nenhuma resposta válida recebida do modelo. Verifique se a imagem não foi bloqueada pelos filtros de segurança.");
    }

    const parts = candidates[0].content.parts;
    if (!parts) {
      throw new Error("O modelo retornou uma resposta sem partes de conteúdo.");
    }

    for (const part of parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("O modelo não retornou uma imagem processada.");
  } catch (error) {
    console.error("Erro no processamento da imagem:", error);
    throw error;
  }
}
