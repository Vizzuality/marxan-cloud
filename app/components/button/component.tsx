import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, FC } from 'react';

import cx from 'classnames';

import Link, { LinkProps } from 'next/link';

const THEME = {
  primary:
    'text-black bg-primary-500 hover:bg-primary-400 active:bg-primary-300 border border-primary-500 hover:border-primary-400 active:border-primary-300',
  'primary-alt':
    'text-primary-500 bg-transparent hover:bg-transparent active:bg-transparent border border-primary-500 hover:border-primary-400 active:border-primary-300',

  secondary:
    'text-white bg-gray-500 hover:bg-gray-400 active:bg-gray-300 border border-gray-500 hover:border-gray-400 active:border-gray-300',
  'secondary-alt':
    'text-gray-300 bg-transparent hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  tertiary: 'text-black bg-gray-100 hover:bg-gray-400 hover:border-gray-400 hover:text-white',

  white:
    'text-gray-700 bg-white hover:text-white hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  danger:
    'text-red-700 bg-transparent hover:text-white hover:bg-red-700 active:bg-red-600 border border-red-700 hover:border-red-600 active:border-red-500',
  'danger-alt':
    'text-white hover:bg-transparent border border-red-700 hover:text-red-700 bg-red-700 active:bg-red-600 hover:border hover:border-red-700 active:text-white active:border-red-500',

  spacial:
    'text-white bg-transparent hover:bg-gray-400 active:bg-gray-300 flex items-center justify-center rounded-4xl focus:outline-none',

  dark: 'text-white bg-gray-600 border border-gray-600 hover:bg-black hover:text-white',
  'dark-alt':
    'text-gray-800 bg-transparent border border-gray-800 hover:border-gray-400 hover:text-gray-400',

  clear: 'text-gray-800 hover:text-gray-400',

  'transparent-black':
    'text-black bg-transparent border border-black hover:bg-black hover:text-white',
  'transparent-white':
    'text-white bg-transparent border border-white hover:bg-white hover:text-black',
};

const SIZE = {
  xs: 'text-sm px-2 py-0',
  s: 'text-sm px-3 py-0.5',
  base: 'text-sm px-8 py-2',
  lg: 'text-base px-8 py-3',
  xl: 'text-base px-14 py-3',
};

export interface AnchorButtonProps {
  theme:
    | 'primary'
    | 'primary-alt'
    | 'white'
    | 'secondary'
    | 'secondary-alt'
    | 'tertiary'
    | 'danger'
    | 'danger-alt'
    | 'spacial'
    | 'dark'
    | 'dark-alt'
    | 'transparent-black'
    | 'transparent-white'
    | 'clear';
  size: 'xs' | 's' | 'base' | 'lg' | 'xl';
  className?: string;
}

// Button props
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorButtonProps & {
    href?: undefined;
  };

// Anchor props
export type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  AnchorButtonProps & {
    href?: string;
    disabled?: boolean;
    anchorLinkProps?: LinkProps;
  };

// Input/output options
type Overload = {
  (props: ButtonProps): JSX.Element;
  (props: AnchorProps): JSX.Element;
};

// Guard to check if href exists in props
const hasHref = (props: ButtonProps | AnchorProps): props is AnchorProps => 'href' in props;

function buildClassName({ className, disabled, size, theme }) {
  return cx({
    'group relative flex items-center justify-center rounded-4xl transition-colors focus:outline-none':
      true,
    [THEME[theme]]: true,
    [SIZE[size]]: true,
    [className]: !!className,
    'opacity-50 pointer-events-none': disabled,
  });
}

function buildChildren({ theme, children }) {
  if (theme === 'spacial') {
    return (
      <>
        <div className="absolute bottom-0 left-0 right-0 top-0 z-0 rounded-4xl bg-gradient-to-r from-purple-500 to-blue-500">
          <div className="relative h-full w-full border-2 border-transparent">
            <div className="absolute h-full w-full rounded-4xl bg-black transition-colors group-hover:bg-transparent" />
          </div>
        </div>
        <div className="relative z-20">{children}</div>
      </>
    );
  }
  return children;
}

export const LinkAnchor: FC<AnchorProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  href,
  anchorLinkProps,
}: AnchorProps) => (
  <Link
    href={href}
    {...anchorLinkProps}
    className={buildClassName({
      className,
      disabled,
      size,
      theme,
    })}
  >
    {buildChildren({ children, theme })}
  </Link>
);

export const Anchor: FC<AnchorProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  href,
  ...restProps
}: AnchorProps) => {
  // Anchor element doesn't support disabled attribute
  // https://www.w3.org/TR/2014/REC-html5-20141028/disabled-elements.html
  if (disabled) {
    return <span {...restProps}>{buildChildren({ children, theme })}</span>;
  }
  return (
    <a
      href={href}
      className={buildClassName({
        className,
        disabled,
        size,
        theme,
      })}
      {...restProps}
    >
      {buildChildren({ children, theme })}
    </a>
  );
};

export const Button: FC<ButtonProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  ...restProps
}: ButtonProps) => (
  <button
    type="button"
    className={buildClassName({
      className,
      disabled,
      size,
      theme,
    })}
    disabled={disabled}
    {...restProps}
  >
    {buildChildren({ children, theme })}
  </button>
);

export const LinkButton: Overload = (props: ButtonProps | AnchorProps) => {
  // We consider a link button when href attribute exits
  if (hasHref(props)) {
    if (props.href?.startsWith('http')) {
      return <Anchor {...props} />;
    }
    return <LinkAnchor {...props} />;
  }
  return <Button {...props} />;
};

export default LinkButton;
