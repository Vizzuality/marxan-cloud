import React from 'react';

import Wrapper from 'layout/wrapper';

export interface PrivacyPolicyTermsProps {

}

export const PrivacyPolicyTerms: React.FC<PrivacyPolicyTermsProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="w-full max-w-5xl mx-auto my-32 text-black">

          <div>
            <h1 className="text-4xl font-semibold">MARXAN&apos;S PRIVACY STATEMENT</h1>
            <br />
            <br />
          </div>
          <p><em><b>Updated January 15, 2020</b></em></p>
          <br />
          <div className="space-y-24">
            <div>
              <p>
                Marxan takes your privacy very seriously and
                cares about how your information is collected, used, stored, and shared.  We are
                providing this Privacy Statement to explain our practices and the choices that you
                can make about the way your information is used by the Conservancy. The Privacy
                Statement describes our practices in connection with the information we collect
                through websites operated by us from which you are accessing this Privacy Statement
                (the “
                <b>Websites</b>
                ”), through the software applications made available by us for use on
                or through computers and mobile devices (the “
                <b>Apps</b>
                ”), through our social media pages
                that we control through which you are accessing this Privacy Statement
                (collectively, our “
                <b>Social Media Pages</b>
                ”), as well as through HTML-formatted email
                messages that we send to you that link to this Privacy Statement and through
                offline interactions that we may have with you (collectively, including the
                Websites, the Apps and our Social Media Pages, providing personal curated content)
                ( the “
                <b>Services</b>
                ”).
              </p>
              <br />
              <p>
                <em>
                  For U.S. users only—
                  <b>
                    by visiting this website you are accepting the policies
                    described in this statement and consenting to disclosure of Personal Information
                    to trusted third parties
                  </b>
                  {' '}
                  including grantors, grantees, other charities,
                  collaborative partners, and sponsors, to permit them to send you marketing
                  communications, consistent with your choices.
                </em>
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold">Personal Information We Collect</h2>
              <br />
              <div className="space-y-4">
                <p>
                  <b>“Personal information”</b>
                  {' '}
                  is information that identifies you as an individual or
                  relates to an identifiable individual.
                </p>
                <ul className="pl-10 space-y-4 list-disc">
                  <li>
                    We collect the following Personal Information: Name, email address, postal
                    address, phone number, profile picture, social media ID, and similar contact
                    information and credit card or other payment information. If you choose to
                    provide your payment or credit card information to the Conservancy, we will
                    use that information for the purposes for which it was provided; the Conservancy
                    does not store credit card or other payment information.
                  </li>
                </ul>
              </div>

            </div>
          </div>

          <div>
            <h2 className="text-3xl font-semibold">How We Collect Personal Information</h2>
            <h2 className="text-3xl font-semibold">How the Conservancy Uses Personal Information</h2>
            <h2 className="text-3xl font-semibold">How the Conservancy Discloses Personal Information</h2>
            <h2 className="text-3xl font-semibold">Other Uses and Disclosures</h2>
            <h2 className="text-3xl font-semibold">Other Information</h2>
            <h2 className="text-3xl font-semibold">Our Advertising</h2>
            <h2 className="text-3xl font-semibold">How You Can Control Collection and Use of Your Information</h2>
            <h2 className="text-3xl font-semibold">Your California Privacy Rights</h2>
            <h2 className="text-3xl font-semibold">How We Protect Information</h2>
            <h2 className="text-3xl font-semibold">Retention Period</h2>
            <h2 className="text-3xl font-semibold">Children&apos;s Privacy</h2>
            <h2 className="text-3xl font-semibold">Cross-Border Transfer</h2>
            <h2 className="text-3xl font-semibold">Third Party Content and Links</h2>
            <h2 className="text-3xl font-semibold">Third Party Payment Service</h2>
            <h2 className="text-3xl font-semibold">Sensitive Information</h2>
            <h2 className="text-3xl font-semibold">Changes to This Privacy Statement</h2>
            <h2 className="text-3xl font-semibold">Questions/Contact Information</h2>
            <h2 className="text-3xl font-semibold">Additional Information for Individuals in the EEA</h2>
            <br />

            <p>
              If you are located in the EEA, you also may:
              <ul>
                <li>
                  Contact our Chief Privacy Officer at compliance@tnc.org.
                </li>
                <li>
                  Lodge a complaint with a data protection authority for your country or region, or
                  where an alleged infringement of applicable data protection law occurs.
                </li>
              </ul>
              {' '}
              <a href="https://www.privacypolicies.com/blog/cookies/">“What Are Cookies”</a>
              {' '}
              article.
            </p>
          </div>

        </div>

      </Wrapper>
    </div>
  );
};

export default PrivacyPolicyTerms;
