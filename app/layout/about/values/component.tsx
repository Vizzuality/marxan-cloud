import React from 'react';

import Wrapper from 'layout/wrapper';

import { VALUES } from './constants';

export interface AboutValuesProps {}

export const AboutValues: React.FC<AboutValuesProps> = () => {
  return (
    <div className="bg-white">
      <Wrapper>
        <div className="mx-auto w-full max-w-5xl py-28">
          <h1 className="mb-6 max-w-3xl text-lg font-semibold text-black opacity-40">Our Values</h1>
          <h2 className="mb-10 mt-3 max-w-max bg-clip-text text-left font-heading text-4xl leading-tight text-black">
            Better solutions
            <br />
            Better decisions.
          </h2>
          <p className="mb-20 max-w-max text-justify font-heading text-lg leading-8 text-black">
            To truly realize a sustainable future, we need inclusive and revolutionary solutions to
            the most pressing conservation challenges. Marxan, the world’s leading conservation
            planning tool, can help fundamentally change how decision-makers use technology for
            conservation. Our goal is to ensure that anyone, anywhere can access data, collaborate,
            and implement actionable spatial plans to support biodiversity, economic growth and
            climate adaptation and mitigation for the next decade of conservation planning.
          </p>
          <div className="grid grid-cols-2 gap-x-36 gap-y-20">
            {VALUES.map((v) => (
              <div className="flex flex-col" key={v.order}>
                <h3 className="mb-5 text-base font-semibold text-black">
                  {v.order} {v.title}
                </h3>
                <p className="mb-5 text-sm text-black">{v.description}</p>
                <a
                  className="text-base text-black underline hover:no-underline"
                  href={v.hyperlink}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {v.hypertext}
                </a>
              </div>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default AboutValues;
