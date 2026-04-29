import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  fullWidth?: boolean
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'ui-btn ui-btn--primary',
  secondary: 'ui-btn ui-btn--secondary',
  ghost: 'ui-btn ui-btn--ghost',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'ui-btn--sm',
  md: 'ui-btn--md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const width = fullWidth ? ' ui-btn--block' : ''
  return (
    <button
      type={type}
      className={`${variantClass[variant]} ${sizeClass[size]}${width} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  )
}
