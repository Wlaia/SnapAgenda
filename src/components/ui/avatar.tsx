"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarContextValue = {
    status: "loading" | "error" | "loaded"
    setStatus: (status: "loading" | "error" | "loaded") => void
}

const AvatarContext = React.createContext<AvatarContextValue | null>(null)

const Avatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const [status, setStatus] = React.useState<"loading" | "error" | "loaded">("loading")

    return (
        <AvatarContext.Provider value={{ status, setStatus }}>
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    className
                )}
                {...props}
            />
        </AvatarContext.Provider>
    )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, ...props }, ref) => {
    const context = React.useContext(AvatarContext)

    React.useEffect(() => {
        if (!src) {
            context?.setStatus("error")
            return
        }

        const img = new Image()
        img.src = src
        img.onload = () => context?.setStatus("loaded")
        img.onerror = () => context?.setStatus("error")
        return () => {
            img.onload = null
            img.onerror = null
        }
    }, [src, context])

    // Only render the image if it has successfully loaded
    if (context?.status !== "loaded") return null

    return (
        <img
            ref={ref}
            src={src}
            className={cn("aspect-square h-full w-full", className)}
            {...props}
        />
    )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const context = React.useContext(AvatarContext)

    // Render fallback if image is not loaded yet (loading or error)
    if (context?.status === "loaded") return null

    return (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-muted",
                className
            )}
            {...props}
        />
    )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
