import { useCallback } from 'react';

import { useCookies } from 'react-cookie';

import { useFeatureFlags } from 'hooks/feature-flags';

import Button from 'components/button';
import Wrapper from 'layout/wrapper';

export const UpcomingChangesBanner = (): JSX.Element => {
  const [cookies, setCookie] = useCookies(['upcoming-changes']);
  const { upcomingChanges } = useFeatureFlags();

  const onAccept = useCallback(() => {
    setCookie('upcoming-changes', 'true', { path: '/' });
  }, [setCookie]);

  if (cookies['upcoming-changes'] === 'true' || !upcomingChanges) return null;

  return (
    <div className="relative z-10 w-full bg-yellow-600">
      <Wrapper>
        <div className="flex items-center space-x-5 py-2 text-sm text-gray-800">
          <p>
            <span className="font-bold">Attention users</span>: MaPP has undergone a transformative
            upgrade, introducing an enhanced interface and new features. The new version is live,
            with all improvements implemented as of January 25th. Your existing projects have
            seamlessly transitioned to the improved MaPP. If you encounter any issues, please
            don&apos;t hesitate to reach out to us. Thank you and get ready to enjoy an enhanced
            planning experience!
          </p>
          <Button
            theme="secondary"
            size="s"
            className="flex-shrink-0 whitespace-nowrap"
            onClick={onAccept}
          >
            Accept
          </Button>
        </div>
      </Wrapper>
    </div>
  );
};

export default UpcomingChangesBanner;
