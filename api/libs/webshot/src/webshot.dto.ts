import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PDFOptions } from 'puppeteer';

export class WebshotSummaryReportConfig {
  @ApiProperty()
  @IsString()
  baseUrl!: string;

  @ApiPropertyOptional()
  @IsOptional()
  cookie?: string;

  @ApiPropertyOptional()
  @IsOptional()
  pdfOptions?: PDFOptions;
}
