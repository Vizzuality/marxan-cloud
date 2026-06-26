import React from 'react';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';

const DONT_SHOW_AGAIN_ID = 'platform-transition-dont-show-again';

export interface PlatformTransitionContentProps {
  onDismiss?: () => void;
  dontShowAgain?: boolean;
  onDontShowAgainChange?: (value: boolean) => void;
  /** When true, hide the dismissal controls (the modal is a non-dismissable maintenance lock). */
  maintenance?: boolean;
}

export const PlatformTransitionContent: React.FC<PlatformTransitionContentProps> = ({
  onDismiss,
  dontShowAgain = false,
  onDontShowAgainChange,
  maintenance = false,
}) => {
  return (
    <div className="flex max-h-[80vh] flex-col overflow-y-auto px-10 pb-8 pt-2 text-gray-700">
      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        <div className="border-l-4 border-yellow-600 bg-yellow-50 px-4 py-3 font-bold text-gray-800">
          <p className="text-lg">WARNING!</p>
          <h2 className="font-heading text-base text-gray-800">
            Important Platform Transition Notice
          </h2>
        </div>

        <p>
          MaPP is transitioning from The Nature Conservancy (TNC) to a new long-term steward, QCIF
          Digital Research, to support its continued development and sustainability. This transition
          ensures ongoing support, improved infrastructure, and long-term stability for the
          platform.
        </p>

        <p>
          MaPP will be unavailable starting June 29 while we complete the migration to QCIF-hosted
          infrastructure.
        </p>

        <p>
          The main cutover is planned for June 30, followed by validation from July 1–3. We expect
          to confirm broader access from July 4, pending successful validation.
        </p>

        <p>
          While this transition is being carefully managed by TNC, QCIF, and Vizzuality, temporary
          access or performance issues may occur.
        </p>

        <p>
          Please avoid scheduling critical analyses, workshops, or trainings between June 30 and
          July 15 while the platform is migrated, validated, and optimized.
        </p>

        <p>
          For support after migration:{' '}
          <a
            href="mailto:marxan_platform@qcif.edu.au"
            className="text-primary-500 underline hover:text-primary-700"
          >
            marxan_platform@qcif.edu.au
          </a>
        </p>
      </div>

      {!maintenance && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <label htmlFor={DONT_SHOW_AGAIN_ID} className="flex cursor-pointer items-center gap-2">
            <Checkbox
              id={DONT_SHOW_AGAIN_ID}
              theme="light"
              checked={dontShowAgain}
              onChange={(event) => onDontShowAgainChange?.(event.target.checked)}
            />
            <span className="text-sm text-gray-700">Don&apos;t show me this again</span>
          </label>
          <Button theme="primary" size="base" onClick={onDismiss}>
            Got it
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlatformTransitionContent;
