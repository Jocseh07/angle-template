"use client";

import type { ComponentProps, ReactNode } from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";

export function ActionButton({
	action,
	requireAreYouSure = true,
	areYouSureDescription = "This action cannot be undone.",
	...props
}: ComponentProps<typeof Button> & {
	action: () => Promise<{ error: boolean; message?: string }>;
	requireAreYouSure?: boolean;
	areYouSureDescription?: ReactNode;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, startTransition] = useTransition();

	function performAction() {
		startTransition(async () => {
			const data = await action();
			if (data.error) {
				toast.error(data.message ?? "Error");
			} else {
				setIsOpen(false);
			}
		});
	}

	if (requireAreYouSure) {
		return (
			<AlertDialog
				open={isOpen}
				onOpenChange={(open) => !isLoading && setIsOpen(open)}
			>
				<AlertDialogTrigger>
					<Button {...props} />
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							{areYouSureDescription}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={isLoading}
							onClick={performAction}
							className={buttonVariants({
								variant:
									props.variant === "destructive" ? "destructive" : "default",
							})}
						>
							<LoadingSwap isLoading={isLoading}>Yes</LoadingSwap>
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	}

	return (
		<Button
			{...props}
			disabled={props.disabled ?? isLoading}
			onClick={(e) => {
				performAction();
				props.onClick?.(e);
			}}
		>
			<LoadingSwap
				isLoading={isLoading}
				className="inline-flex items-center gap-2"
			>
				{props.children}
			</LoadingSwap>
		</Button>
	);
}
