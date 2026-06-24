import { Transform, plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsString()
  DATABASE_URL?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    return Number(value);
  })
  @IsInt()
  @Min(1)
  BACKEND_PORT?: number;

  @IsOptional()
  @IsString()
  QDRANT_URL?: string;

  @IsOptional()
  @IsString()
  QDRANT_COLLECTION?: string;

  @IsOptional()
  @IsString()
  OPENAI_API_KEY?: string;

  @IsOptional()
  @IsString()
  OPENAI_EMBEDDING_MODEL?: string;

  @IsOptional()
  @IsString()
  GROQ_API_KEY?: string;
}

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return config;
}
