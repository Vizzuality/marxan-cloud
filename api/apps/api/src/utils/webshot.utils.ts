import { WebshotConfig, WebshotService } from '@marxan/webshot';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
import { AppConfig } from './config.utils';
const webshotUrl = AppConfig.get('webshot.url') as string;
const imgGenerationError = Symbol(`Image generation has failed.`);

export const getScenarioSnapshot = async (
  featuredScenarioId: string,
  projectId: string,
  webshotService: WebshotService,
  config: WebshotConfig,
): Promise<Either<typeof imgGenerationError, string>> => {
  const pngData = await webshotService.getPublishedProjectsImage(
    featuredScenarioId,
    projectId,
    {
      ...config,
      screenshotOptions: {
        clip: { x: 0, y: 0, width: 500, height: 500 },
      },
    },
    webshotUrl,
  );

  if (isLeft(pngData)) {
    console.info(
      `Map screenshot for public project ${projectId} could not be generated`,
    );
    return left(imgGenerationError);
  }

  return right(pngData.right);
};
