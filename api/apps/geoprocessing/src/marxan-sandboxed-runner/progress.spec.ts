import { Progress } from './progress';

const chunks = [
  `
Run 3 is finished (out of 16). Time passed so far is 0 secs
Run 6 is finished (out of 16). Time passed so far is 0 secs
Run 1 is finished (out of 16). Time passed so far is 0 secs
Run 5 is f`,
  `inished (out of 16). Time passed so far is 0 secs
Run 2 is finished (out of 16). Time passed so far is 0 secs
Run 4 is finished (out of 16). Time passed so far is 0 secs`,
  `
Run 7 is finished (out of 16). Time passed so far is 0 secs
Run 8 is finished (out of 16). Time passed so far is 0 secs
Run 10 is finished (out of 16). Time pas`,
  `sed so far is 0 secs
Run 11 is finished (out of 16). Time passed so far is 0 secs
Run 12 is finished`,
  ` (out of 16). Time passed so far is 0 secs
Run 9 is finished (out of 16). Time passed so far is 1 secs
Run 14 is finished (out of 16). Time passed so far is 1 secs
Run 16 is finished (out of 16). Time passed so far is 1 secs
Run 1`,
  `5 is finished (out of 16). Time passed so far is 1 secs
Run 13 is finished (out of 16). Time passed so far is 1 secs
`,
];

it(`should return valid progresses`, () => {
  // given
  const progress = new Progress();

  // when
  const progressValues = chunks.map((chunk) =>
    progress.read(Buffer.from(chunk)),
  );

  // then
  expect(progressValues).toEqual([0.1875, 0.375, 0.5625, 0.625, 0.875, 1]);
});
