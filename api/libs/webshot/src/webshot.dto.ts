import {
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PDFOptions, ScreenshotOptions } from 'puppeteer';
import { Type } from 'class-transformer';

class ReportOptions {
  @ApiProperty()
  @IsString()
  solutionId!: string;
}

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

  @ValidateNested()
  @IsObject()
  @Type(() => ReportOptions)
  @ApiProperty()
  reportOptions!: ReportOptions;
}
