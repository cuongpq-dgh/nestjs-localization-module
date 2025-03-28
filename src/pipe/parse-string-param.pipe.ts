import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

export interface ParseStringParamPipeOptions {
    required?: boolean; // If true, empty values will throw an exception
    decodeUrl?: boolean; // If true, will attempt to decode URL-encoded strings
    errorStatusCode?: number; // Status code to use for errors
}

@Injectable()
export class ParseStringParamPipe implements PipeTransform<string, string> {
    private readonly options: ParseStringParamPipeOptions;

    constructor(options: ParseStringParamPipeOptions = {}) {
        this.options = {
            required: false,
            decodeUrl: true, // Default to true for better internationalization support
            ...options,
        };
    }

    transform(value: string, metadata: ArgumentMetadata): string {
        // Check if value exists
        if (this.options.required && (value === undefined || value === null || value === '')) {
            throw new BadRequestException(
                `Parameter ${metadata.data || 'value'} cannot be empty`,
            );
        }

        // If the value is undefined or null and not required, return empty string
        if (value === undefined || value === null) {
            return '';
        }

        // Convert to string
        let parsedValue = String(value);
        
        // Decode URL-encoded string if option is enabled
        if (this.options.decodeUrl && parsedValue) {
            try {
                parsedValue = decodeURIComponent(parsedValue);
            } catch (error) {
                // If decoding fails, keep the original value
                console.warn(`Failed to decode parameter ${metadata.data || 'value'}:`, error);
            }
        }
        
        // Trim the value
        parsedValue = parsedValue.trim();
        
        // If required and empty after trimming, throw error
        if (this.options.required && parsedValue === '') {
            throw new BadRequestException(
                `Parameter ${metadata.data || 'value'} cannot be empty`,
            );
        }

        return parsedValue;
    }
}