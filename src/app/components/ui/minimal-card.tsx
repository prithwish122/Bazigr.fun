import * as React from "react"
import { cn } from "../../lib/utils"

const MinimalCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "bg-white/5 backdrop-blur-xl",
        "border border-white/10",
        "transition-all duration-300",
        "hover:bg-white/10 hover:border-white/20",
        className,
      )}
      {...props}
    />
  ),
)
MinimalCard.displayName = "MinimalCard"

const MinimalCardImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, alt, ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn(
        "w-full h-48 object-cover",
        "transition-transform duration-300",
        "group-hover:scale-105",
        className,
      )}
      {...props}
    />
  ),
)
MinimalCardImage.displayName = "MinimalCardImage"

const MinimalCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-xl font-semibold text-white", "mb-2", className)} {...props} />
  ),
)
MinimalCardTitle.displayName = "MinimalCardTitle"

const MinimalCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-400", "leading-relaxed", className)} {...props} />
  ),
)
MinimalCardDescription.displayName = "MinimalCardDescription"

export { MinimalCard, MinimalCardImage, MinimalCardTitle, MinimalCardDescription }
