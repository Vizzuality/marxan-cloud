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
            <span className="font-bold">Holiday notice</span>: Support through the usual MaPP
            contact channels will be limited from 22 December 2025 to 4 January 2026. We appreciate
            your patience and will aim to respond to support requests as soon as possible.
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
