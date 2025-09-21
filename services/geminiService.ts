import { GoogleGenAI, Modality, Part } from "@google/genai";
import type { LogoGenerationParams, LogoGenerationResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function constructPrompt(params: LogoGenerationParams): string {
    const { prompt, companyName, baseImage } = params;
    if (baseImage) {
        return `
            Act as a professional logo designer. 
            Refine the provided image into a logo for a company named "${companyName}".
            The desired style is: "${prompt}".
            If it makes sense, elegantly integrate the company name "${companyName}" into the logo.
            Make the final logo look professional, polished, and modern. Output only the final logo image.
        `;
    }
    return `
        Act as a professional logo designer. 
        Create a logo from scratch for a company named "${companyName}".
        The logo concept is: "${prompt}".
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
    
    let imageUrl = '';
    let text = 'No descriptive text was generated.';

    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
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
};