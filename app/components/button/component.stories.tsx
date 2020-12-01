import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import Button, { ButtonProps } from './component';

export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['xs', 's', 'base'],
      },
    },
    theme: {
      control: {
        type: 'select',
        options: ['primary', 'primary-alt', 'secondary', 'secondary-alt'],
      },
    },
  },
};

const Template: Story<ButtonProps> = ({ children, ...args }: ButtonProps) => <Button {...args}>{children}</Button>;

export const Default = Template.bind({});

Default.args = {
  children: 'Button',
  size: 'base',
  theme: 'primary',
};

export const Primary: React.FC<unknown> = () => {
  return (
    <div>
      <div>
        <h2 className="mb-2 text-white uppercase text-xxs">Extra small</h2>
        <Button size="xs" theme="primary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Small</h2>
        <Button size="s" theme="primary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Base</h2>
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
        <h2 className="mb-2 text-white uppercase text-xxs">Extra small</h2>
        <Button size="xs" theme="primary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Small</h2>
        <Button size="s" theme="primary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Base</h2>
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
        <h2 className="mb-2 text-white uppercase text-xxs">Extra small</h2>
        <Button size="xs" theme="secondary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Small</h2>
        <Button size="s" theme="secondary">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Base</h2>
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
      <div>
        <h2 className="mb-2 text-white uppercase text-xxs">Extra small</h2>
        <Button size="xs" theme="secondary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Small</h2>
        <Button size="s" theme="secondary-alt">
          Button
        </Button>
      </div>
      <div className="pt-5">
        <h2 className="mb-2 text-white uppercase text-xxs">Base</h2>
        <Button size="base" theme="secondary-alt">
          Button
        </Button>
      </div>
    </div>
  );
};
