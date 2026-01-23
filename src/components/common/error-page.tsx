import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { AlertTriangleIcon } from "lucide-react";
import { CopyButton } from "@/components/animate-ui/components/buttons/copy";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";

type ErrorPageProps = {
	title?: string;
	description?: string;
	showDetails?: boolean;
} & Pick<ErrorComponentProps, "error" | "reset">;

function getMessage(error: unknown) {
	if (error instanceof Error) return error.message;

	if (typeof error === "string") return error;

	try {
		return JSON.stringify(error);
	} catch {
		return "Unknown error";
	}
}

export function ErrorPage({
	title = "Something went wrong",
	description = "Please try again. If the issue persists, contact support.",
	showDetails = import.meta.env.DEV,
	error,
	reset,
}: ErrorPageProps) {
	const router = useRouter();
	const errorText = getMessage(error);

	return (
		<div className="app-container flex flex-1 items-center justify-center px-4 py-10">
			<Empty className="w-full max-w-2xl">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<AlertTriangleIcon className="size-4" />
					</EmptyMedia>
					<EmptyTitle className="text-base">{title}</EmptyTitle>
					<EmptyDescription>{description}</EmptyDescription>
				</EmptyHeader>

				<EmptyContent>
					<div className="flex flex-wrap items-center justify-center gap-2">
						<Button
							onClick={() => {
								reset();
							}}
						>
							Try again
						</Button>
						<Button
							variant="outline"
							onClick={async () => {
								await router.invalidate();
							}}
						>
							Reload
						</Button>
					</div>

					{showDetails ? (
						<div className="flex flex-col items-center justify-center gap-3">
							<CopyButton
								content={errorText}
								variant="ghost"
								size="default"
								delay={1500}
								title="Copy error details"
							/>

							<div className="w-full max-w-xl rounded-md border bg-muted/30 p-3 text-left">
								<div className="text-xs font-medium">Error details</div>
								<pre className="mt-2 max-h-64 overflow-auto text-xs text-muted-foreground">
									{errorText}
								</pre>
							</div>
						</div>
					) : null}
				</EmptyContent>
			</Empty>
		</div>
	);
}
