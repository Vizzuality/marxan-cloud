import React, {
  ButtonHTMLAttributes, AnchorHTMLAttributes, RefObject,
} from 'react';
import Link, { LinkProps } from 'next/link';
import cx from 'classnames';

const THEME = {
  primary: 'text-black bg-primary-500 hover:bg-primary-400 active:bg-primary-300 border border-primary-500 hover:border-primary-400 active:border-primary-300',
  'primary-alt': 'text-primary-500 bg-transparent hover:bg-transparent active:bg-transparent border border-primary-500 hover:border-primary-400 active:border-primary-300',

  secondary: 'text-white bg-gray-500 hover:bg-gray-400 active:bg-gray-300 border border-gray-500 hover:border-gray-400 active:border-gray-300',
  'secondary-alt': 'text-gray-300 bg-transparent hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  white: 'text-gray-700 bg-white hover:text-white hover:bg-transparent active:bg-transparent border border-gray-400 hover:border-gray-300 active:border-gray-200',

  danger: 'text-red-700 bg-white hover:text-white hover:bg-red-700 active:bg-red-600 border border-red-700 hover:border-red-600 active:border-red-500',
};

const SIZE = {
  xs: 'text-sm px-2 py-0.5',
  s: 'text-sm px-3 py-0.5',
  base: 'text-sm px-8 py-2',
  lg: 'text-base px-8 py-3',
  xl: 'text-base px-14 py-3',
};

export interface AnchorButtonProps {
  theme: 'primary' | 'primary-alt' | 'white' | 'secondary' | 'secondary-alt' | 'danger';
  size: 'xs' | 's' | 'base' | 'lg' | 'xl';
  className?: string;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, AnchorButtonProps {}

export interface AnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement>, AnchorButtonProps {
  disabled?: boolean;
}

export interface LinkButtonProps extends AnchorButtonProps, LinkProps {
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'reset' | 'button' | 'submit',
}

export const Anchor: React.FC<AnchorProps> = (
  {
    children,
    theme = 'primary',
    size = 'base',
    className,
    disabled,
    href,
    ...restProps
  }: AnchorProps,
  ref: RefObject<HTMLAnchorElement>,
) => (
  <a
    href={href}
    className={cx({
      'flex items-center justify-center rounded-4xl focus:outline-blue': true,
      [THEME[theme]]: true,
      [SIZE[size]]: true,
      [className]: !!className,
      'opacity-50 pointer-events-none': disabled,
    })}
    ref={ref}
    {...restProps}
  >
    {children}
  </a>
);

export const AnchorForward = React.forwardRef<typeof Anchor, AnchorProps>(Anchor);

export const Button: React.FC<ButtonProps> = ({
  children,
  theme = 'primary',
  size = 'base',
  className,
  disabled,
  ...restProps
}: ButtonProps) => (
  <button
    type="button"
    className={cx({
      'flex items-center justify-center rounded-4xl focus:outline-blue': true,
      [THEME[theme]]: true,
      [SIZE[size]]: true,
      [className]: !!className,
      'opacity-50 pointer-events-none': disabled,
    })}
    disabled={disabled}
    {...restProps}
  >
    {children}
  </button>
);

export const LinkButton = ({
  href, type, children, ...restProps
}: LinkButtonProps) => {
  // We consider a link button when href attribute exits
  if (href) {
    // href by default is Url object, we need to transform to a string
    const stHref = href.toString();
    // External URL should be render using <a>
    if (stHref.includes('http')) {
      // Anchor element doesn't support disabled attribute
      // https://www.w3.org/TR/2014/REC-html5-20141028/disabled-elements.html
      if (restProps.disabled) {
        return (
          <span {...restProps}>{children}</span>
        );
      }
      return (<Anchor href={stHref} {...restProps} />);
    }
    // AnchorForward when component is inside Link
    // https://nextjs.org/docs/api-reference/next/link#if-the-child-is-a-function-component
    return (
      <Link href={href} passHref>
        <AnchorForward {...restProps}>{children}</AnchorForward>
      </Link>
    );
  }
  return <Button type={type} {...restProps}>{children}</Button>;
};

export default LinkButton;
