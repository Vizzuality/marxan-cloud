import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PDFOptions, ScreenshotOptions } from 'puppeteer';

export class WebshotConfig {
  @ApiProperty()
  @IsString()
  baseUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  cookie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pdfOptions?: PDFOptions;

  @ApiPropertyOptional()
  @IsOptional()
  screenshotOptions?: ScreenshotOptions;
}
