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
            MaPP is undergoing a transformation with an enhanced interface and new features released
            by the <span className="font-bold">end of January 2024</span>! Your existing projects
            will seamlessly transition to the new version. For any concerns, feel free to reach out
            to us. Stay tuned for a better planning experience!
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
