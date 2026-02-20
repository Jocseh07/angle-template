import type * as React from "react";
import { cn } from "@/lib/utils";

type GlowColor = "green" | "blue" | "purple" | "amber";

const glowColorMap: Record<GlowColor, string> = {
	green: "hover:shadow-primary/20",
	blue: "hover:shadow-blue-500/20",
	purple: "hover:shadow-purple-500/20",
	amber: "hover:shadow-amber-500/20",
};

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
	glowColor?: GlowColor;
	customSize?: boolean;
}

export function GlowCard({
	glowColor = "green",
	customSize,
	className,
	children,
	...props
}: GlowCardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl border border-border/50 bg-card transition-shadow duration-300 hover:shadow-lg",
				glowColorMap[glowColor],
				!customSize && "p-6",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
