import * as React from 'react';
import Button from './component';

export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary: React.FC<unknown> = () => {
  return (
    <div>
      <div>
        <h2>Extra small</h2>
        <Button size="xs" theme="primary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Small</h2>
        <Button size="s" theme="primary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Base</h2>
        <Button size="base" theme="primary">
          Button
        </Button>
      </div>
    </div>
  );
};

export const PrimaryAlt: React.FC<unknown> = () => {
  return (
    <div>
      <div>
        <h2>Extra small</h2>
        <Button size="xs" theme="primary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Small</h2>
        <Button size="s" theme="primary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Base</h2>
        <Button size="base" theme="primary-alt">
          Button
        </Button>
      </div>
    </div>
  );
};

export const Secondary: React.FC<unknown> = () => {
  return (
    <div>
      <div>
        <h2>Extra small</h2>
        <Button size="xs" theme="secondary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Small</h2>
        <Button size="s" theme="secondary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Base</h2>
        <Button size="base" theme="secondary">
          Button
        </Button>
      </div>
    </div>
  );
};

export const SecondaryAlt: React.FC<unknown> = () => {
  return (
    <div>
      <h1>Sizes</h1>
      <div>
        <h2>Extra small</h2>
        <Button size="xs" theme="secondary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Small</h2>
        <Button size="s" theme="secondary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2>Base</h2>
        <Button size="base" theme="secondary-alt">
          Button
        </Button>
      </div>
    </div>
  );
};
