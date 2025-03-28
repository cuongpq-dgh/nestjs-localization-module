import { Injectable, Logger } from '@nestjs/common';
import { ThirdPartyConfigService } from './third-party-config.service';
import axios, { AxiosInstance } from 'axios';

// Interfaces đơn giản hóa
interface TranslationResult {
  translations: Array<{
    text: string;
    to: string;
  }>;
  detectedLanguage?: {
    language: string;
    score: number;
  };
}

interface DetectedLanguage {
  language: string;
  score: number;
  isTranslationSupported: boolean;
}

@Injectable()
export class MicrosoftTranslatorService {
  private readonly logger = new Logger(MicrosoftTranslatorService.name);
  private apiKey: string | null = null;
  private region: string | null = null;
  private endpoint: string = 'https://api.cognitive.microsofttranslator.com';
  private axiosInstance!: AxiosInstance;
  
  // Batch processing config - tối ưu kích thước batch
  private readonly MAX_BATCH_SIZE: number = 100; // Tăng lên tối đa API cho phép
  private readonly MAX_TEXT_LENGTH: number = 10000; // Microsoft's limit

  // Precompute các giá trị ngôn ngữ phổ biến
  private languageMappings: Record<string, string> = {
    'zh': 'zh-Hans',
    'zh-TW': 'zh-Hant',
    'iw': 'he',
    'jv': 'jw',
    'nb': 'no',
  };

  constructor(
    private readonly thirdPartyConfigService: ThirdPartyConfigService
  ) {
    this.initializeAxios();
    this.loadConfig();
  }

