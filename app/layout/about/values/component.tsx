import React from 'react';

import Wrapper from 'layout/wrapper';

export interface AboutValuesProps {

}

export const AboutValues: React.FC<AboutValuesProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="w-full max-w-5xl mx-auto py-28">
          <h1 className="max-w-3xl text-lg font-semibold text-black opacity-40">
            Our Values
          </h1>
          <h2 className="pb-16 mt-3 text-4xl leading-tight text-left text-black font-heading max-w-max bg-clip-text">
            Better solutions
            <br />
            Better decisions.
          </h2>
          <p className="text-lg leading-8 text-justify text-black max-w-max font-heading">
            To truly realize a sustainable future, we need inclusive and revolutionary
            solutions to the most pressing conservation challenges. Marxan, the world’s
            leading conservation planning tool, can help fundamentally change how
            decision-makers use technology for conservation. Our goal is to ensure that
            anyone, anywhere can access data, collaborate, and implement actionable
            spatial plans to support biodiversity, economic growth and climate
            adaptation and mitigation for the next decade of conservation planning.
          </p>
        </div>
      </Wrapper>
    </div>
  );
};

export default AboutValues;
