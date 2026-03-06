import React from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

type Variant = "primary" | "secondary";

type BaseProps = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonProps = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
  };

type AnchorProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a" | "a-hash";
    href: string;
  };

type Props = ButtonProps | AnchorProps;

export function Button(props: Props) {
  const { children, variant = "primary", className = "", ...rest } = props;

  const baseStyles =
    "px-8 py-3 rounded-md font-bold transition-all duration-200 text-lg shadow-lg inline-flex items-center gap-1.5 border hover:-translate-y-0.5 hover:shadow-xl";

  const variants: Record<Variant, string> = {
    primary: "bg-green-600 text-black rounded-md border-transparent",
    secondary:
      "bg-transparent text-[#bababa] border-[#3d3a37] hover:border-green-600 hover:text-green-600",
  };

  const classes = `${baseStyles} ${variants[variant]} ${className}`;

  if (props.as === "a") {
    const { href, ...anchorProps } = rest as AnchorProps;

    return (
      <Link to={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  if (props.as === "a-hash") {
    const { href, ...anchorProps } = rest as AnchorProps;

    return (
      <HashLink to={href} className={classes} {...anchorProps}>
        {children}
      </HashLink>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