  /**
   * Initialize axios instance with optimized configurations
   */
  private initializeAxios(): void {
    this.axiosInstance = axios.create({
      baseURL: this.endpoint,
      timeout: 5000, // Giảm timeout để fail fast
      headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Region': this.region || '',
        'Ocp-Apim-Subscription-Key': this.apiKey || '',
      },
      // Tối ưu kết nối HTTP
      maxContentLength: 10 * 1024 * 1024, // 10MB
      maxBodyLength: 10 * 1024 * 1024, // 10MB
      decompress: true, // Giữ nguyên nén để tăng tốc
    });
  }

  /**
   * Load Microsoft Translator configuration from database
   */
  async loadConfig(): Promise<void> {
    try {
      const [apiKeyConfig, regionConfig] = await Promise.all([
        this.thirdPartyConfigService.findByCode('MICROSOFT_TRANSLATOR_API_KEY'),
        this.thirdPartyConfigService.findByCode('MICROSOFT_TRANSLATOR_REGION')
      ]);
      
      this.apiKey = apiKeyConfig.value;
      this.region = regionConfig.value;
      
      // Update axios headers with new credentials
      this.axiosInstance.defaults.headers['Ocp-Apim-Subscription-Key'] = this.apiKey;
      this.axiosInstance.defaults.headers['Ocp-Apim-Subscription-Region'] = this.region;
    } catch (error) {
      this.logger.warn('Microsoft Translator configuration not found or incomplete');
    }
  }

  /**
   * Check if Microsoft Translator is configured
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.region);
  }

  /**
   * Directly map language code without async operations
   * Fast path for common languages
   */
  private mapLanguageCodeSync(code: string): string {
    // Direct mapping if available - faster path
    return this.languageMappings[code] || code;
  }

  /**
   * Detect language of text - simplified
   */
  async detectLanguage(text: string): Promise<DetectedLanguage | null> {
    if (!text.trim()) return null;
    
    try {
      const response = await this.axiosInstance.post(
        '/detect',
        [{ text }],
        {
          params: { 'api-version': '3.0' }
        }
      );
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          language: result.language,
          score: result.score,
          isTranslationSupported: true // Assume supported for speed
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Language detection failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Split long text into chunks - optimized for speed
   */
  private splitText(text: string): string[] {
    if (text.length <= this.MAX_TEXT_LENGTH) {
      return [text];
    }
    
    // Fast split - just divide by max length, don't care about sentence boundaries
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.MAX_TEXT_LENGTH) {
      chunks.push(text.substring(i, i + this.MAX_TEXT_LENGTH));
    }
    
    return chunks;
  }

  /**
   * Translate text using Microsoft Translator API
   * Optimized for speed, no caching, no retries
   */
  async translate(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string | null> {
    if (!this.isConfigured()) {
      await this.loadConfig();
      if (!this.isConfigured()) {
        return null;
      }
    }

    // Skip empty text
    if (!text.trim()) {
      return '';
    }
    
    // Direct mapping language codes - no async
    targetLanguage = this.mapLanguageCodeSync(targetLanguage);
    if (sourceLanguage) {
      sourceLanguage = this.mapLanguageCodeSync(sourceLanguage);
    }

    // For long texts, split and translate in chunks
    if (text.length > this.MAX_TEXT_LENGTH) {
      return this.translateLongText(text, targetLanguage, sourceLanguage);
    }

    try {
      const response = await this.axiosInstance.post(
        '/translate',
        [{ text }],
        {
          params: {
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': targetLanguage,
            'textType': 'plain'
          }
        }
      );

      const result = response.data;
      if (result?.[0]?.translations?.[0]) {
        return result[0].translations[0].text;
      }
      return null;
    } catch (error) {
      this.logger.error(`Translation failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Translate a long text by splitting into chunks
   * Optimized for parallel processing
   */
  private async translateLongText(
    text: string, 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<string | null> {
    try {
      // Fast split text into chunks
      const chunks = this.splitText(text);
      
      // Create all translation requests
      const requests = chunks.map(chunk => this.axiosInstance.post(
        '/translate',
        [{ text: chunk }],
        {
          params: {
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': targetLanguage,
            'textType': 'plain'
          }
        }
      ));
      
      // Execute all requests in parallel
      const responses = await Promise.all(requests);
      
      // Extract translation results
      const translatedChunks = responses.map(response => {
        const result = response.data;
        if (result?.[0]?.translations?.[0]) {
          return result[0].translations[0].text;
        }
        return null;
      });
      
      // Combine translated chunks
      const translatedText = translatedChunks
        .filter(chunk => chunk !== null)
        .join(' ');
      
      return translatedText || null;
    } catch (error) {
      this.logger.error(`Long text translation failed: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Translate multiple texts in a batch
   * Optimized for speed - no caching, direct API calls
   */
  async batchTranslate(
    texts: string[], 
    targetLanguage: string, 
    sourceLanguage?: string
  ): Promise<(string | null)[]> {
    if (!this.isConfigured()) {
      await this.loadConfig();
      if (!this.isConfigured()) {
        return texts.map(() => null);
      }
    }
    
    if (!texts || texts.length === 0) {
      return [];
    }
    
    // Direct mapping language codes - no async
    targetLanguage = this.mapLanguageCodeSync(targetLanguage);
    if (sourceLanguage) {
      sourceLanguage = this.mapLanguageCodeSync(sourceLanguage);
    }

    // Filter out empty texts and process in batches
    const validTexts = texts.map(t => t?.trim() || '');
    const results: (string | null)[] = Array(texts.length).fill(null);
    
    // Create a map of indices for non-empty texts
    const nonEmptyIndices: number[] = [];
    const nonEmptyTexts: string[] = [];
    
    validTexts.forEach((text, idx) => {
      if (text) {
        nonEmptyTexts.push(text);
        nonEmptyIndices.push(idx);
      } else {
        results[idx] = '';
      }
    });
    
    // Process in batches to stay within API limits
    const batchPromises = [];
    
    for (let i = 0; i < nonEmptyTexts.length; i += this.MAX_BATCH_SIZE) {
      const batch = nonEmptyTexts.slice(i, i + this.MAX_BATCH_SIZE);
      
      // Use one API call for each batch
      const promise = this.axiosInstance.post(
        '/translate',
        batch.map(text => ({ text })),
        {
          params: {
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': targetLanguage,
            'textType': 'plain'
          }
        }
      ).then(response => {
        const apiResults = response.data || [];
        
        // Map results back to original indices
        apiResults.forEach((result: any, batchIndex: number) => {
          const originalIndex = nonEmptyIndices[i + batchIndex];
          
          if (result?.translations?.[0]) {
            results[originalIndex] = result.translations[0].text;
          }
        });
      }).catch(error => {
        this.logger.error(`Batch translation failed: ${error instanceof Error ? error.message : String(error)}`);
      });
      
      batchPromises.push(promise);
    }
    
    // Wait for all batches to complete
    await Promise.all(batchPromises);
    
    return results;
  }

  /**
   * Translate text to multiple target languages at once
   * Optimized for speed
   */
  async translateToMultipleLanguages(
    text: string,
    targetLanguages: string[],
    sourceLanguage?: string
  ): Promise<Map<string, string | null>> {
    if (!this.isConfigured()) {
      await this.loadConfig();
      if (!this.isConfigured()) {
        return new Map(targetLanguages.map(lang => [lang, null]));
      }
    }
    
    // Skip empty text
    if (!text.trim()) {
      return new Map(targetLanguages.map(lang => [lang, '']));
    }
    
    // Direct sync mapping
    const mappedTargetLanguages = targetLanguages.map(lang => 
      this.mapLanguageCodeSync(lang)
    );
    
    if (sourceLanguage) {
      sourceLanguage = this.mapLanguageCodeSync(sourceLanguage);
    }
    
    // Initialize result map
    const results = new Map<string, string | null>();
    targetLanguages.forEach(lang => results.set(lang, null));
    
    // For long texts, process each target language in parallel
    if (text.length > this.MAX_TEXT_LENGTH) {
      const chunks = this.splitText(text);
      
      await Promise.all(targetLanguages.map(async (origLang, i) => {
        const mappedLang = mappedTargetLanguages[i];
        
        // Translate each chunk for this language
        const chunksPromises = chunks.map(chunk => 
          this.axiosInstance.post(
            '/translate',
            [{ text: chunk }],
            {
              params: {
                'api-version': '3.0',
                'from': sourceLanguage,
                'to': mappedLang,
                'textType': 'plain'
              }
            }
          )
        );
        
        const chunkResponses = await Promise.all(chunksPromises);
        
        const translatedChunks = chunkResponses.map(response => {
          const data = response.data;
          return data?.[0]?.translations?.[0]?.text || null;
        });
        
        // Combine chunks
        const fullTranslation = translatedChunks
          .filter(chunk => chunk !== null)
          .join(' ');
        
        results.set(origLang, fullTranslation || null);
      }));
      
      return results;
    }
    
    // Handle regular texts
    // Process translations in parallel but in batches of languages
    const LANGUAGES_PER_REQUEST = 10; // Increase for speed
    
    const requests = [];
    
    for (let i = 0; i < mappedTargetLanguages.length; i += LANGUAGES_PER_REQUEST) {
      const languageBatch = mappedTargetLanguages.slice(i, i + LANGUAGES_PER_REQUEST);
      
      // Make API request for each batch
      const request = this.axiosInstance.post(
        '/translate',
        [{ text }],
        {
          params: {
            'api-version': '3.0',
            'from': sourceLanguage,
            'to': languageBatch,
            'textType': 'plain'
          }
        }
      ).then(response => {
        if (response.data?.[0]?.translations) {
          const translations = response.data[0].translations;
          
          translations.forEach((translation: any) => {
            const translatedText = translation.text;
            const translatedLang = translation.to;
            
            // Find original language
            const targetIndex = mappedTargetLanguages.findIndex(lang => lang === translatedLang);
            if (targetIndex !== -1) {
              const origLang = targetLanguages[targetIndex];
              results.set(origLang, translatedText);
            }
          });
        }
      }).catch(error => {
        this.logger.error(`Multi-language translation failed: ${error instanceof Error ? error.message : String(error)}`);
      });
      
      requests.push(request);
    }
    
    await Promise.all(requests);
    
    return results;
  }
}
