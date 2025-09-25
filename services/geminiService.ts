import { GoogleGenAI, Modality, Part, GenerateContentResponse } from "@google/genai";
import type { LogoGenerationParams, LogoGenerationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGenerationResult = (result: GenerateContentResponse): LogoGenerationResult => {
    let imageUrl = '';
    let text = 'No descriptive text was generated.';

    if (result.candidates?.[0]?.content?.parts) {
        for (const part of result.candidates[0].content.parts) {
            if (part.inlineData) {
                const { mimeType, data } = part.inlineData;
                imageUrl = `data:${mimeType};base64,${data}`;
            } else if (part.text) {
                text = part.text;
            }
        }
    }

    if (!imageUrl) {
        throw new Error('The AI did not generate an image. Please try refining your prompt.');
    }

    return { imageUrl, text };
}

const dataUrlToBase64 = (dataUrl: string): { mimeType: string; data: string } => {
    const [header, base64Data] = dataUrl.split(',');
    const mimeTypeMatch = header.match(/:(.*?);/);
    if (!mimeTypeMatch || !mimeTypeMatch[1]) {
        throw new Error("Invalid data URL");
    }
    const mimeType = mimeTypeMatch[1];
    return { mimeType, data: base64Data };
};


function constructPrompt(params: LogoGenerationParams): string {
    const { prompt, companyName, baseImage, style } = params;
    const styleAndConcept = `The desired style is "${style}", and the logo concept is: "${prompt}".`;

    if (baseImage) {
        return `
            Act as a professional logo designer. 
            Refine the provided image into a logo for a company named "${companyName}".
            ${styleAndConcept}
            If it makes sense, elegantly integrate the company name "${companyName}" into the logo.
            Make the final logo look professional, polished, and modern. Output only the final logo image.
        `;
    }
    return `
        Act as a professional logo designer. 
        Create a logo from scratch for a company named "${companyName}".
        ${styleAndConcept}
        The logo must be a simple, modern, memorable icon in a vector style.
        It must be on a clean, solid, light-colored background suitable for a logo presentation. Do not use a transparent background. Output only the final logo image.
    `;
}

export const generateLogo = async (params: LogoGenerationParams): Promise<LogoGenerationResult> => {
    const textPrompt = constructPrompt(params);
    const parts: Part[] = [{ text: textPrompt }];

    if (params.baseImage) {
        parts.unshift({
            inlineData: {
                mimeType: params.baseImage.mimeType,
                data: params.baseImage.data,
            },
        });
    }

    const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        }
    });
    
    return parseGenerationResult(result);
};

export const generateLogoVariations = async (
    baseParams: LogoGenerationParams,
    originalLogo: LogoGenerationResult
): Promise<LogoGenerationResult[]> => {
    const NUM_VARIATIONS = 3;
    const originalLogoImage = dataUrlToBase64(originalLogo.imageUrl);

    const prompt = `
        Act as a professional logo designer.
        Generate a variation of the provided logo for the company "${baseParams.companyName}".
        The original concept was "${baseParams.prompt}" in a "${baseParams.style}" style.
        Create a new version that is clearly related to the original but explores a different composition, slightly different color palette, or alternative iconography.
        Maintain the professional, polished, and modern feel.
        Output only the final logo image.
    `;

    const parts: Part[] = [
        {
            inlineData: {
                mimeType: originalLogoImage.mimeType,
                data: originalLogoImage.data,
            },
        },
        { text: prompt }
    ];

    const generateSingleVariation = async (): Promise<LogoGenerationResult> => {
        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            }
        });
        return parseGenerationResult(result);
    };

    const variationPromises = Array.from({ length: NUM_VARIATIONS }, () => generateSingleVariation());
    
    return Promise.all(variationPromises);
};