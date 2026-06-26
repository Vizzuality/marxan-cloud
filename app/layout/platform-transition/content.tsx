import React from 'react';

import Button from 'components/button';
import Checkbox from 'components/forms/checkbox';

const GUIDE_URL = 'https://tnc.box.com/s/io7czx68a8nnnj3yos8qa724br86lfis';
const DONT_SHOW_AGAIN_ID = 'platform-transition-dont-show-again';

export interface PlatformTransitionContentProps {
  onDismiss?: () => void;
  dontShowAgain?: boolean;
  onDontShowAgainChange?: (value: boolean) => void;
  /** When true, render the non-dismissable maintenance-mode message (no controls). */
  maintenance?: boolean;
}

export const PlatformTransitionContent: React.FC<PlatformTransitionContentProps> = ({
  onDismiss,
  dontShowAgain = false,
  onDontShowAgainChange,
  maintenance = false,
}) => {
  if (maintenance) {
    return (
      <div className="flex max-h-[80vh] flex-col overflow-y-auto px-10 pb-8 pt-2 text-gray-700">
        <div className="space-y-3 text-center">
          <p className="text-3xl font-bold text-gray-800">ATTENTION!</p>
          <p className="text-lg font-bold text-gray-800">
            MaPP is currently in Maintenance Mode and will remain non-usable until July 4.
          </p>
          <p className="text-sm leading-relaxed">
            If you have any questions or require assistance, you can contact{' '}
            <a
              href="mailto:marxanadmin@tnc.org"
              className="text-primary-500 underline hover:text-primary-700"
            >
              marxanadmin@tnc.org
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-[80vh] flex-col overflow-y-auto px-10 pb-8 pt-2 text-gray-700">
      <h2 className="font-heading text-2xl text-gray-800">Important Platform Transition Notice</h2>

      <div className="mt-4 space-y-4 text-sm leading-relaxed">
        <div className="border-l-4 border-yellow-600 bg-yellow-50 px-4 py-3 font-bold text-gray-800">
          <p className="text-lg">WARNING!</p>
          <p className="text-base">
            MaPP will switch to Maintenance Mode and will be non-usable from June 29 to July 3.
          </p>
        </div>

        <p>
          MaPP will transition from The Nature Conservancy to a new host and long-term steward
          starting July 1, 2026, an exciting new stage for the platform&apos;s future development
          and sustainability.
        </p>

        <p>
          We do not expect disruptions during the transition period (May–June). However, temporary
          performance or access issues may occur during the final migration stage.
        </p>

        <p>
          To avoid any risk, we strongly recommend that all users by <strong>June 26</strong>:
        </p>

        <ul className="ml-6 list-disc space-y-1">
          <li>Complete any ongoing analyses</li>
          <li>Export results</li>
          <li>Back up active/important projects</li>
          <li>Delete old/inactive projects</li>
        </ul>

        <p>
          You can download a quick user guide here for instructions:{' '}
          <a
            href={GUIDE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-500 underline hover:text-primary-700"
          >
            MaPP transition user guide
          </a>
          .
        </p>

        <p>
          Backing up projects is especially important to ensure they can be restored if needed after
          the transition.
        </p>

        <p>
          We will continue to share updates as we approach the final migration and keep you informed
          throughout the process.
        </p>

        <p>Thank you for your continued use of MaPP and your support during this transition.</p>

        <p>
          If you have any questions or require assistance, you can contact{' '}
          <a
            href="mailto:marxanadmin@tnc.org"
            className="text-primary-500 underline hover:text-primary-700"
          >
            marxanadmin@tnc.org
          </a>
          .
        </p>
      </div>

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
    </div>
  );
};

export default PlatformTransitionContent;
